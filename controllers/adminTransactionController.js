import { db } from '../config/firebase.js';
import { collection, doc, setDoc, getDoc, deleteDoc, updateDoc, getDocs, query, Timestamp } from 'firebase/firestore';

// Create a new product
export const createProduct = async (req, res) => {
    const { name, description, price, stock, imageUrl } = req.body;

    try {
        const productRef = doc(collection(db, 'products'));
        await setDoc(productRef, {
            productId: productRef.id,
            name,
            description,
            price,
            stock,
            imageUrl,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        // Update inventory immediately
        await setDoc(doc(db, 'inventory', productRef.id), {
            productId: productRef.id,
            name: name,
            quantityAvailable: stock,
            lastUpdated: Timestamp.now(),
        });

        return res.status(201).json({ message: 'Product created successfully', productId: productRef.id });
    } catch (error) {
        console.error('Error creating product: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// View all products
export const viewAllProducts = async (req, res) => {
  try {
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching products: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// View a product by ID
export const viewProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ id: productSnap.id, ...productSnap.data() });
    } catch (error) {
        console.error('Error fetching product: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update a product details (not stock)
export const updateProductDetails = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, imageUrl, stock } = req.body;

  // Alert the user if stock is included in the request body
  if (stock !== undefined) {
      return res.status(400).json({ message: 'Stock will not be updated through this endpoint. Please use the /products/update/stock/:productId endpoint to update stock.' });
  }

  try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      // Check if the product exists
      if (!productSnap.exists()) {
          return res.status(404).json({ message: 'Product not found.' });
      }

      // Create an update object and only include fields that are present in the request body
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (imageUrl !== undefined) updates.imageUrl = imageUrl;

      // Update the product with the provided fields
      await updateDoc(productRef, {
          ...updates,
          updatedAt: Timestamp.now(),
      });

      return res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
      console.error('Error updating product: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update product stock
export const updateProductStock = async (req, res) => {
  const { productId } = req.params;
  const { stock, name, description, price, imageUrl } = req.body;


   // Validate the stock value
  if (stock < 0) {
      return res.status(400).json({ message: 'Stock value cannot be negative.' });
  }

  // Check for other parameters and redirect if present
  if (name !== undefined || description !== undefined || price !== undefined || imageUrl !== undefined) {
      return res.status(400).json({ message: 'Please use the /products/update/details endpoint to update product details.' });
  }

  try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      // Check if the product exists
      if (!productSnap.exists()) {
          return res.status(404).json({ message: 'Product not found.' });
      }

      await updateDoc(productRef, {
          stock,
          updatedAt: Timestamp.now(),
      });
      return res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
      console.error('Error updating product: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const productRef = doc(db, 'products', productId);

        const productSnap = await getDoc(productRef);

        // Check if the product exists
        if (!productSnap.exists()) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        await deleteDoc(productRef);

        // Delete the corresponding inventory entry
        const inventoryRef = doc(db, 'inventory', productId);
        await deleteDoc(inventoryRef);

        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Generate inventory report
export const generateInventoryReport = async (req, res) => {
  try {
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const report = productsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              productId: doc.id,
              name: data.name,
              stock: data.stock || null, // Default to null if stock is not defined
          };
      });

      return res.status(200).json(report);
  } catch (error) {
      console.error('Error generating inventory report: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};
