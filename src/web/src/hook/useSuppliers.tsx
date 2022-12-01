import useSWRImmutable from "swr/immutable";
import { SettingOpSuplliers } from "types/type";
import { fetcher } from "../lib/fetcher";

export const useSuppliers = () => {
  const { data, error } = useSWRImmutable<SettingOpSuplliers[]>(
    "suppliers",
    fetcher<SettingOpSuplliers>
  );

  return {
    data,
    error,
    isLoading: !data && !error,
  };
};
