import { db } from '../config/firebase.js';
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

// Create a new voucher task
// TODO: setup firebase storage for image uploading
export const createTask = async (req, res) => {
  const { value, taskName } = req.body;

  const intValue = parseInt(value, 10); // Convert to integer

  // Validation: Check if value is a positive integer
  if (isNaN(intValue) || intValue <= 0) {
      return res.status(400).json({ error: 'Value must be a positive integer.' });
  }

  // Validation: Check if taskName is not empty
  if (!taskName || !taskName.trim()) {
      return res.status(400).json({ error: 'Task name cannot be empty.' });
  }

  try {
      const newTask = {
          voucherTaskId: null,
          value: intValue,
          taskName: taskName.trim(),
          userId: null,
          claimStatus: false,
          distributedStatus: false,
          updatedAt: null,
          createdAt: new Date(),
      };

      const taskRef = await addDoc(collection(db, 'voucher_tasks'), newTask);
      newTask.voucherTaskId = taskRef.id;

      res.status(201).json(newTask);
  } catch (error) {
      res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
};

// View all tasks
export const viewTasks = async (req, res) => {
  try {
      const snapshot = await getDocs(collection(db, 'voucher_tasks'));
      const tasks = snapshot.docs.map(doc => ({
          voucherTaskId: doc.id,
          ...doc.data(),
      }));
      res.status(200).json(tasks);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tasks', details: error.message });
  }
};

// View all tasks that are not claimed
export const viewTasksNotClaimed = async (req, res) => {
  try {
      const snapshot = await getDocs(collection(db, 'voucher_tasks'));
      const tasksNotClaimed = snapshot.docs
          .map(doc => ({ voucherTaskId: doc.id, ...doc.data() }))
          .filter(task => !task.claimStatus); // Filter for tasks that are not claimed

      // Check if the list is empty
      if (tasksNotClaimed.length === 0) {
        return res.status(200).json({ message: 'No unclaimed tasks available.' });
      }
      res.status(200).json(tasksNotClaimed);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tasks', details: error.message });
  }
};

// View all tasks that are claimed
export const viewTasksClaimed = async (req, res) => {
  try {
      const snapshot = await getDocs(collection(db, 'voucher_tasks'));
      const tasksClaimed = snapshot.docs
          .map(doc => ({ voucherTaskId: doc.id, ...doc.data() }))
          .filter(task => task.claimStatus); // Filter for tasks that are claimed
      if (tasksClaimed.length === 0) {
        return res.status(200).json({ message: 'No claimed tasks available.' });
      }
      res.status(200).json(tasksClaimed);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve tasks', details: error.message });
  }
};

// View a specific task by ID
export const viewTaskByID = async (req, res) => {
  const { voucherTaskId } = req.params;

  try {
      const taskRef = doc(db, 'voucher_tasks', voucherTaskId);
      const taskSnapshot = await getDoc(taskRef);

      if (!taskSnapshot.exists()) {
          return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ voucherTaskId: taskSnapshot.id, ...taskSnapshot.data() });
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve task', details: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
    const { voucherTaskId } = req.params;
    const { value, taskName } = req.body;

    // Validate that at least one field is provided for update
    if (value === undefined && taskName === undefined) {
        return res.status(400).json({ error: 'At least one of value or taskName is required' });
    }

    // Validate the value if provided
    if (value !== undefined) {
        const intValue = parseInt(value, 10); // Convert to integer
        if (isNaN(intValue) || intValue <= 0) {
            return res.status(400).json({ error: 'Value must be a positive integer.' });
        }
    }

    // Validate the taskName if provided
    if (taskName !== undefined) {
        if (!taskName || !taskName.trim()) {
            return res.status(400).json({ error: 'Task name cannot be empty.' });
        }
    }

    try {
        const taskRef = doc(db, 'voucher_tasks', voucherTaskId);
        const taskSnapshot = await getDoc(taskRef);

        // Check if task exists
        if (!taskSnapshot.exists()) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Prepare updates
        const updates = {
            ...(value !== undefined && { value: parseInt(value, 10) }),  // Add validated value if provided
            ...(taskName !== undefined && { taskName: taskName.trim() }),  // Add validated taskName if provided
            updatedAt: new Date(),  // Add updatedAt timestamp
        };

        await updateDoc(taskRef, updates);
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
};

// Delete a task
export const deleteTask = async (req, res) => {
  const { voucherTaskId } = req.params;
  try {
      const taskRef = doc(db, 'voucher_tasks', voucherTaskId);
      await deleteDoc(taskRef);
      res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
};

// Resident claim a task
export const claimTask = async (req, res) => {
  const { voucher_task_id, userId } = req.params;

  try {
      // Check if the userId exists in the residents collection
      const residentRef = doc(db, 'residents', userId);
      const residentSnapshot = await getDoc(residentRef);

      if (!residentSnapshot.exists()) {
          return res.status(404).json({ error: 'User ID does not exist in residents collection' });
      }

      // Check if the voucher_task_id exists in the voucher_tasks collection
      const taskRef = doc(db, 'voucher_tasks', voucher_task_id);
      const taskSnapshot = await getDoc(taskRef);

      if (!taskSnapshot.exists()) {
          return res.status(404).json({ error: 'Task not found' });
      }

      // Proceed to claim the task
      await updateDoc(taskRef, {
          userId,
          claimStatus: true,
      });

      res.status(200).json({ message: 'Task claimed successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to claim task', details: error.message });
  }
};

/*
// Approve voucher
export const approveVoucher = async (req, res) => {
  const { voucherTaskId } = req.params;

  try {
      // Get the voucher task
      const taskRef = doc(db, 'voucher_tasks', voucherTaskId);
      const taskSnapshot = await getDoc(taskRef);

      if (!taskSnapshot.exists()) {
          return res.status(404).json({ error: 'Voucher task not found' });
      }

      const taskData = taskSnapshot.data();
      const { userId, value } = taskData;

      // Update the resident's voucher balance
      const residentRef = doc(db, 'residents', userId);
      await updateDoc(residentRef, {
          voucherBalance: increment(value), // Increment the voucher balance by the value of the voucher
      });

      // Update distributed status of the voucher task
      await updateDoc(taskRef, {
          distributedStatus: true,
      });

      res.status(200).json({ message: 'Voucher approved and balance updated' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to approve voucher', details: error.message });
  }
};

// Reject voucher
export const rejectVoucher = async (req, res) => {
  const { id } = req.params;

  try {
      const taskRef = doc(db, 'voucher_tasks', id);
      await updateDoc(taskRef, {
          userId: null, // Revert userId to null
          distributedStatus: false, // Optional: Set distributedStatus back to false
      });
      res.status(200).json({ message: 'Voucher rejected and user ID reverted' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to reject voucher', details: error.message });
  }
};

// Earn voucher (mock implementation)
export const earnVoucher = async (req, res) => {
  const { id } = req.params;
  // Logic to earn a voucher can be added here
  res.status(200).json({ message: 'Voucher earned' });
};

*/
