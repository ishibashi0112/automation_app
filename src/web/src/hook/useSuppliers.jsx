import useSWRImmutable from "swr/immutable";
import { fetcher } from "../lib/fetcher";

export const useSuppliers = () => {
  const { data, error } = useSWRImmutable("suppliers", fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
