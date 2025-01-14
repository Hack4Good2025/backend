// This is a conceptual schema representation for reference only.
// Firestore is schema-less, but it's good to define what fields you expect.

export const residentSchema = {
  userId: 'string',          // Unique identifier for the resident
  name: 'string',            // Full name of the resident
  email: 'string',           // Email address (should be unique)
  passwordHash: 'string',    // Hashed password for authentication
  transactionHistory: [],     // Array of transaction IDs or objects
  preOrderRequests: [],      // Array of pre-order request IDs or objects
  createdAt: 'timestamp',    // Date and time when the resident was created
  updatedAt: 'timestamp',     // Last date and time when the resident was updated
};
