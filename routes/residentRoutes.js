import express from 'express';
import {
    createResident,
    getResidentById,
    updateResident,
    deleteResident,
    requestPasswordReset,
    resetResidentPassword
} from '../controllers/residentController.js';

const router = express.Router();

// Create a new resident
router.post('/', createResident);

// Get a resident by userId
router.get('/:userId', getResidentById);

// Update a resident
router.put('/:userId', updateResident);

// Delete a resident
router.delete('/:userId', deleteResident);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset resident's password
router.post('/reset-password', resetResidentPassword);

export default router;
