import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name from the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, 'service-account.json'), // Adjust the path as needed
});

const bucketName = 'hack4good2025';
const bucket = storage.bucket(bucketName);

// Export the bucket
export { bucket };
