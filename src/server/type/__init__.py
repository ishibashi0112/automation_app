from datetime import datetime
from typing import Literal, Optional, TypedDict
from selenium.webdriver.remote.webelement import WebElement

class OrdersInfo(TypedDict):
     orderNum: str 
     linesNum: str
     itemNum: str

class RuleItems(TypedDict):
    id: str
    isApply: bool
    itemName: str
    itemNum: str
    rule: Literal["処理をスルー", "伝票を発行", "発注計画を削除"]

class RuleSuppliers(TypedDict):
    id: str
    isApply: bool
    Name: str
    code: str
    rule: Literal["処理をスルー", "伝票を発行"]

class RuleOp(TypedDict):
    items: list[RuleItems]
    suppliers: list[RuleSuppliers]


class SchedulesType(TypedDict):
    id: str
    start: str
    end: str
    title: str

class Settings(TypedDict):
    op: RuleOp
    schedules: list[SchedulesType]


class RunArgsTypes(TypedDict, total=False):
    menuName: Literal["発注計画(国内) 展開", "発注計画(海外A) 展開", "発注計画(海外C) 展開", "特急製作依頼書 作成", "ｵｰﾀﾞｰｼｰﾄ 作成", "預かり修理 展開", "支給品 手配","発注計画 展開(Excel)","胴ﾍﾞｱﾘﾝｸﾞ 手配"]
    settings: Settings
    id: str
    password: str
    startPage: int
    type: Literal["国内", "海外"]
    nameInitial: str
    orders: list[OrdersInfo]


menuNameType = Literal["op_entry","obi_entry","ha_entry","rd_entry", "os_entry","or_inquiry"]
class MenuDataValue(TypedDict):
    open: list[str]
    wait: str

class MenuDataType(TypedDict):
    op_entry: MenuDataValue
    obi_entry: MenuDataValue
    ha_entry: MenuDataValue
    rd_entry: MenuDataValue


class ExcelDataKoutei(TypedDict, total=False):
    工程数: int
    取引先code: str
    取引先名: str
    納期: str
    単価: str

class ExcelDataFlags(TypedDict, total=False):
    要確認1: Literal["○", ""]
    要確認2: Literal["○", ""]

class WeeksDataType(TypedDict):
    KOUTEI_2: dict[int, list[int]]
    KOUTEI_3: dict[int, list[int]]

class ExcelDataOp(TypedDict, total=False):
    対応: Literal["内示", "確定", "削除", ""]
    受注NO: str
    行NO: str
    page: int
    品番: str
    品名: str
    仕様: str
    数量: int
    LOT: int
    製番: str
    備考: str
    LT: int


class ExcelDataObi(TypedDict, total=False):
    品名: str
    仕様: str
    受注数: int
    発注数: int
    未引当数: int
    客先code: str
    客先名: str
    区分: str
    修理日: str
    実利2: int
    受注担当者: str
    製番: str

class MainProcessingResultsType(TypedDict):
    state: Literal["success", "error"]
    message: str
    fullMessage: str
    type: str

class OpRequiredDataType(TypedDict):
    品番: str
    受注NO: str 
    行NO: str 
    LT: int
    数量: int

class DuplicateItemType(TypedDict):
    品番: str 
    納期: datetime

class ObiResultsOrderType(TypedDict):
    upper: list[WebElement]
    bottom: list[WebElement]

class ObiRequiredDataType(TypedDict):
    status: str
    受注NO: str
    行NO: str
    数量: int
    修理日: str
    区分: str
    受注担当者: str

class ObiOrderSituationType(TypedDict):
    exist: bool
    many: bool
    adjust: bool
    total_qty: int 
    ordering_qty: int 
    repair_days: str 

class ObiOrderSituationResultsType(TypedDict):
    data: Optional[ObiOrderSituationType]
    excel: Optional[ExcelDataObi]

class ObiOrderExistsType(TypedDict):
    exist: bool
    repair_days: str

class ObiOrderExistsResultsType(TypedDict):
    data: ObiOrderExistsType
    excel: Optional[ExcelDataObi]

class KouteiDataType(TypedDict):
    納期: str 
    取引先code: str 
    取引先名: str 
    単価: str 
    EDI: bool

class KouteDataResultsType(TypedDict):
    data: list[KouteiDataType]
    excel: ExcelDataKoutei
    supplier_rule: Optional[RuleSuppliers]

class OpExcelRequiredDataType(TypedDict):
    対応: Literal["内示", "確定", "削除"]
    受注NO: str
    行NO: str
    品番: str
    数量: int
    納期: str
    備考: str


class RepairOrderItemsType(TypedDict):
    orderNum: str
    linesNum: str
    itemNum: str 


class InsertExcelRequiredDataType(TypedDict):
    取引先code: str
    品番: str
    受注NO: str
    行NO: str
    納期: str