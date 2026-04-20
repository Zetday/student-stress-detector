import { Router } from 'express';
import { updateInfo, updatePassword } from '../controller/profile-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { updateInfoSchema, updatePasswordSchema } from '../validator/schema.js';

const router = Router();

router.put('/info', authenticateToken, validate(updateInfoSchema), updateInfo);
router.put('/password', authenticateToken, validate(updatePasswordSchema), updatePassword);

export default router;
