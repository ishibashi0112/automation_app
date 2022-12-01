import React, { FC } from "react";
import {
  ActionIcon,
  Group,
  Header as MantineHeader,
  MediaQuery,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { RiMenuFill, RiMoonLine, RiSunLine } from "react-icons/ri";
import { SiAutodesk } from "react-icons/si";
import { useDarkMode } from "hook/useDarkMode";

export const Header: FC<{ drawerToggle: () => void }> = ({ drawerToggle }) => {
  const { isDark, setDark } = useDarkMode();

  return (
    <MantineHeader height={50} p="xs">
      <Group position="apart">
        <Group spacing={4}>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <ActionIcon
              className="mr-4"
              variant="transparent"
              onClick={() => drawerToggle()}
            >
              <RiMenuFill size={18} />
            </ActionIcon>
          </MediaQuery>

          <ThemeIcon>
            <SiAutodesk />
          </ThemeIcon>
          <Text
            align="center"
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan", deg: 45 }}
            size="xl"
            weight={700}
          >
            KGPC Automation
          </Text>
        </Group>

        <ActionIcon
          variant="outline"
          color={isDark ? "yellow" : "blue"}
          onClick={() => setDark()}
          title="Toggle color scheme"
        >
          {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
        </ActionIcon>
      </Group>
    </MantineHeader>
  );
};
