import React from "react";
import { Card, Flex, Text, Title, UnstyledButton } from "@mantine/core";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useSharedState } from "../../hook/useSharedState";

export const Menu = () => {
  const [menu, setMenu] = useSharedState("menu");

  return (
    <>
      <div className="mb-2 ">
        <UnstyledButton className="mb-4" onClick={() => setMenu("")}>
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
