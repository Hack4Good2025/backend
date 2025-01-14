import { db } from './firebase.js';
import { collection, getDocs } from "firebase/firestore";

async function retrieveSampleData() {
  try {
    const testingCollectionRef = collection(db, "testing");
    const querySnapshot = await getDocs(testingCollectionRef);

    querySnapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}, Data:`, doc.data());
    });
  } catch (e) {
    console.error("Error retrieving documents: ", e);
  } finally {
    process.exit();
  }
}

retrieveSampleData();
