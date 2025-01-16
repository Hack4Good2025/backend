import express from 'express';
import {
    createResident,
    getResidentById,
    getAllResidents,
    updateResident,
    updateResidentVoucherBalance,
    deleteResident,
    requestPasswordReset,
    resetResidentPassword,
    getUserIdFromName,
    loginUser
} from '../controllers/residentController.js';

const router = express.Router();

// Resident Routes
router.post('/create', createResident);
router.get('/get/all', getAllResidents);
router.get('/get/id', getResidentById);
router.get('/get/name', getUserIdFromName);
router.put('/update', updateResident);
router.put('/update/balance', updateResidentVoucherBalance);
router.delete('/delete', deleteResident);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetResidentPassword);

// User login
router.post('/login', loginUser);

export default router;
