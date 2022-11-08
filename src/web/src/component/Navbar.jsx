import React, { useState } from "react";
import {
  Navbar as MantineNavbar,
  NavLink,
  Tooltip,
  Drawer,
} from "@mantine/core";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSettings3Line,
} from "react-icons/ri";
import { CgMenuGridR } from "react-icons/cg";
import { useEffect } from "react";

const NavData = [
  {
    label: "自動化メニュー",
    icon: <CgMenuGridR size={16} />,
    iconColor: "blue",
  },
  {
    label: "設定",
    icon: <RiSettings3Line size={16} />,
    iconColor: "gray",
  },
];

export const Navbar = ({ drawerOpened, drawerToggle, setMainMenu }) => {
  const [active, setActive] = useState(0);
  const [isFolded, setFolded] = useState(false);

  const navs = NavData.map((nav, index) => {
    return isFolded ? (
      <Tooltip label={nav.label}>
        <NavLink
          key={nav.label}
          active={index === active}
          icon={nav.icon}
          onClick={() => handleClickNav(index)}
        />
      </Tooltip>
    ) : (
      <NavLink
        key={nav.label}
        active={index === active}
        label={nav.label}
        icon={nav.icon}
        onClick={() => handleClickNav(index)}
      />
    );
  });

  useEffect(() => {
    if (drawerOpened && isFolded) {
      setFolded(false);
    }
  }, [drawerOpened, isFolded]);

  const handleClickNav = (index) => {
    setActive(index);
    setMainMenu(index);
  };

  return (
    <>
      <MantineNavbar
        width={{ base: !isFolded ? 250 : 60 }}
        height={"calc(100vh - 50px)"}
        p="xs"
        hidden
        hiddenBreakpoint="sm"
      >
        <MantineNavbar.Section grow>{navs}</MantineNavbar.Section>
        <MantineNavbar.Section>
          <NavLink
            onClick={() => setFolded((o) => !o)}
            label={!isFolded ? "折り畳む" : ""}
            icon={
              !isFolded ? (
                <RiArrowLeftSLine size={20} />
              ) : (
                <RiArrowRightSLine size={20} />
              )
            }
          />
        </MantineNavbar.Section>
      </MantineNavbar>
      <Drawer opened={drawerOpened} onClose={() => drawerToggle()}>
        {navs}
      </Drawer>
      ;
    </>
  );
};
