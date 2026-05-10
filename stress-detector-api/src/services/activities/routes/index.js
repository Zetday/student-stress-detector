import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { createActivitySchema } from '../validator/schema.js';
import authenticateToken from '../../../middlewares/auth.js';
import { createActivity, getActivities } from '../controller/activity-controller.js';

const router = Router();

router.post('/', authenticateToken, validate(createActivitySchema), createActivity);
router.get('/', authenticateToken, getActivities);

export default router;