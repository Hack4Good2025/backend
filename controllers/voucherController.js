import { db } from '../config/firebase.js';
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Create a new voucher task
// TODO: setup firebase storage for image uploading
export const createTask = async (req, res) => {
  // const { value, imageUrl } = req.body;
  const { value , taskName} = req.body
  try {
      const newTask = {
          value,
          taskName,
          // imageUrl,
          userId: null, // No user initially
          distributedStatus: false,
          createdAt: new Date(),
      };

      const taskRef = await addDoc(collection(db, 'voucher_tasks'), newTask);
      res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
      res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
};

// View all tasks
export const viewTasks = async (req, res) => {
  try {
      const snapshot = await getDocs(collection(db, 'voucher_tasks'));
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tasks', details: error.message });
  }
};

// View a specific task by ID
export const viewTaskByID = async (req, res) => {
  const { id } = req.params;

  try {
      const taskRef = doc(db, 'voucher_tasks', id);
      const taskSnapshot = await getDoc(taskRef);

      if (!taskSnapshot.exists()) {
          return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ id: taskSnapshot.id, ...taskSnapshot.data() });
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve task', details: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { value, taskName } = req.body;

  // Validate that at least one field is provided for update
  if (!value && !taskName) {
      return res.status(400).json({ error: 'At least one of value or taskName is required' });
  }

  try {
      const taskRef = doc(db, 'voucher_tasks', id);

      // Prepare updates
      const updates = {
          ...(value !== undefined && { value }),  // Add value if provided
          ...(taskName !== undefined && { taskName }),  // Add taskName if provided
          updatedAt: new Date(),  // Add updatedAt timestamp
      };

      await updateDoc(taskRef, updates);
      res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
};
