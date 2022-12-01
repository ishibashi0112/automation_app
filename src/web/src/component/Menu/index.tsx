import React from "react";
import { Card, Flex, Text, Title, UnstyledButton } from "@mantine/core";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useMenuState } from "hook/useMenuState";

export const Menu = () => {
  const [menu, setMenu] = useMenuState();

  return (
    <>
      <div className="mb-2 ">
        <UnstyledButton className="mb-4" onClick={() => setMenu(undefined)}>
          <Flex align="center">
            <RiArrowLeftSLine size={18} />
            <Text fz="sm">戻る</Text>
          </Flex>
        </UnstyledButton>
        <Title order={4}>{menu.title}</Title>
      </div>

      <Card>{menu.formBody}</Card>
    </>
  );
};
