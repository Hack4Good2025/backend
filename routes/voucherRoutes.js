import express from 'express';
import multer from 'multer';
import {
    createTask,
    viewTasks,
    viewTasksByVoucherId,
    viewTasksByUserId,
    viewTasksNotClaimed,
    viewTasksClaimed,
    updateTask,
    deleteTask,
    claimTask,
    unclaimTask,
    // notifyAdmin,
    approveVoucher,
    unapproveVoucher,
    rejectVoucher,
} from '../controllers/voucherController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for upload

// Task Management
router.post('/create', createTask);
router.get('/viewtasks/all', viewTasks);
router.get('/viewtask/vouchertaskid', viewTasksByVoucherId);
router.get('/viewtasks/userid', viewTasksByUserId);
router.get('/viewtasks/notclaimed', viewTasksNotClaimed);
router.get('/viewtasks/claimed', viewTasksClaimed);
router.put('/update', updateTask);
router.delete('/delete', deleteTask);

// Claim / Unclaim Task
router.patch('/claim', claimTask);
router.patch('/unclaim', unclaimTask);

// // Notify Admin
// router.post('/notify/:id', notifyAdmin);

// Approve / Unapprove / Reject Task
router.patch('/approve', approveVoucher);
router.patch('/unapprove', unapproveVoucher);
router.patch('/reject', rejectVoucher);

export default router;
