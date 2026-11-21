import { randomUUID } from 'node:crypto';
import { createReadStream, type ReadStream } from 'node:fs';
import { mkdir, open, rename, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { checkFile, HEAD_BYTES } from './upload-rules.js';

/** A file as the upload reader (multer) leaves it: in the temporary folder. */
export type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  /** Where it was saved for now. */
  path: string;
};

/** A file that passed the checks and is ready to keep. */
export type CheckedFile = {
  tempPath: string;
  fileName: string;
  contentType: string;
  size: number;
};

/** The upload folder from UPLOAD_DIR, as a full path. */
export function uploadRoot(uploadDir: string): string {
  return path.resolve(process.cwd(), uploadDir);
}

/** Where the upload reader saves files while a request is being handled. */
export function uploadTempDir(uploadDir: string): string {
  return path.join(uploadRoot(uploadDir), 'tmp');
}

/**
 * Uploaded files on the server disk (UPLOAD_DIR), outside the website
 * folders, so the web server can never serve them. They are read back only
 * through the backend, after a permission check.
 *
 *   requests/<request id>/<random id>   a kept file (no name, no extension)
 *   tmp/                                files while a request is handled
 */
@Injectable()
export class FileStorageService {
  private readonly root: string;
  private readonly logger = new Logger(FileStorageService.name);

  constructor(config: ConfigService<Env, true>) {
    this.root = uploadRoot(config.get('UPLOAD_DIR'));
  }

  /**
   * Checks every file (upload-rules.ts). If one fails, none is kept and the
   * answer names the file and the reason.
   */
  async check(files: UploadedFile[]): Promise<CheckedFile[]> {
    const checked: CheckedFile[] = [];
    for (const file of files) {
      const head = await readHead(file.path);
      const result = checkFile({
        name: file.originalname,
        browserType: file.mimetype,
        size: file.size,
        head,
      });
      if (!result.ok) {
        await this.discard(files);
        throw new BadRequestException({
          code: 'FILE_NOT_ACCEPTED',
          message: `"${file.originalname}" can't be attached: ${result.reason}.`,
        });
      }
      checked.push({
        tempPath: file.path,
        fileName: result.fileName,
        contentType: result.contentType,
        size: file.size,
      });
    }
    return checked;
  }

  /** Moves checked files to the request's folder. Returns their storage keys. */
  async keep(files: CheckedFile[], requestId: string): Promise<string[]> {
    return this.keepIn(files, `requests/${requestId}`);
  }

  /** The same for another folder: `projects/<project id>` for updates. */
  async keepIn(files: CheckedFile[], folder: string): Promise<string[]> {
    if (!files.length) return [];
    await mkdir(this.resolve(folder), { recursive: true });
    const keys: string[] = [];
    try {
      for (const file of files) {
        const key = `${folder}/${randomUUID()}`;
        await rename(file.tempPath, this.resolve(key));
        keys.push(key);
      }
    } catch (error) {
      await this.remove(keys);
      throw error;
    }
    return keys;
  }

  /** Deletes kept files, for when saving the request failed after all. */
  async remove(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map((key) =>
        rm(this.resolve(key), { force: true }).catch((error: unknown) =>
          this.logger.warn(`Could not delete ${key}: ${String(error)}`),
        ),
      ),
    );
  }

  /** Deletes files still in the temporary folder. Never fails. */
  async discard(files: Pick<UploadedFile, 'path'>[]): Promise<void> {
    await Promise.all(
      files.map((file) => unlink(file.path).catch(() => undefined)),
    );
  }

  /** Reads a kept file. */
  read(key: string): ReadStream {
    return createReadStream(this.resolve(key));
  }

  /** The full path of a storage key, never outside the upload folder. */
  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) {
      throw new Error(`Storage key outside the upload folder: ${key}`);
    }
    return full;
  }
}

async function readHead(filePath: string): Promise<Buffer> {
  const handle = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(HEAD_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, HEAD_BYTES, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}
