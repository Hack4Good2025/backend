import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import residentRoutes from './routes/residentRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import residentTransactionRoutes from './routes/residentTransactionRoutes.js';
import adminTransactionRoutes from './routes/adminTransactionRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer(); // Initialize multer

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(upload.single('image')); // Handle single file uploads

// Routes
app.use('/api/residents', residentRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/adminTransactions', adminTransactionRoutes);
app.use('/api/residentTransactions', residentTransactionRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
