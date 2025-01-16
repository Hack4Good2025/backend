import express from 'express';
import {
    createTask,
    viewTasks,
    viewTaskByID,
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

// Task Management
router.post('/create', createTask);
router.get('/viewtasks', viewTasks);
router.get('/viewtask/id', viewTaskByID);
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
