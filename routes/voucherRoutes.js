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
router.get('/viewtask/:voucherTaskId', viewTaskByID);
router.get('/viewtasks/notclaimed', viewTasksNotClaimed);
router.get('/viewtasks/claimed', viewTasksClaimed);
router.put('/update/:voucherTaskId', updateTask);
router.delete('/delete/:voucherTaskId', deleteTask);

// Claim / Unclaim Task
router.patch('/claim/:voucherTaskId/:userId', claimTask);
router.patch('/unclaim/:voucherTaskId/:userId', unclaimTask);

// // Notify Admin
// router.post('/notify/:id', notifyAdmin);

// Approve / Unapprove / Reject Task
router.patch('/approve/:voucherTaskId', approveVoucher);
router.patch('/unapprove/:voucherTaskId', unapproveVoucher);
router.patch('/reject/:voucherTaskId', rejectVoucher);

export default router;
