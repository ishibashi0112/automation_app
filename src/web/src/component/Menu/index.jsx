import React from "react";
import { ActionIcon, Card, Title } from "@mantine/core";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useSharedState } from "../../hook/useSharedState";

export const Menu = () => {
  const [menu, setMenu] = useSharedState("menu");

  return (
    <>
      <div className="mb-2 flex items-center">
        <ActionIcon className="mr-2" size="md" onClick={() => setMenu("")}>
          <RiArrowLeftSLine size={25} />
        </ActionIcon>
        <Title order={4}>{menu.title}</Title>
      </div>

      <Card>{menu.formBody}</Card>
    </>
  );
};
