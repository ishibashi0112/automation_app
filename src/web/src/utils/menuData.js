import React from "react";
import { Op } from "../component/Menu/MenuComponets/Op";
import { OpC } from "../component/Menu/MenuComponets/OpC";
import { OpPaperOrder } from "../component/Menu/MenuComponets/OpPaperOrder";
import { Ose } from "../component/Menu/MenuComponets/Ose";
import { RepairOrder } from "../component/Menu/MenuComponets/RepairOrder";
import { BearingOrder } from "../component/Menu/MenuComponets/BearingOrder";
import { OpExcel } from "../component/Menu/MenuComponets/OpExcel";
import { OpPayments } from "../component/Menu/MenuComponets/OpPayments";
import { InsertText } from "../component/Menu/MenuComponets/InsertText";
import { CreateMailForPaperOrder } from "../component/Menu/MenuComponets/CreateMailForPaperOrder";
import { ItemJudgeEntry } from "../component/Menu/MenuComponets/ItemJudgeEntry";

const runFunc = async (menuName, settings, params) => {
  const result = await window.eel.run_automation(
    menuName,
    settings,
    params
  )();
  return result;
};

export const menus = [
  {
    title: "発注計画(国内) 展開",
    descripyion: "発注計画ｴﾝﾄﾘｰより国内受注の一括内示を行う。",
    form: {
      body: <Op />,
      data: {
        initialValues: {
          id: "",
          password: "",
          startPage: 0,
          nameInitial: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "発注計画(海外A) 展開",
    descripyion: "発注計画ｴﾝﾄﾘｰより海外Aｵｰﾀﾞｰの一括内示を行う。",
    form: {
      body: <Op />,
      data: {
        initialValues: {
          id: "",
          password: "",
          startPage: 0,
          nameInitial: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "発注計画(海外C) 展開",
    descripyion: "発注計画ｴﾝﾄﾘｰより海外Cｵｰﾀﾞｰの一括伝票発行を行う。",
    form: {
      body: <OpC />,
      data: {
        initialValues: {
          id: "",
          password: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "特急製作依頼書 作成",
    descripyion: "発注計画ｴﾝﾄﾘｰより特急製作依頼書の作成を行う。",
    form: {
      body: <OpPaperOrder />,
      data: {
        initialValues: {
          id: "",
          password: "",
          type: "",
          startPage: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "ｵｰﾀﾞｰｼｰﾄ 作成",
    descripyion: "発注残情報からつくばO/Sの作成を行う。",
    form: {
      body: <Ose />,
      data: {
        initialValues: {
          id: "",
          password: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "預かり修理 展開",
    descripyion:
      "発注計画ｴﾝﾄﾘｰより預かり修理品の一括内示を行い、管理ｴｸｾﾙに情報を自動入力する。",
    form: {
      body: <RepairOrder />,
      data: {
        initialValues: {
          id: "",
          password: "",
          orders: [{ orderNum: "", linesNum: "", itemNum: "" }],
        },
      },
    },
    runFunc,
  },
  {
    title: "支給品 手配",
    descripyion: "発注計画ｴﾝﾄﾘｰより、手配が必要な支給品の発注データを作成する",
    form: {
      body: <OpPayments />,
      data: {
        initialValues: {
          id: "",
          password: "",
          type: "",
          startPage: 0,
          nameInitial: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "発注計画 展開(Excel)",
    descripyion: "Excelデータより発注展開を行う",
    form: {
      body: <OpExcel />,
      data: {
        initialValues: {
          id: "",
          password: "",
          excel: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "胴ﾍﾞｱﾘﾝｸﾞ 手配",
    descripyion: "w/c京二へ胴ﾍﾞｱﾘﾝｸﾞの手配依頼を行う",
    form: {
      body: <BearingOrder />,
      data: {
        initialValues: {
          id: "",
          password: "",
          orderNum: "",
          linesNum: "",
          customerName: "",
          machineInfo: { name: "", number: "" },
          items: [{ itemNum: "", type: "", locatios: [] }],
          deliveryTime: "",
          file: "",
          description: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "特急製作依頼書 ﾃｷｽﾄ挿入",
    descripyion: "特急製作依頼書に納期ﾃｷｽﾄを挿入する",
    form: {
      body: <InsertText type="特急製作依頼" />,
      data: {
        initialValues: {
          pdfFiles: "",
          excelFile: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "支給品一覧 ﾃｷｽﾄ挿入",
    descripyion: "特急製作依頼書に納期ﾃｷｽﾄを挿入する",
    form: {
      body: <InsertText type="支給" />,
      data: {
        initialValues: {
          pdfFiles: "",
          excelFile: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "特急製作依頼書 ﾒｰﾙ作成",
    descripyion: "特急製作依頼書の送信ﾒｰﾙを作成する",
    form: {
      body: <CreateMailForPaperOrder />,
      data: {
        initialValues: {
          pdfFiles: "",
        },
      },
    },
    runFunc,
  },
  {
    title: "品番判断ｴﾝﾄﾘｰ 自動確定",
    descripyion: "品番判断ｴﾝﾄﾘ-の確定可能品を自動確定する",
    form: {
      body: <ItemJudgeEntry />,
      data: {
        initialValues: {
          id: "",
          password: "",
        },
      },
    },
    runFunc,
  },
];
