import useSWR from "swr";

export const useSharedState = (key, fallbackData) => {
  const { data, mutate } = useSWR(key, { fallbackData });
  return [data, mutate];
};
