import express from 'express';
import multer from 'multer';

import {
    createProduct,
    viewProduct,
    viewAllProducts,
    updateProductDetails,
    updateProductStock,
    addProductStock,
    deleteProduct,
    generateInventoryReport,
    generateReport,
    downloadReport,
    fetchLatestReport,
} from '../controllers/adminTransactionController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for upload

// Admin Routes for Product Management
router.post('/products/create', createProduct);
router.get('/products/view/id', viewProduct);
router.get('/products/view/all', viewAllProducts);
router.put('/products/update/details', updateProductDetails);
router.put('/products/update/stock', updateProductStock);
router.put('/products/update/addstock', addProductStock)
router.delete('/products/delete', deleteProduct);

// Admin Routes for Inventory Management
router.get('/inventory/report', generateInventoryReport);
router.post('/inventory/report/generate', generateReport);
router.get('/inventory/report/download', downloadReport);
router.get('/inventory/report/fetchlatest', fetchLatestReport)

// TODO: automated weekly report generator

export default router;
