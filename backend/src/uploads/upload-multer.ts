import { ConfigService } from '@nestjs/config';
import {
  MulterModule,
  type MulterModuleOptions,
} from '@nestjs/platform-express';
import type { Env } from '../config/env.js';
import { uploadTempDir } from './file-storage.service.js';
import { MAX_FILE_BYTES, MAX_FILES } from './upload-rules.js';

/**
 * For a module whose routes take files (requests, project updates): files
 * are written to UPLOAD_DIR/tmp while a request is handled (not kept in
 * memory: the hosting has little), then checked and moved.
 */
export const uploadMulter = () =>
  MulterModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env, true>) => {
      const options: MulterModuleOptions & { defParamCharset: string } = {
        dest: uploadTempDir(config.get('UPLOAD_DIR')),
        limits: {
          fileSize: MAX_FILE_BYTES,
          files: MAX_FILES,
          fields: 20,
          fieldSize: 64 * 1024,
        },
        // File names with accents or other scripts arrive intact.
        defParamCharset: 'utf8',
      };
      return options;
    },
  });
