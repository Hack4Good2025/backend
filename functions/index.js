import express from 'express';
import dotenv from 'dotenv';
import functions from 'firebase-functions';
import residentRoutes from './routes/residentRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import residentTransactionRoutes from './routes/residentTransactionRoutes.js';
import adminTransactionRoutes from './routes/adminTransactionRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/residents', residentRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/adminTransactions', adminTransactionRoutes);
app.use('/api/residentTransactions', residentTransactionRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API!');
});

// Export as Firebase function
export const api = functions.https.onRequest(app);
