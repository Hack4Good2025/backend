import express from 'express';
import {
    createResident,
    getResidentById,
    getAllResidents,
    updateResidentDetails,
    updateResidentVoucherBalance,
    deleteResident,
    requestPasswordReset,
    resetResidentPassword,
    getUserIdFromName,
    loginUser,
    getResidentImage
} from '../controllers/residentController.js';

const router = express.Router();

// Resident Routes
router.post('/create', createResident);
router.get('/get/all', getAllResidents);
router.get('/get/id', getResidentById);
router.get('/get/name', getUserIdFromName);
router.put('/update/details', updateResidentDetails); // this doesn't work with upload.single('image)??
router.put('/update/balance', updateResidentVoucherBalance);
router.delete('/delete', deleteResident);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetResidentPassword);

// User login
router.post('/login', loginUser);

// Get Image
router.get('/image/:userId', getResidentImage);

export default router;
