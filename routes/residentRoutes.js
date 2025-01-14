import express from 'express';
import {
    createResident,
    getResidentById,
    updateResident,
    deleteResident,
    requestPasswordReset,
    resetResidentPassword,
    getUserIdByName
} from '../controllers/residentController.js';

const router = express.Router();

// Create a new resident
router.post('/create', createResident);

// Get a resident by userId
router.get('/get/:userId', getResidentById);

// Update a resident
router.put('/update/:userId', updateResident);

// Delete a resident
router.delete('/delete/:userId', deleteResident);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset resident's password
router.post('/reset-password', resetResidentPassword);

// Get userId(s) by name
router.get('/userIdByName', getUserIdByName);

export default router;
