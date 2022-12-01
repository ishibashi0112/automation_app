import useSWRImmutable from "swr/immutable";
import { fetcher } from "lib/fetcher";
import { SettingSchedules } from "types/type";

export const useSchedules = () => {
  const { data, error } = useSWRImmutable<SettingSchedules[]>(
    "schedules",
    fetcher<SettingSchedules>
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
