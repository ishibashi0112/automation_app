import { ColorScheme } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

type SwitchDark = {
  colorScheme: ColorScheme;
  isDark: boolean;
  setDark: () => void;
};

export const useDarkMode = (): SwitchDark => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
  });

  const setDark = (): void => {
    setColorScheme((scheme) => (scheme === "dark" ? "light" : "dark"));
  };

  return {
    colorScheme,
    isDark: colorScheme === "dark",
    setDark,
  };
};
