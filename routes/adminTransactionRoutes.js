import express from 'express';
import {
    createProduct,
    viewProduct,
    viewAllProducts,
    updateProductDetails,
    updateProductStock,
    deleteProduct,
    generateInventoryReport,
} from '../controllers/adminTransactionController.js';

const router = express.Router();

// Admin Routes for Product Management
router.post('/products/create', createProduct);
router.get('/products/view/:productId', viewProduct);
router.get('/products/viewall', viewAllProducts);
router.put('/products/update/details/:productId', updateProductDetails);
router.put('/products/update/stock/:productId', updateProductStock);
router.delete('/products/delete/:productId', deleteProduct);

// Admin Routes for Inventory Management
// TODO: integrate inventory report with pre-order list
router.get('/inventory/report', generateInventoryReport);

// TODO: automated weekly report generator

export default router;
