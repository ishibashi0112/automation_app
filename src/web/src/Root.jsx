import React, { Suspense, Error } from "react";
import "./index.css";
import { App } from "./App";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useLocalStorage } from "@mantine/hooks";

export const Root = () => {
  const [colorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      //   toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{
          colorScheme: colorScheme,
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
