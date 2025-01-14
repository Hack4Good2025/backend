import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js'; // Adjust the path as necessary
import residentRoutes from './routes/residentRoutes.js'; // Import resident routes
import { db } from './config/firebase.js'; // Import Firebase configuration if needed

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/residents', residentRoutes); // Mount resident routes

// Test endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
