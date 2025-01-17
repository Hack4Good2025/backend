import { Storage } from '@google-cloud/storage';
import path from 'path';

// Get the directory name from the module URL
const filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(filename);

// Correctly reference the service account JSON file
const serviceAccountPath = path.join(__dirname, '../service-account.json');
const storage = new Storage({ keyFilename: serviceAccountPath });

const bucketName = 'hack4good2025';
const bucket = storage.bucket(bucketName);

// Export the bucket
export { storage, bucket };
