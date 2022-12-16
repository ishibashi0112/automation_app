import useSWR, { KeyedMutator } from "swr";
import { Menu } from "utils/menuData";

const initialData = {
  title: "",
  description: "",
  formBody: "",
  runFunc: async () => {},
};

export const useMenuState = (): [Menu | undefined, KeyedMutator<Menu>] => {
  // const { data, mutate } = useSWR<Menu>("menu", { fallbackData });
  const { data, mutate } = useSWR<Menu>("menu");

  // if (!data) {
  //   return [initialData, mutate];
  // }

  return [data, mutate];
};
