import express from 'express';
import {
    purchaseProduct,
    viewUserTransactionHistory,
    viewAllTransactions,
    viewTransactionId,
    updatePurchaseQuantity,
    cancelPurchaseProduct,
    preOrderProducts,
} from '../controllers/residentTransactionController.js';

const router = express.Router();

// Resident Transaction Routes
router.post('/transactions/create', purchaseProduct);
router.get('/transactions/view/userHistory', viewUserTransactionHistory);
router.get('/transactions/view/all', viewAllTransactions);
router.get('/transactions/view/id', viewTransactionId);
router.put('/transactions/update', updatePurchaseQuantity);
router.delete('/transactions/cancel', cancelPurchaseProduct);

// Resident Pre-Order Routes
// router.post('/preorder', preOrderProducts);

export default router;
