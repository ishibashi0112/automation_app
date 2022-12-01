import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";

export const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => {
    return data as DocumentData;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<T>,
    option: SnapshotOptions
  ) => {
    const data = snapshot.data(option);
    return data;
  },
});
