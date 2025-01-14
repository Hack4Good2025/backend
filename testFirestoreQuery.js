import { db } from './config/firebase.js'; // Import the Firestore database
import { collection, query, where, getDocs } from 'firebase/firestore';

const testFirestoreQuery = async (nameToSearch) => {
    try {
        console.log(`Searching for residents with name: ${nameToSearch}`);

        const residentsRef = collection(db, 'residents');
        const nameQuery = query(residentsRef, where('name', '==', nameToSearch));
        const querySnapshot = await getDocs(nameQuery);

        if (querySnapshot.empty) {
            console.log('No residents found with this name');
            return;
        }

        // Map through the results to extract only name and userId
        const results = querySnapshot.docs.map(doc => ({
            name: doc.data().name,
            userId: doc.data().userId,
        }));

        console.log('Residents found:', results);
    } catch (error) {
        console.error('Error fetching residents:', error);
    }
};

// Replace 'John' with the name you want to test
testFirestoreQuery('John');
