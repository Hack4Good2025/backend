import { bucket } from '../config/googleCloud.js';

// Helper function to get a signed URL for reading a file
const getSignedUrl = async (file) => {
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

// Helper function to upload a file and return the signed URL
const uploadFileAndGetSignedUrl = async (file, productId) => {
    const blob = bucket.file(`products/${productId}`); // Adjust the path if needed
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

export { getSignedUrl, uploadFileAndGetSignedUrl };
