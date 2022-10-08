import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const fetcher = async (url) => {
  const docSnap = await getDocs(collection(db, url));
  const docs = docSnap.docs;
  const resultArray = docs.map((doc) => {
    return { ...doc.data(), id: doc.id };
  });
  return resultArray;
};
