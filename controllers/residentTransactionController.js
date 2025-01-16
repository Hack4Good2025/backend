import { db } from '../config/firebase.js';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';

// Purchase a product
export const purchaseProduct = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Validate quantity
  if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
          return res.status(404).json({ message: 'Product not found' });
      }

      const productData = productSnap.data();

      // Check stock availability (and suggest Pre-Order)
      if (productData.stock <= 0) {
          return res.status(400).json({
              message: 'Product is out of stock. Consider pre-ordering.',
              suggestPreOrder: true
          });
      }

      if (productData.stock < quantity) {
          return res.status(400).json({ message: 'Insufficient stock available' });
      }

      // Fetch resident's voucher balance
      const residentRef = doc(db, 'residents', userId);
      const residentSnap = await getDoc(residentRef);

      if (!residentSnap.exists()) {
          return res.status(404).json({ message: 'Resident not found' });
      }

      const residentData = residentSnap.data();
      const totalCost = productData.price * quantity;

      // Check voucher balance
      if (residentData.voucherBalance < totalCost) {
          return res.status(400).json({ message: 'Insufficient voucher balance' });
      }

      // Deduct the total cost from voucher balance
      const updatedVoucherBalance = residentData.voucherBalance - totalCost;

      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      const transactionData = {
          userId,
          productId,
          quantity,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
      };

      await setDoc(transactionRef, transactionData);

      // Update the resident's transaction history and voucher balance
      await updateDoc(residentRef, {
          transactionHistory: [...(await getDoc(residentRef)).data().transactionHistory, transactionRef.id],
          voucherBalance: updatedVoucherBalance, // Update the voucher balance
          updatedAt: Timestamp.now(),
      });

      // Update product stock
      await updateDoc(productRef, {
          stock: productData.stock - quantity,
          updatedAt: Timestamp.now(),
      });

      return res.status(201).json({
          message: 'Product purchased successfully',
          transactionId: transactionRef.id,
          remainingVoucherBalance: updatedVoucherBalance // Return the remaining voucher balance
      });
  } catch (error) {
      console.error('Error purchasing product: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// View resident's transaction history
export const viewUserTransactionHistory = async (req, res) => {
  const { userId } = req.body;

  try {
      const transactionsRef = collection(db, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      const transactions = transactionsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(transaction => transaction.userId === userId);

      return res.status(200).json(transactions);
  } catch (error) {
      console.error('Error fetching transaction history: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// View all transactions
export const viewAllTransactions = async (req, res) => {
    try {
        const transactionsRef = collection(db, 'transactions');
        const transactionsSnap = await getDocs(transactionsRef);

        // Map through the documents to create an array of transaction data
        const transactions = transactionsSnap.docs.map(doc => ({
            transactionId: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// View specific transaction given transactionId
export const viewTransactionId = async (req, res) => {
  const { transactionId } = req.body;

  try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
          return res.status(404).json({ message: 'Transaction not found' });
      }

      const transactionData = transactionSnap.data();

      return res.status(200).json({
          transactionId: transactionSnap.id,
          ...transactionData,
      });
  } catch (error) {
      console.error('Error fetching purchase details: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update purchase quantity
export const updatePurchaseQuantity = async (req, res) => {
    const { transactionId, newQuantity } = req.body;

    // Validate quantity
    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    try {
        const transactionRef = doc(db, 'transactions', transactionId);
        const transactionSnap = await getDoc(transactionRef);

        if (!transactionSnap.exists()) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transactionData = transactionSnap.data();
        const productRef = doc(db, 'products', transactionData.productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productData = productSnap.data();
        const stockDifference = newQuantity - transactionData.quantity;

        if (productData.stock < stockDifference) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        // Update transaction
        await updateDoc(transactionRef, { quantity: newQuantity, updatedAt: Timestamp.now() });

        // Update product stock
        await updateDoc(productRef, {
            stock: productData.stock - stockDifference,
            updatedAt: Timestamp.now(),
        });

        return res.status(200).json({ message: 'Purchase quantity updated successfully' });
    } catch (error) {
        console.error('Error updating purchase quantity: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Cancel a purchase
export const cancelPurchaseProduct = async (req, res) => {
  const { transactionId } = req.body;

  try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
          return res.status(404).json({ message: 'Transaction not found' });
      }

      const transactionData = transactionSnap.data();
      const productRef = doc(db, 'products', transactionData.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
          return res.status(404).json({ message: 'Product not found' });
      }

      const productData = productSnap.data();

      // Update product stock
      await updateDoc(productRef, {
          stock: productData.stock + transactionData.quantity,
          updatedAt: Timestamp.now(),
      });

      // Delete transaction record
      await deleteDoc(transactionRef);

      // Remove transaction ID from resident's transactionHistory
      const residentRef = doc(db, 'residents', transactionData.userId);
      const residentSnap = await getDoc(residentRef);

      if (residentSnap.exists()) {
          const residentData = residentSnap.data();
          const updatedTransactionHistory = residentData.transactionHistory.filter(id => id !== transactionId);

          await updateDoc(residentRef, {
              transactionHistory: updatedTransactionHistory,
              updatedAt: Timestamp.now(),
          });
      }

      return res.status(200).json({ message: 'Purchase cancelled successfully' });
  } catch (error) {
      console.error('Error cancelling purchase: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Pre-order products
export const preOrderProducts = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
          return res.status(404).json({ message: 'Product not found' });
      }

      // Create pre-order record
      const preOrderRef = doc(collection(db, 'preorders'));
      await setDoc(preOrderRef, {
          userId,
          productId,
          quantity,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
      });

      return res.status(201).json({ message: 'Pre-order created successfully', preOrderId: preOrderRef.id });
  } catch (error) {
      console.error('Error creating pre-order: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};
