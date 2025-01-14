import express from 'express';
import { addSampleData, queryByName } from '../controllers/userController.js';

const router = express.Router();

// Define routes
router.post('/', addSampleData); // Add user data
router.get('/:name', queryByName); // Query user by name

export default router;
