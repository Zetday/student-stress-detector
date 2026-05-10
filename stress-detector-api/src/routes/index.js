import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import profiles from '../services/profiles/routes/index.js';
import activities from '../services/activities/routes/index.js';

const router = Router();

router.use('/users', users);
router.use('/authentications', authentications);
router.use('/profiles', profiles);
router.use('/activities', activities);

export default router;
