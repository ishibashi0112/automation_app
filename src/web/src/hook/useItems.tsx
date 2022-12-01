import useSWRImmutable from "swr/immutable";
import { SettingOpItems } from "types/type";
import { fetcher } from "lib/fetcher";

export const useItems = () => {
  const { data, error } = useSWRImmutable<SettingOpItems[]>(
    "items",
    fetcher<SettingOpItems>
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
