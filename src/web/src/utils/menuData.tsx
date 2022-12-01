import React, { ReactNode } from "react";
import { Op } from "component/Menu/MenuComponets/Op";
import { OpC } from "component/Menu/MenuComponets/OpC";
import { OpPaperOrder } from "component/Menu/MenuComponets/OpPaperOrder";
import { Ose } from "component/Menu/MenuComponets/Ose";
import { RepairOrder } from "component/Menu/MenuComponets/RepairOrder";
import { BearingOrder } from "component/Menu/MenuComponets/BearingOrder";
import { OpExcel } from "component/Menu/MenuComponets/OpExcel";
import { OpPayments } from "component/Menu/MenuComponets/OpPayments";
import { InsertText } from "component/Menu/MenuComponets/InsertText";
import { CreateMailForPaperOrder } from "component/Menu/MenuComponets/CreateMailForPaperOrder";
import { ItemJudgeEntry } from "component/Menu/MenuComponets/ItemJudgeEntry";
import { RunAutomation } from "types/global";

export type ResultState = {
  state: "error" | "success" | "";
  message: string;
  fullMessage: string;
  type: string;
};

export type Menu = {
  title: string;
  description: string;
  formBody: ReactNode;
  runFunc: RunAutomation;
};

const runFunc: RunAutomation = async (menuName, settings, params) => {
  const result = await window.eel.run_automation(menuName, settings, params)();
  return result;
};

export const menus: Menu[] = [
  {
    title: "発注計画(国内) 展開",
    description: "発注計画ｴﾝﾄﾘｰより国内受注の一括内示を行う。",
    formBody: <Op />,
    runFunc,
  },
  {
    title: "発注計画(海外A) 展開",
    description: "発注計画ｴﾝﾄﾘｰより海外Aｵｰﾀﾞｰの一括内示を行う。",
    formBody: <Op />,
    runFunc,
  },
  {
    title: "発注計画(海外C) 展開",
    description: "発注計画ｴﾝﾄﾘｰより海外Cｵｰﾀﾞｰの一括伝票発行を行う。",
    formBody: <OpC />,
    runFunc,
  },
  {
    title: "特急製作依頼書 作成",
    description: "発注計画ｴﾝﾄﾘｰより特急製作依頼書の作成を行う。",
    formBody: <OpPaperOrder />,
    runFunc,
  },
  {
    title: "ｵｰﾀﾞｰｼｰﾄ 作成",
    description: "発注残情報からつくばO/Sの作成を行う。",
    formBody: <Ose />,
    runFunc,
  },
  {
    title: "預かり修理 展開",
    description:
      "発注計画ｴﾝﾄﾘｰより預かり修理品の一括内示を行い、管理ｴｸｾﾙに情報を自動入力する。",
    formBody: <RepairOrder />,
    runFunc,
  },
  {
    title: "支給品 手配",
    description: "発注計画ｴﾝﾄﾘｰより、手配が必要な支給品の発注データを作成する",
    formBody: <OpPayments />,
    runFunc,
  },
  {
    title: "発注計画 展開(Excel)",
    description: "Excelデータより発注展開を行う",
    formBody: <OpExcel />,
    runFunc,
  },
  {
    title: "胴ﾍﾞｱﾘﾝｸﾞ 手配",
    description: "w/c京二へ胴ﾍﾞｱﾘﾝｸﾞの手配依頼を行う",
    formBody: <BearingOrder />,
    runFunc,
  },
  {
    title: "特急製作依頼書 ﾃｷｽﾄ挿入",
    description: "特急製作依頼書に納期ﾃｷｽﾄを挿入する",
    formBody: <InsertText type="特急製作依頼" />,
    runFunc,
  },
  {
    title: "支給品一覧 ﾃｷｽﾄ挿入",
    description: "特急製作依頼書に納期ﾃｷｽﾄを挿入する",
    formBody: <InsertText type="支給" />,
    runFunc,
  },
  {
    title: "特急製作依頼書 ﾒｰﾙ作成",
    description: "特急製作依頼書の送信ﾒｰﾙを作成する",
    formBody: <CreateMailForPaperOrder />,
    runFunc,
  },
  {
    title: "品番判断ｴﾝﾄﾘｰ 自動確定",
    description: "品番判断ｴﾝﾄﾘ-の確定可能品を自動確定する",
    formBody: <ItemJudgeEntry />,
    runFunc,
  },
];
