import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import ClientError from '../../../exceptions/client-error.js';

export const UPLOAD_FOLDER = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR,
);

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

/** Allowed image MIME types */
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Safe mapping of MIME types to actual extensions */
const MIME_TYPE_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** Build a safe, unique filename based ONLY on the verified MIME type */
export const buildFilename = (mimetype) => {
  const ext = MIME_TYPE_MAP[mimetype] || '.bin';
  return `${nanoid(16)}${ext}`;
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ClientError('Only image files are allowed (jpeg, png, webp)'),
        false,
      );
    }
  },
});

export const deleteUploadedFile = async (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOAD_FOLDER, filename);
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Failed to delete file "${filename}":`, err);
    }
  }
};

export default { UPLOAD_FOLDER, storage, upload, deleteUploadedFile };
