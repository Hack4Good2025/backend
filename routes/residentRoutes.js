import express from 'express';
import {
    createResident,
    getResidentById,
    updateResident,
    deleteResident,
    requestPasswordReset,
    resetPassword
} from '../controllers/residentController.js'; // Adjust the path as necessary

const router = express.Router();

// Create a new resident
router.post('/', createResident);

// Get a resident by email (using email as an identifier)
router.get('/:email', getResidentById);

// Update a resident
router.put('/:email', updateResident);

// Delete a resident
router.delete('/:email', deleteResident);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset resident's password
router.post('/:email/reset-password', resetPassword);

export default router;
