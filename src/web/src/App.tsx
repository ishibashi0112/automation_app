import React, { FC } from "react";
import "./index.css";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Root } from "Root";
import { useDarkMode } from "hook/useDarkMode";

export const App: FC = () => {
  const { colorScheme } = useDarkMode();

  return (
    <ColorSchemeProvider colorScheme={colorScheme}>
      <MantineProvider
        theme={{
          colorScheme: colorScheme,
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <Root />
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
