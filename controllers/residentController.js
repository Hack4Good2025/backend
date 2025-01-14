import { db } from '../config/firebase.js';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import bcrypt from 'bcrypt';

// Create a new resident
export const createResident = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the email already exists
        const residentsRef = collection(db, 'residents');
        const existingDoc = await getDoc(doc(residentsRef, email));

        if (existingDoc.exists()) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the resident
        const newResident = {
            userId: email, // Use email or generate a unique ID
            name,
            email,
            passwordHash,
            transactionHistory: [],
            preOrderRequests: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Save to Firestore
        await setDoc(doc(residentsRef, email), newResident);

        return res.status(201).json({ message: 'Resident created successfully', userId: newResident.userId });
    } catch (error) {
        console.error('Error creating resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a resident by ID (using email as the unique ID)
export const getResidentById = async (req, res) => {
    try {
        const { email } = req.params;
        const residentRef = doc(db, 'residents', email);
        const residentSnap = await getDoc(residentRef);

        if (!residentSnap.exists()) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        return res.status(200).json(residentSnap.data());
    } catch (error) {
        console.error('Error fetching resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a resident
export const updateResident = async (req, res) => {
    try {
        const { email } = req.params;
        const updatedData = req.body;

        const residentRef = doc(db, 'residents', email);
        await updateDoc(residentRef, updatedData);

        return res.status(200).json({ message: 'Resident updated successfully' });
    } catch (error) {
        console.error('Error updating resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a resident
export const deleteResident = async (req, res) => {
    try {
        const { email } = req.params;
        const residentRef = doc(db, 'residents', email);
        await deleteDoc(residentRef);

        return res.status(200).json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Request password reset (not implemented)
export const requestPasswordReset = async (req, res) => {
    // Logic to send a password reset email goes here
};

// Reset resident's password
export const resetPassword = async (req, res) => {
    try {
        const { email } = req.params;
        const { newPassword } = req.body;

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const residentRef = doc(db, 'residents', email);
        await updateDoc(residentRef, { passwordHash });

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
