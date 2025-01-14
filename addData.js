import { db } from './firebase.js';
import { collection, addDoc } from "firebase/firestore";

async function addSampleData() {
  try {
    const testingCollectionRef = collection(db, "testing");
    const sampleData = {
      name: "Sample User",
      email: "sample.user@example.com",
      age: 25,
      createdAt: new Date(),
    };

    const docRef = await addDoc(testingCollectionRef, sampleData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

addSampleData();
