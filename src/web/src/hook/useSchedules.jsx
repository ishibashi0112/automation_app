import useSWRImmutable from "swr/immutable";
import { fetcher } from "../lib/fetcher";

export const useSchedules = () => {
  const { data, error } = useSWRImmutable("schedules", fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
