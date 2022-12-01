import React from "react";
import { FC } from "react";
import { Menus } from "./Menus";
import { Settings } from "./Settings";

export const Main: FC<{ mainMenu: number }> = ({ mainMenu }) => {
  if (mainMenu === 0) {
    return <Menus />;
  }

  if (mainMenu === 1) {
    return <Settings />;
  }

  return <></>;
};
