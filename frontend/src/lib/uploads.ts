/**
 * Which files can be attached to a request (screen 09 and the reply box).
 * The backend checks every file again (backend/src/uploads/upload-rules.ts,
 * keep the two lists in step); this copy only warns before sending.
 */

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".csv",
  ".txt",
  ".zip",
];

/** For <input type="file" accept=…>. */
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.join(",");

/** What is wrong with this file, or "" when it can be attached. */
export function fileProblem(file: { name: string; size: number }): string {
  const dot = file.name.lastIndexOf(".");
  const extension = dot > 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `"${file.name}" can't be attached: use a picture, PDF, Office, CSV, text or ZIP file.`;
  }
  if (file.size === 0) return `"${file.name}" can't be attached: it is empty.`;
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" can't be attached: it is larger than 10 MB.`;
  }
  return "";
}

/**
 * Adds newly picked files to the list: skips files already in it and stops
 * at five. Returns the new list and a message about anything left out.
 */
export function addFiles<F extends { name: string; size: number }>(
  current: F[],
  picked: F[],
): { files: F[]; error: string } {
  const files = [...current];
  let error = "";
  for (const file of picked) {
    if (files.some((f) => f.name === file.name && f.size === file.size)) {
      continue;
    }
    const problem = fileProblem(file);
    if (problem) {
      error = problem;
      continue;
    }
    if (files.length >= MAX_FILES) {
      error = `You can attach up to ${MAX_FILES} files.`;
      break;
    }
    files.push(file);
  }
  return { files, error };
}
