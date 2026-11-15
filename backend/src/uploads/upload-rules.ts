/**
 * Which files customers and the team may attach (docs/01: "limit type and
 * size"). Each file is checked three ways:
 *   1. its name ends in an allowed extension;
 *   2. the browser's type for it is one we expect for that extension;
 *   3. its first bytes look like that kind of file, so a program renamed to
 *      "photo.png" is refused.
 * The type we store and send back is ours, never the browser's.
 *
 * The website has the same list in frontend/src/lib/uploads.ts, to warn
 * before sending. Keep the two in step.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 5;

type Kind = {
  extensions: string[];
  contentType: string;
  /** Other types browsers send for this kind of file. */
  browserTypes: string[];
  looksRight: (head: Buffer) => boolean;
};

const startsWith = (head: Buffer, bytes: number[], at = 0) =>
  bytes.every((byte, i) => head[at + i] === byte);
const ascii = (text: string) => Array.from(Buffer.from(text, 'latin1'));

const zip = (head: Buffer) =>
  startsWith(head, [0x50, 0x4b, 0x03, 0x04]) ||
  startsWith(head, [0x50, 0x4b, 0x05, 0x06]);
// Word, Excel and PowerPoint files from before 2007.
const oldOffice = (head: Buffer) =>
  startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
// Text: no zero bytes in the part we read.
const text = (head: Buffer) => !head.includes(0);

const OFFICE = 'application/vnd.openxmlformats-officedocument';

const KINDS: Kind[] = [
  {
    extensions: ['.png'],
    contentType: 'image/png',
    browserTypes: [],
    looksRight: (h) =>
      startsWith(h, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    extensions: ['.jpg', '.jpeg'],
    contentType: 'image/jpeg',
    browserTypes: ['image/pjpeg'],
    looksRight: (h) => startsWith(h, [0xff, 0xd8, 0xff]),
  },
  {
    extensions: ['.gif'],
    contentType: 'image/gif',
    browserTypes: [],
    looksRight: (h) =>
      startsWith(h, ascii('GIF87a')) || startsWith(h, ascii('GIF89a')),
  },
  {
    extensions: ['.webp'],
    contentType: 'image/webp',
    browserTypes: [],
    looksRight: (h) =>
      startsWith(h, ascii('RIFF')) && startsWith(h, ascii('WEBP'), 8),
  },
  {
    extensions: ['.pdf'],
    contentType: 'application/pdf',
    browserTypes: [],
    looksRight: (h) => startsWith(h, ascii('%PDF-')),
  },
  {
    extensions: ['.docx'],
    contentType: `${OFFICE}.wordprocessingml.document`,
    browserTypes: ['application/zip'],
    looksRight: zip,
  },
  {
    extensions: ['.xlsx'],
    contentType: `${OFFICE}.spreadsheetml.sheet`,
    browserTypes: ['application/zip'],
    looksRight: zip,
  },
  {
    extensions: ['.pptx'],
    contentType: `${OFFICE}.presentationml.presentation`,
    browserTypes: ['application/zip'],
    looksRight: zip,
  },
  {
    extensions: ['.doc'],
    contentType: 'application/msword',
    browserTypes: [],
    looksRight: oldOffice,
  },
  {
    extensions: ['.xls'],
    contentType: 'application/vnd.ms-excel',
    browserTypes: [],
    looksRight: oldOffice,
  },
  {
    extensions: ['.ppt'],
    contentType: 'application/vnd.ms-powerpoint',
    browserTypes: [],
    looksRight: oldOffice,
  },
  {
    extensions: ['.csv'],
    contentType: 'text/csv',
    // Windows often calls a CSV file an Excel file.
    browserTypes: [
      'text/plain',
      'application/csv',
      'application/vnd.ms-excel',
      'text/x-csv',
    ],
    looksRight: text,
  },
  {
    extensions: ['.txt'],
    contentType: 'text/plain',
    browserTypes: [],
    looksRight: text,
  },
  {
    extensions: ['.zip'],
    contentType: 'application/zip',
    browserTypes: [
      'application/x-zip-compressed',
      'application/x-zip',
      'multipart/x-zip',
    ],
    looksRight: zip,
  },
];

/** Every allowed extension, for messages and the file picker. */
export const ALLOWED_EXTENSIONS = KINDS.flatMap((kind) => kind.extensions);

/** Types that say nothing about the file; the other checks still apply. */
const UNKNOWN_TYPES = ['', 'application/octet-stream'];

/** How many first bytes the check needs. */
export const HEAD_BYTES = 512;

export type FileCheck =
  | { ok: true; contentType: string; fileName: string }
  | { ok: false; reason: string };

/**
 * The name to keep: without folders or control characters, at most 200
 * characters, extension kept.
 */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  // eslint-disable-next-line no-control-regex
  const clean = base.replace(/[\u0000-\u001f\u007f"]/g, '').trim();
  if (clean.length <= 200) return clean || 'file';
  const dot = clean.lastIndexOf('.');
  const extension = dot > 0 ? clean.slice(dot) : '';
  return clean.slice(0, 200 - extension.length) + extension;
}

/** Checks one file. `head` is its first bytes (up to HEAD_BYTES). */
export function checkFile(file: {
  name: string;
  browserType: string;
  size: number;
  head: Buffer;
}): FileCheck {
  const fileName = cleanFileName(file.name);
  const dot = fileName.lastIndexOf('.');
  const extension = dot > 0 ? fileName.slice(dot).toLowerCase() : '';
  const kind = KINDS.find((k) => k.extensions.includes(extension));

  if (!kind) {
    return { ok: false, reason: 'this type of file is not accepted' };
  }
  if (file.size === 0) return { ok: false, reason: 'the file is empty' };
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: 'the file is larger than 10 MB' };
  }
  const browserType = file.browserType.toLowerCase().split(';')[0].trim();
  const typeFits =
    UNKNOWN_TYPES.includes(browserType) ||
    browserType === kind.contentType ||
    kind.browserTypes.includes(browserType);
  if (!typeFits || !kind.looksRight(file.head)) {
    return {
      ok: false,
      reason: `the file does not look like a ${extension.slice(1).toUpperCase()} file`,
    };
  }
  return { ok: true, contentType: kind.contentType, fileName };
}
