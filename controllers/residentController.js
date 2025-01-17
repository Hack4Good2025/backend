import { db } from '../config/firebase.js';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs} from 'firebase/firestore';
import bcrypt from 'bcrypt';
import { bucket } from '../config/googleCloud.js';

// Create a new resident
export const createResident = async (req, res) => {
  try {
      const { name, password } = req.body;
      const imageFile = req.file;

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

      // Create a blob in Google Cloud Storage
      const blob = bucket.file(`images/${userId}`);
      const blobStream = blob.createWriteStream({
          metadata: {
              contentType: imageFile.mimetype,
          },
      });

      // Promise to handle the upload and get the public URL
      const uploadPromise = new Promise((resolve, reject) => {
          blobStream.on('error', (err) => {
              console.error('Error uploading image:', err);
              reject(err);
          });

          blobStream.on('finish', async () => {
              // Generate a signed URL after the upload is complete
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              const signedUrl = await getSignedUrl(blob); // Generate signed URL
              resolve({ publicUrl, signedUrl });
          });

          // Stream the file to the blob
          blobStream.end(imageFile.buffer);
      });

      // Wait for the image upload to complete
      const { signedUrl } = await uploadPromise; // Get the signed URL

      const newResident = {
          userId,
          name,
          passwordHash,
          transactionHistory: [],
          preOrderRequests: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          voucherBalance: 100, // Initial voucher balance
          image: signedUrl, // Store the signed URL
      };

      // Save to Firestore using userId as the document ID
      await setDoc(doc(residentsRef, userId), newResident);

      return res.status(201).json({ message: 'Resident created successfully', resident: newResident });
  } catch (error) {
      console.error('Error creating resident:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};


// Get all residents
export const getAllResidents = async (req, res) => {
  try {
      const residentsRef = collection(db, 'residents');
      const residentsSnap = await getDocs(residentsRef);

      if (residentsSnap.empty) {
          return res.status(404).json({ message: 'No residents found' });
      }

      const residents = [];
      residentsSnap.forEach(doc => {
          residents.push({ id: doc.id, ...doc.data() });
      });

      return res.status(200).json(residents);
  } catch (error) {
      console.error('Error fetching residents:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a resident by userId
export const getResidentById = async (req, res) => {
    try {
        const { userId } = req.body;
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

// Update a resident's details
export const updateResidentDetails = async (req, res) => {
  try {
      const { userId, name, password } = req.body;
      const imageFile = req.file;

      const residentRef = doc(db, 'residents', userId);
      const residentSnap = await getDoc(residentRef);

      if (!residentSnap.exists()) {
          return res.status(404).json({ message: 'Resident not found' });
      }

      // Prepare the data to update
      const updatedData = {};

      // Validate and update name if provided
      if (name && isValidField(name)) {
          updatedData.name = name;
      } else if (name) {
          return res.status(400).json({ message: 'Name cannot be empty or whitespace.' });
      }

      // Validate and update password if provided
      if (password && isValidField(password)) {
          updatedData.passwordHash = await bcrypt.hash(password, 10);
      } else if (password) {
          return res.status(400).json({ message: 'Password cannot be empty or whitespace.' });
      }

      // Get the current resident data to access the existing image URL
      const currentData = residentSnap.data();
      const currentImageUrl = currentData.image;

      // If an image file is provided, manage the upload and deletion
      if (imageFile) {
          // Delete the previous image
          await deleteImage(currentImageUrl);

          // Upload the new image and get the signed URL
          const imageUrl = await uploadImage(userId, imageFile);
          updatedData.image = imageUrl; // Update the image URL in the data
      }

      // Update the resident document in Firestore, only if there's anything to update
      if (Object.keys(updatedData).length > 0) {
        await updateDoc(residentRef, updatedData);
      }

      return res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
      console.error('Error updating resident:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Resident Voucher Balance
export const updateResidentVoucherBalance = async (req, res) => {
  try {
      const { userId, newVoucherBalance } = req.body;

      // Validate that newVoucherBalance is a float (can be 0 or positive)
      if (typeof newVoucherBalance !== 'number' || newVoucherBalance < 0) {
          return res.status(400).json({ message: 'New voucher balance must be a float and cannot be negative.' });
      }

      const residentRef = doc(db, 'residents', userId);
      const residentSnap = await getDoc(residentRef);

      if (!residentSnap.exists()) {
          return res.status(404).json({ message: 'Resident not found' });
      }

      // Update the resident's voucher balance
      await updateDoc(residentRef, { voucherBalance: newVoucherBalance });

      return res.status(200).json({ message: 'Voucher balance updated successfully' });
  } catch (error) {
      console.error('Error updating voucher balance:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a resident
export const deleteResident = async (req, res) => {
    try {
        const { userId } = req.body;
        const residentRef = doc(db, 'residents', userId);

        const residentSnap = await getDoc(residentRef);
        if (!residentSnap.exists()) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        await deleteDoc(residentRef);

        return res.status(200).json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get UserId from Name
export const getUserIdFromName = async (req, res) => {
    try {
        console.log("Function called");
        const { name } = req.body;
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

export const loginUser = async (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and password are required.' });
    }

    try {
        // Check if the user is admin
        if (userId === 'admin' && password === 'admin') {
            return res.status(200).json({ message: 'Login successful', isAdmin: true, userId: 'admin' });
        }

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
            return res.status(200).json({ message: 'Login successful', isAdmin: false, userId: residentData.userId });
        } else {
            return res.status(401).json({ message: 'Incorrect password.' });
        }
    } catch (error) {
        console.error('Error logging in resident:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to retrieve the resident's image
export const getResidentImage = async (req, res) => {
  const { userId } = req.params;

  try {
      // Get the file reference for the resident's image
      const fileName = `images/${userId}`;
      const file = bucket.file(fileName);

      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
          return res.status(404).json({ message: 'Image not found' });
      }

      // Generate the signed URL using the helper function
      const imageUrl = await getSignedUrl(file);

      return res.status(200).json({ imageUrl });
  } catch (error) {
      console.error('Error retrieving image:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};

/* HELPER FUNCTIONS */

// Helper function to get a signed URL
const getSignedUrl = async (file) => {
  const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Use the file object to generate the signed URL
  const [url] = await file.getSignedUrl(options);
  return url;
};

// Helper function to delete an image from Google Cloud Storage
const deleteImage = async (imageUrl) => {
    try {
        const fileName = imageUrl.split('/').pop().split('?')[0]; // Extract file name
        await bucket.file(`images/${fileName}`).delete();
        console.log(`Deleted image: ${fileName}`);
    } catch (error) {
        console.error('Error deleting previous image:', error);
    }
};

// Helper function to upload a new image and return the public URL
const uploadImage = async (userId, imageFile) => {
  return new Promise(async (resolve, reject) => {
      const blob = bucket.file(`images/${userId}`);
      const blobStream = blob.createWriteStream({
          metadata: {
              contentType: imageFile.mimetype,
          },
      });

      blobStream.on('error', (err) => {
          console.error('Error uploading image:', err);
          reject(err);
      });

      blobStream.on('finish', async () => {
          // Generate a signed URL for the uploaded image
          const signedUrl = await getSignedUrl(blob);
          resolve(signedUrl);
      });

      blobStream.end(imageFile.buffer);
  });
};

// Check if a string is non-empty, non-whitespace
const isValidField = (field) => {
  return typeof field === 'string' && field.trim() !== '';
};
