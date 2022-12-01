import useSWR, { KeyedMutator } from "swr";
import { Menu } from "utils/menuData";

const fallbackData = {
  title: "",
  description: "",
  formBody: "",
  runFunc: window.eel.run_automation,
};

export const useMenuState = (): // fallbackData: any = null
[Menu, KeyedMutator<Menu>] => {
  const { data, mutate } = useSWR<Menu>("menu", { fallbackData });

  if (!data) {
    return [fallbackData, mutate];
  }

  return [data, mutate];
};
