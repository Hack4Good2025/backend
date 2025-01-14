import { db } from './firebase.js';
import { collection, addDoc } from "firebase/firestore";

async function addSampleData() {
  try {
    const testingCollectionRef = collection(db, "testing");
    const sampleData = {
      name: "User 2",
      email: "sample.user@example.com",
      age: 25,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(testingCollectionRef, sampleData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  } finally {
    process.exit();
  }
}

addSampleData();
