import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getProfile,
  updateInfo,
  updatePassword,
  uploadProfilePicture,
} from '../controller/profile-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { updateInfoSchema, updatePasswordSchema } from '../validator/schema.js';
import { upload } from '../../uploads/storage/storage-config.js';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 image uploads per windowMs
  message: { status: 'fail', message: 'Terlalu banyak permintaan unggah gambar, coba lagi nanti.' }
});

router.get('/me', authenticateToken, getProfile);
router.put('/info', authenticateToken, validate(updateInfoSchema), updateInfo);
router.put(
  '/password',
  authenticateToken,
  validate(updatePasswordSchema),
  updatePassword,
);
router.put(
  '/picture',
  authenticateToken,
  uploadLimiter,
  upload.single('profilePicture'),
  uploadProfilePicture,
);

export default router;
