import useSWRImmutable from "swr/immutable";
import { fetcher } from "../lib/fetcher";

export const useItems = () => {
  const { data, error } = useSWRImmutable("items", fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
