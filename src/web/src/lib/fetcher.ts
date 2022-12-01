import { collection, getDocs } from "firebase/firestore";
import { SettingOpItems } from "types/type";
import { db } from "./firebase";
import { converter } from "./firebaseconverter";

// type Fetcher = (url: string) => string[];

export const fetcher = async <T>(url: string) => {
  const docSnap = await getDocs(
    collection(db, url).withConverter(converter<T>())
  );
  const docs = docSnap.docs;
  const resultArray = docs.map((doc) => {
    return { ...doc.data(), id: doc.id };
  });

  return resultArray;
};
