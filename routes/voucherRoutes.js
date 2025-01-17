import express from 'express';
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
    approveVoucher,
    unapproveVoucher,
    rejectVoucher,
} from '../controllers/voucherController.js';

const router = express.Router();

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

// Approve / Unapprove / Reject Task
router.patch('/approve', approveVoucher);
router.patch('/unapprove', unapproveVoucher);
router.patch('/reject', rejectVoucher);

export default router;
