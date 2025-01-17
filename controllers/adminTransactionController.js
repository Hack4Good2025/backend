import { db } from '../config/firebase.js';
import ExcelJS from 'exceljs';
import { collection, doc, setDoc, getDoc, deleteDoc, updateDoc, getDocs, addDoc, orderBy, limit, query, Timestamp } from 'firebase/firestore';
import { bucket } from '../config/googleCloud.js';
import { uploadFileAndGetSignedUrl, deletePreviousAndUploadNewImage } from '../utils/imageUtil.js';


// Create a new product
export const createProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const imageFile = req.file;

  try {
      const productRef = doc(collection(db, 'products'));

      let imageUrl = null;

      // If an image is provided, upload it and get the URL
      if (imageFile) {
          imageUrl = await uploadFileAndGetSignedUrl(imageFile, 'products', productRef.id);
      }

      const productData = {
          productId: productRef.id,
          name,
          description,
          price,
          stock,
          imageUrl,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
      };

      // Save the product document
      await setDoc(productRef, productData);

      // Return the entire product object in the response
      return res.status(201).json({
          message: 'Product created successfully',
          product: productData,
      });
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
    const { productId } = req.body;

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

// Update a product's details (not stock)
export const updateProductDetails = async (req, res) => {
  const { productId, name, description, price, stock } = req.body;
  const imageFile = req.file; // Get the uploaded image file

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

      // If an image file is provided, upload it and get the signed URL
      if (imageFile) {
          const previousImagePath = `products/${productId}`; // Path for the previous image
          const imageUrl = await deletePreviousAndUploadNewImage(previousImagePath, imageFile, 'products', productId);
          updates.imageUrl = imageUrl; // Update the image URL with the new one
      }

      // Update the product with the provided fields
      await updateDoc(productRef, {
          ...updates,
          updatedAt: Timestamp.now(),
      });

      // Fetch the updated product data
      const updatedProductSnap = await getDoc(productRef);
      const productData = updatedProductSnap.data();

      // Return the updated product data in the response
      return res.status(200).json({
          message: 'Product updated successfully',
          product: {
              productId: productId,
              ...productData,
          },
      });
  } catch (error) {
      console.error('Error updating product: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update product stock
export const updateProductStock = async (req, res) => {
  const { productId, stock, name, description, price, imageUrl } = req.body;

  // Validate that productId is provided
  if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
  }
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
      return res.status(200).json({
        message: 'Product updated successfully',
        updatedStock: stock
    });
  } catch (error) {
      console.error('Error updating product: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Helper function to convert pre-orders to transactions
const fulfillPreOrders = async (productId, newStockLevel) => {
    const preordersRef = collection(db, 'preorders');
    const preordersSnapshot = await getDocs(preordersRef);

    const fulfilledTransactions = [];

    for (const preorderDoc of preordersSnapshot.docs) {
        const preorderData = preorderDoc.data();
        if (preorderData.productId === productId) {
            const { userId, quantity } = preorderData;

            // Check if there's enough stock to fulfill the pre-order
            if (newStockLevel >= quantity) {
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
                fulfilledTransactions.push(transactionRef.id);

                // Update the stock level
                newStockLevel -= quantity;

                // Remove the pre-order after fulfillment
                await deleteDoc(preorderDoc.ref);
            }
        }
    }

    return { fulfilledTransactions, remainingStock: newStockLevel }; // Return remaining stock
};

// Add product stock
export const addProductStock = async (req, res) => {
    const { productId, increment } = req.body;

    // Validate that productId is provided
    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
    }

    // Validate that increment is a positive integer
    if (!Number.isInteger(increment) || increment <= 0) {
        return res.status(400).json({ message: 'Increment value must be a positive integer.' });
    }

    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        // Check if the product exists
        if (!productSnap.exists()) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const productData = productSnap.data();
        const newStock = productData.stock + increment; // Increment the stock

        // Update the product stock in Firestore
        await updateDoc(productRef, {
            stock: newStock,
            updatedAt: Timestamp.now(),
        });

        // Fulfill any pre-orders if possible
        const { fulfilledTransactions, remainingStock } = await fulfillPreOrders(productId, newStock);

        // Return the updated stock level and fulfilled transactions in the response
        return res.status(200).json({
            message: 'Stock updated successfully',
            updatedStock: remainingStock, // Reflect the stock after fulfilling pre-orders
            fulfilledTransactions // Include the fulfilled transactions
        });
    } catch (error) {
        console.error('Error adding stock: ', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { productId } = req.body;

    try {
        const productRef = doc(db, 'products', productId);

        const productSnap = await getDoc(productRef);

        // Check if the product exists
        if (!productSnap.exists()) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        await deleteDoc(productRef);

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
              stock: data.stock || null,
          };
      });

      return res.status(200).json(report);
  } catch (error) {
      console.error('Error generating inventory report: ', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to generate the Excel file and store it in Firestore
export const generateReport = async (req, res) => {
  try {
    // Fetch products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const products = productsSnapshot.docs.map(doc => ({
      productId: doc.id,
      name: doc.data().name,
      stock: doc.data().stock || 0, // Default to 0 if not defined
    }));

    // Fetch pre-orders
    const preordersRef = collection(db, 'preorders');
    const preordersSnapshot = await getDocs(preordersRef);
    const preorders = preordersSnapshot.docs.map(doc => ({
      preorderId: doc.id,
      productId: doc.data().productId,
      quantity: doc.data().quantity,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null,
    }));

    // Combine inventory and pre-orders into a single report
    const reportData = products.map(product => {
      const productPreorders = preorders.filter(preorder => preorder.productId === product.productId);
      return {
        productId: product.productId,
        productName: product.name,
        stock: product.stock,
        totalPreordered: productPreorders.reduce((total, preorder) => total + preorder.quantity, 0),
        preorders: productPreorders,
      };
    });

    // Create the report document object
    const reportDoc = {
      createdAt: new Date(),
      reportData: reportData,
    };

    // Generate a new document ID and create the document with setDoc
    const newDocRef = doc(collection(db, 'reports'));
    await setDoc(newDocRef, { ...reportDoc, reportId: newDocRef.id });

    // Return the report in the response
    res.status(201).json({
      message: 'Report generated and stored successfully.',
      report: { reportId: newDocRef.id, ...reportDoc }
    });
  } catch (err) {
    console.error("Error generating report: ", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Function to download the latest inventory report
export const downloadReport = async (req, res) => {
  try {
    // Fetch the latest report from Firestore
    const reportsRef = collection(db, 'reports');
    const reportsSnapshot = await getDocs(reportsRef);
    const reports = reportsSnapshot.docs.map(doc => ({
      reportId: doc.id,
      ...doc.data(),
    }));

    // If there are no reports, return an error
    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports available for download.' });
    }

    // Get the most recent report
    const latestReport = reports[reports.length - 1]; // Assuming reports are sorted by createdAt

    // Generate Excel file from the latest report
    const xlsBuffer = await generateXLS(latestReport.reportData);
    res.set("Content-Disposition", "attachment; filename=inventory_report.xlsx");
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(xlsBuffer);
  } catch (err) {
    console.error("Error downloading report: ", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const fetchLatestReport = async (req, res) => {
  try {
    // Create a query to fetch the latest report, limited to 1 result and ordered by createdAt
    const reportsRef = collection(db, 'reports');
    const latestReportQuery = query(reportsRef, orderBy('createdAt', 'desc'), limit(1));
    const latestReportSnapshot = await getDocs(latestReportQuery);

    // Check if a report exists
    if (latestReportSnapshot.empty) {
      return res.status(404).json({ message: 'No reports found.' });
    }

    // Map the latest report to include its ID
    const latestReport = latestReportSnapshot.docs.map(doc => ({
      reportId: doc.id,
      ...doc.data(),
    }))[0]; // Get the first (and only) document

    // Return the latest report in the response
    res.status(200).json(latestReport);
  } catch (err) {
    console.error("Error fetching the latest report: ", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to generate Excel using ExcelJS
async function generateXLS(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inventory Report", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // Set headers
  worksheet.addRow(["Product ID", "Product Name", "Stock", "Total Preordered", "Preorders"]);

  // Loop over the grouped data
  data.forEach(item => {
    const preordersList = item.preorders.map(preorder =>
      `ID: ${preorder.preorderId}, Quantity: ${preorder.quantity}, User ID: ${preorder.userId}`
    ).join("; ") || "No Preorders";

    worksheet.addRow([
      item.productId,
      item.productName,
      item.stock,
      item.totalPreordered,
      preordersList
    ]);
  });

  // Define column widths
  worksheet.getColumn(1).width = 20;
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 50;

  // Apply border styles
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Generate the XLS file
  return workbook.xlsx.writeBuffer();
}

/* HELPER FUNCTIONS */
// TODO: Refactor into Utils Folder
// Upload image to Google Cloud Storage and return the signed URL
const uploadImage = async (file, productId) => {
  return new Promise((resolve, reject) => {
      const blob = bucket.file(`products/${productId}`);
      const blobStream = blob.createWriteStream({
          metadata: {
              contentType: file.mimetype,
          },
      });

      blobStream.on('error', (err) => {
          console.error('Error uploading image:', err);
          reject(err);
      });

      blobStream.on('finish', async () => {
          const signedUrl = await getSignedUrl(blob);
          resolve(signedUrl);
      });

      blobStream.end(file.buffer);
  });
};

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
