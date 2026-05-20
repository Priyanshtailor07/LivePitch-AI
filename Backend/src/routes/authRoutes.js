import express from 'express';

import {googleAuthHandler} from '../controllers/authControllers.js';

const router = express.Router();

router.post('/google',googleAuthHandler);

export default router;