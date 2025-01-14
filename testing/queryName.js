import { db } from './firebase.js';
import { collection, query, where, getDocs } from "firebase/firestore";

async function queryByName(name) {
  try {
    const testingCollectionRef = collection(db, "testing");
    const q = query(testingCollectionRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No documents found with name: ${name}`);
      return;
    }

    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}, Data:`, doc.data());
    });
  } catch (e) {
    console.error("Error querying documents: ", e);
  } finally {
    process.exit();
  }
}

// Replace 'Sample User' with the name you want to query for
const nameToQuery = 'User 2';
queryByName(nameToQuery);
