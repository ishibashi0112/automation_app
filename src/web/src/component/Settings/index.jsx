import React from "react";
import { ActionIcon, Card, NavLink, Title } from "@mantine/core";
import { useState } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useCallback } from "react";
import "dayjs/locale/ja";
import { Schedule } from "./Schedule";
import { OpItems } from "./Op/OpItems";
import { OpSuppliers } from "./Op/OpSuppliers";

const navData = [
  {
    label: "発注計画エントリー",
    nestedData: [{ label: "品番" }, { label: "取引先" }],
  },
  { label: "カレンダー管理" },
  { label: "オーダーシート" },
];

export const Settings = () => {
  const [selectedSettingMenu, setSelectedSettingMenu] = useState("");

  const handleSettigSwich = useCallback((navLabel) => {
    setSelectedSettingMenu(navLabel);
  }, []);

  const handleRetrun = useCallback(() => {
    setSelectedSettingMenu("");
  }, []);

  const settingNavs = navData.map((nav) => {
    if (nav.nestedData) {
      return (
        <NavLink key={nav.label} label={nav.label}>
          {nav.nestedData.map((childNav) => (
            <NavLink
              key={childNav.label}
              label={childNav.label}
              onClick={() =>
                handleSettigSwich(`${nav.label}/${childNav.label}`)
              }
            />
          ))}
        </NavLink>
      );
    }

    return (
      <NavLink
        key={nav.label}
        label={nav.label}
        onClick={() => handleSettigSwich(nav.label)}
      />
    );
  });

  const settingTitle = (
    <div className="flex items-center mb-2">
      <ActionIcon className="mr-3" size="md" onClick={handleRetrun}>
        <RiArrowLeftSLine size={25} />
      </ActionIcon>
      <Title order={4}>{selectedSettingMenu}</Title>
    </div>
  );

  if (selectedSettingMenu === "発注計画エントリー/品番") {
    return <OpItems title={settingTitle} />;
  }

  if (selectedSettingMenu === "発注計画エントリー/取引先") {
    return <OpSuppliers title={settingTitle} />;
  }

  if (selectedSettingMenu === "カレンダー管理") {
    return (
      <div>
        <Schedule title={settingTitle} />
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <Title order={4}>設定</Title>
      </div>
      <Card shadow="sm" p="sm" radius="md">
        {settingNavs}
      </Card>
    </>
  );
};
