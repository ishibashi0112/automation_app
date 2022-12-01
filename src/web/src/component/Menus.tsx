import React, { FC } from "react";
import { Card, SimpleGrid, Text, Title } from "@mantine/core";
import { menus } from "utils/menuData";
import { Menu } from "./Menu";
import { useMenuState } from "hook/useMenuState";
import { useDarkMode } from "hook/useDarkMode";

export const Menus: FC = () => {
  const { isDark } = useDarkMode();
  const [menu, setMenu] = useMenuState();

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
              isDark
                ? " transition hover:bg-gray-800 hover:transition"
                : "transition hover:opacity-80 hover:shadow-2xl hover:bg-gray-50 hover:transition"
            }
            key={menu.title}
            withBorder={isDark}
            radius="sm"
            shadow="sm"
            onClick={() => setMenu(menu)}
          >
            <Title className="" order={5}>
              {menu.title}
            </Title>
            <Text className="min-h-[50px] py-1" size="sm">
              {menu.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
};
