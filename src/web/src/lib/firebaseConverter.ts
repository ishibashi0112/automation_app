import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import { firestoreCollections } from "types/type";

export const converter = <
  T extends firestoreCollections
>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => {
    return data;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>, option) => {
    const data = snapshot.data(option);
    return data;
  },
});
