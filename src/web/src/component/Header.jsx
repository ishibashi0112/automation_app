import {
  ActionIcon,
  Group,
  Header as MantineHeader,
  Image,
  MediaQuery,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React from "react";
import { RiMenuFill, RiMoonLine, RiSunLine } from "react-icons/ri";
import { SiAutodesk } from "react-icons/si";

export const Header = ({ drawerToggle }) => {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
  });
  const dark = colorScheme === "dark";

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
          {/* <Image width={150} src={"komorilogo.gif"} alt="logo" /> */}

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
          color={dark ? "yellow" : "blue"}
          onClick={() =>
            setColorScheme((scheme) => (scheme === "dark" ? "light" : "dark"))
          }
          title="Toggle color scheme"
        >
          {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
        </ActionIcon>
      </Group>
    </MantineHeader>
  );
};
