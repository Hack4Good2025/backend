import { bucket } from '../config/googleCloud.js';

// Helper function to get a signed URL for reading a file
export const getSignedUrl = async (file) => {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    try {
        // Use the file object to generate the signed URL
        const [url] = await file.getSignedUrl(options);
        return url;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate signed URL'); // Throw an error for upstream handling
    }
};

// Helper function to upload a new file and return the signed URL
export const uploadFileAndGetSignedUrl = async (file, category, id) => {
  // Use category and id to create a dynamic file path
  const fileName = `${category}/${id}`; // e.g., "vouchers/12345" or "residents/67890"
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
      metadata: {
          contentType: file.mimetype,
      },
  });

  return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
          console.error('Error uploading image:', err);
          reject(err);
      });

      blobStream.on('finish', async () => {
          try {
              const signedUrl = await getSignedUrl(blob);
              resolve(signedUrl);
          } catch (error) {
              reject(error);
          }
      });

      blobStream.end(file.buffer);
  });
};

// Helper function to delete a file from Google Cloud Storage
export const deleteFile = async (filePath) => {
  try {
      await bucket.file(filePath).delete();
      console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete the file');
  }
};

// Combined function to delete previous image and upload a new one
export const deletePreviousAndUploadNewImage = async (previousImagePath, newFile, category, id) => {
  // Delete the previous image
  await deleteFile(previousImagePath);

  // Upload the new image and return the signed URL
  return await uploadFileAndGetSignedUrl(newFile, category, id);
};
