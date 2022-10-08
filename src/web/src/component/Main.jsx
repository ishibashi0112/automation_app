import React from "react";
import { Menus } from "./Menus";
import { Settings } from "./Settings";

export const Main = ({ mainMenu }) => {
  if (mainMenu === 0) {
    return <Menus />;
  }

  if (mainMenu === 1) {
    return <Settings />;
  }

  return <></>;
};
