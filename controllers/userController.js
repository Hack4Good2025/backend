import { db } from '../config/firebase.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Function to add sample user data
export const addSampleData = async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validate input
    if (!name || !email || !age) {
      return res.status(400).json({ message: 'Name, email, and age are required.' });
    }

    const userData = {
      name,
      email,
      age,
      createdAt: new Date().toISOString(),
    };

    const usersCollectionRef = collection(db, 'testing');
    const docRef = await addDoc(usersCollectionRef, userData);

    return res.status(201).json({ message: 'User added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding user: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to query users by name
export const queryByName = async (req, res) => {
  try {
    const { name } = req.params;

    const usersCollectionRef = collection(db, 'testing');
    const q = query(usersCollectionRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: `No users found with name: ${name}` });
    }

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error querying users: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
