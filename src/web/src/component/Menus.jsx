import React from "react";
import { Card, SimpleGrid, Text, Title } from "@mantine/core";
import { menus } from "../utils/menuData";
import { useLocalStorage } from "@mantine/hooks";
import { Menu } from "./Menu";
import { useSharedState } from "../hook/useSharedState";

export const Menus = () => {
  const [menu, setMenu] = useSharedState("menu", null);
  const [colorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
  });
  const dark = colorScheme === "dark";

  if (menu) {
    return <Menu />;
  }

  return (
    <>
      <div className="mb-2">
        <Title order={4}>自動化メニュー</Title>
      </div>
      <SimpleGrid
        spacing="sm"
        breakpoints={[
          { minWidth: 600, cols: 2 },
          { minWidth: 950, cols: 3 },
        ]}
      >
        {menus.map((menu) => (
          <Card
            className={
              dark
                ? " transition hover:bg-gray-800 hover:transition"
                : "transition hover:opacity-80 hover:shadow-2xl hover:bg-gray-50 hover:transition"
            }
            key={menu.title}
            withBorder={dark}
            radius="sm"
            shadow="sm"
            onClick={() => setMenu(menu)}
          >
            <Title className="" order={5}>
              {menu.title}
            </Title>
            <Text className="min-h-[50px] py-1" size="sm">
              {menu.descripyion}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
};
