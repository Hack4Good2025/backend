import { db } from '../config/firebase.js'; // Import Firestore database instance
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs} from 'firebase/firestore';
import bcrypt from 'bcrypt';

// Create a new resident
export const createResident = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Function to generate a memorable userId (6 characters)
        const generateUserId = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let userId = '';
          for (let i = 0; i < 6; i++) {
              userId += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return userId;
      };

        const residentsRef = collection(db, 'residents');
        const userId = generateUserId();

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // TODO: include voucherBalance
        const newResident = {
            userId,
            name,
            passwordHash,
            transactionHistory: [],
            preOrderRequests: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            voucherBalance: 0
        };

        // Save to Firestore using userId as the document ID
        await setDoc(doc(residentsRef, userId), newResident);

        return res.status(201).json({ message: 'Resident created successfully', userId });
    } catch (error) {
        console.error('Error creating resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a resident by userId
export const getResidentById = async (req, res) => {
    try {
        const { userId } = req.params;
        const residentRef = doc(db, 'residents', userId);
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
        const { userId } = req.params;
        const updatedData = req.body;

        const residentRef = doc(db, 'residents', userId);
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
        const { userId } = req.params;
        const residentRef = doc(db, 'residents', userId);
        await deleteDoc(residentRef);

        return res.status(200).json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get UserId from Name
export const getUserIdByName = async (req, res) => {
    try {
        console.log("Function called");
        const { name } = req.query;
        console.log(`Searching for residents with name: ${name}`);

        if (!name) {
            console.log("Name parameter is missing");
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const residentsRef = collection(db, 'residents');
        const nameQuery = query(residentsRef, where("name", "==", name));
        const querySnapshot = await getDocs(nameQuery);

        if (querySnapshot.empty) {
            console.log("No residents found with this name");
            return res.status(404).json({ success: false, message: 'No residents found with this name' });
        }

        // Map through the results to extract name and userId
        const results = querySnapshot.docs.map(doc => ({
            name: doc.data().name,
            userId: doc.data().userId,
        }));

        console.log("Residents found:", results);
        return res.status(200).json({ success: true, residents: results });
    } catch (error) {
        console.error('Error fetching residents by name:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { name, userId } = req.body;

        // Check if the resident exists by name and userId
        const residentsRef = collection(db, 'residents');
        const residentDoc = await getDoc(doc(residentsRef, userId));

        if (!residentDoc.exists() || residentDoc.data().name !== name) {
            return res.status(404).json({ message: 'Resident not found or name does not match.' });
        }

        // Save the password change request in the "password_reset" collection
        const requestsRef = collection(db, 'password_reset');
        const requestId = `${userId}_${Date.now()}`; // Create a unique ID for the request
        await setDoc(doc(requestsRef, requestId), {
            requestId,
            userId,
            name,
            createdAt: new Date(),
            status: 'pending',
        });

        return res.status(200).json({ message: 'Password change request sent to admins successfully' });
    } catch (error) {
        console.error('Error sending password change request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Reset resident's password
export const resetResidentPassword = async (req, res) => {
    try {
        const { userId, newPassword, requestId } = req.body;

        // Hash the new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update the resident's password in the residents collection
        const residentsRef = collection(db, 'residents');
        const residentDoc = await getDoc(doc(residentsRef, userId));

        if (!residentDoc.exists()) {
            return res.status(404).json({ message: 'Resident not found.' });
        }

        await updateDoc(doc(residentsRef, userId), { passwordHash });

        // Delete the password change request from the "password_reset" collection
        const requestsRef = collection(db, 'password_reset');
        await deleteDoc(doc(requestsRef, requestId)); // Use the requestId passed in the body

        return res.status(200).json({ message: 'Password updated successfully and request removed.' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginResident = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required.' });
  }

  try {
      const residentsRef = collection(db, 'residents');
      const userIdQuery = query(residentsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(userIdQuery);

      if (querySnapshot.empty) {
          return res.status(404).json({ message: 'No resident found with this user ID.' });
      }

      // Since userId is unique, we can directly access the resident data
      const residentData = querySnapshot.docs[0].data();
      const isMatch = await bcrypt.compare(password, residentData.passwordHash);

      if (isMatch) {
          return res.status(200).json({ message: 'Login successful', userId: residentData.userId });
      } else {
          return res.status(401).json({ message: 'Incorrect password.' });
      }
  } catch (error) {
      console.error('Error logging in resident:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};
