export type SettingOpItems = {
  id: string;
  isApply: boolean;
  itemName: string;
  itemNum: string;
  rule: "処理をスルー" | "伝票を発行" | "発注計画を削除";
};

export type SettingOpSuplliers = {
  id: string;
  isApply: boolean;
  Name: string;
  code: string;
  rule: "処理をスルー" | "伝票を発行";
};

export type SettingSchedules = {
  id: string;
  start: string;
  end: string;
  title: string;
};

export type firestoreCollections =
  | SettingOpItems
  | SettingOpSuplliers
  | SettingSchedules;

export type Settings = {
  op: { items: SettingOpItems[]; suppliers: SettingOpSuplliers[] };
  schedules: SettingSchedules[];
};

export type LoginValues = {
  id: string;
  password: string;
};

export type OpCValues = LoginValues & {
  isChangeDeliveryTime: boolean;
};

export type OpValues = LoginValues & {
  startPage: number;
  nameInitial: string;
};

export type RepairOrderInfo = {
  orderNum: string;
  linesNum: string;
  itemNum: string;
};

export type RepairOrderValues = LoginValues & {
  orders: RepairOrderInfo[];
};

export type OpPaperValues = LoginValues & {
  type: "国内" | "海外" | "";
  startPage: number;
};

export type OpPaymentsValues = LoginValues & {
  type: "国内" | "海外" | "";
  startPage: number;
  nameInitial: string;
};

export type OpExcelValues = LoginValues & {
  excel: File | "";
};

export type InsertTextValues = {
  pdfFiles: File | string;
  excelFile: File | string;
};

export type CreateMailForPaperOrderValues = {
  pdfFiles: File | string;
};

export type BearingOrderValues = LoginValues & {
  orderNum: string;
  linesNum: string;
  customerName: string;
  machineInfo: { name: string; number: string };
  items: { itemNum: string; type: string; locatios: string[] }[];
  deliveryTime: Date | "";
  file: string;
  description: string;
};

export type FormValues =
  | LoginValues
  | OpValues
  | OpPaperValues
  | OpPaymentsValues
  | InsertTextValues
  | CreateMailForPaperOrderValues
  | OpExcelValues
  | BearingOrderValues;

export type OCRResult = {
  info: RepairOrderInfo[];
  images: string[];
};
