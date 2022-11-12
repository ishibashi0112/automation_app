from dataclasses import dataclass, field
from server.classes.ServiceSystemOperation import ServiceSystemOperation
from typing import Final, Literal, Optional
from datetime import datetime
from server.type import KouteDataResultsType, KouteiDataType, WeeksDataType
from server.type import ExcelDataKoutei, RuleSuppliers
from server.utils import get_id
from server.function import price_str_to_int, str_to_datetime, today_str, today, get_various_weeks, datetime_to_str, list_to_merge_str
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver

@dataclass
class OpKoutei(ServiceSystemOperation):
    brower: WebDriver
    wait: WebDriverWait
    i: int
    op_type: Literal["国内", "海外"]="国内"
    delivery_time: str=""
    settings_suppliers: list[RuleSuppliers] = field(default_factory=list) 
    num: int = 1
    koutei_data: list[KouteiDataType] = field(default_factory=list) 
    supplier_code_list: list[str] = field(default_factory=list) 
    
    def start(self) -> Optional[RuleSuppliers]:
        super().btn_click(get_id("工程_op_results", self.i))
        super().the_element_view_wait("H_cnfrm_btn")
        KOUTEI_exists_list = self.KOUTEI_exists()
        self.num = sum(KOUTEI_exists_list)
        self.supplier_code_list = self.get_supplier_code_list()

        supplier_rule = self.get_unique_supplier_rule()

        return supplier_rule if supplier_rule else None
            
    
    def end(self) -> None:
        super().btn_click(get_id("確認_op_KOUTEI"))
        super().clickable_wait("H_dtrmn_btn") 
        super().btn_click(get_id("確定_op_KOUTEI"))
        super().the_element_view_wait(get_id("備考_op_results"))
    
    def click_only(self) -> Optional[RuleSuppliers]:
        supplier_rule = self.start()
        self.set_price_not_setting()
        self.end()

        return supplier_rule if supplier_rule else None

    
    def process(self) -> KouteDataResultsType:
        supplier_rule = self.start()
        self.set_delivery_time()
        self.set_price_not_setting()
        KOUTEI_data: list[KouteiDataType] = []
        if self.delivery_time:
            KOUTEI_data = self.get_data()
        excel_data = self.get_data_for_excel() 
        self.end()

        if supplier_rule:
            return {"data": KOUTEI_data, "excel": excel_data, "supplier_rule": supplier_rule}
        else:
            return {"data": KOUTEI_data, "excel": excel_data, "supplier_rule": None}

    def _get_values(self, i: int) -> KouteiDataType:
        edi_checked = super().get_checked(get_id("EDI_op_KOUTEI", i))
        KouteI_values: KouteiDataType ={
                "納期": super().get_value(get_id("納期_op_KOUTEI", i)),
                "取引先code":super().get_value(get_id("取引先code_op_KOUTEI", i)),
                "取引先名": super().get_value(get_id("取引先名_op_KOUTEI", i)),
                "単価": super().get_value(get_id("単価_op_KOUTEI", i)),
                "EDI": True if edi_checked else False
            }
        return KouteI_values
    
    def get_data(self) -> list[KouteiDataType]:
        KOUTEI_data_list: list[KouteiDataType] = [self._get_values(i) for i in range(self.num)]
        self.koutei_data = KOUTEI_data_list
        
        return KOUTEI_data_list
    
    def KOUTEI_exists(self) -> list[int]:
        sup = super()
        return [len(sup.get_elements("id", get_id("工程NO_op_KOUTEI", i))) for i in range(3)]
    
    def get_supplier_code_list(self) -> list[str]:
        sup = super()
        return [sup.get_value(get_id("取引先code_op_KOUTEI", i)) for i in range(self.num)]

    def get_unique_supplier_rule(self) -> Optional[RuleSuppliers]: 
        if len(self.settings_suppliers):
            for rule in self.settings_suppliers:
                if rule["code"] in self.supplier_code_list and rule["isApply"]:
                    return rule
        
        return None
    
    def set_today_delicery_time(self) -> None:
        for i in range(self.num):
            super().set_value(get_id("納期_op_KOUTEI", i), today_str())

    
    # 単価未設定の入力
    def set_price_not_setting(self) -> None:
        for i in range(self.num):

            price_str = super().get_value(get_id("単価_op_KOUTEI", i))
            price = price_str_to_int(price_str)
            if price == 0:
                super().select(get_id("単価未設定_op_KOUTEI", i), "初品")

    # 納期の入力
    def set_delivery_time(self) -> None:        
        weeks_data_lib: Final[WeeksDataType] = {
            "KOUTEI_2": {8: [4, 4], 7: [4, 3], 6: [3, 3], 5: [3, 2], 4: [2, 2], 3: [2,1], 2: [1,1], 1: [1,1]}, 
            "KOUTEI_3": {8: [3, 3, 2], 7: [3, 2, 2], 6: [2, 2, 2], 5: [2, 2, 1], 4: [2, 1, 1], 3: [1, 1, 1], 2: [1, 1, 1], 1: [1, 1, 1]}
            }
        delivery_time_date: datetime = str_to_datetime(self.delivery_time)

        # 1工程
        if self.num == 1:
            # 納期が空欄の場合
            if not super().get_value(get_id("納期_op_KOUTEI")):
                super().set_value(get_id("納期_op_KOUTEI"), today_str())
            else:
                super().set_value(get_id("納期_op_KOUTEI"), self.delivery_time)

        # 2工程以上
        else:
            current_delivery_time: datetime = today()
            # 国内
            if self.op_type == "国内":
                weeks_num: int = 1
                for i in range(8):
                    weeks_num = 8 - i
                    if delivery_time_date >= get_various_weeks("move", weeks_num):
                        break

                select_weeks_key = "KOUTEI_2" if self.num == 2 else "KOUTEI_3"
                select_KOUTEI_num = weeks_data_lib[select_weeks_key] 

                weeks_list = select_KOUTEI_num[weeks_num]
                for i, weeks in enumerate(weeks_list):
                    current_delivery_time = get_various_weeks("move", weeks, current_delivery_time)
                    super().set_value(get_id("納期_op_KOUTEI", i), datetime_to_str(current_delivery_time))

            # 海外
            else:
                for i in range(self.num):
                    current_delivery_time = get_various_weeks("move", 1, current_delivery_time)
                    super().set_value(get_id("納期_op_KOUTEI", i), datetime_to_str(current_delivery_time))     
    
    
    def get_data_for_excel(self) -> ExcelDataKoutei:
        KOUTEI_data_list = self.koutei_data if self.koutei_data else self.get_data()
        
        excel_data_lib: ExcelDataKoutei = {}
        excel_data_lib["工程数"] = self.num
        excel_data_lib["取引先code"] = list_to_merge_str(KOUTEI_data_list, "__", "取引先code")
        excel_data_lib["取引先名"] = list_to_merge_str(KOUTEI_data_list, "__", "取引先名")
        excel_data_lib["納期"] = list_to_merge_str(KOUTEI_data_list, "__", "納期")
        excel_data_lib["単価"] = list_to_merge_str(KOUTEI_data_list, "__", "単価")

        return excel_data_lib
    
    def from_excel_to_process(self) -> None:
        self.start()
        self.set_price_not_setting()
        
        if self.delivery_time:
            delivery_time_str_list = self.delivery_time.split("__")
            for i in range(self.num):
                super().set_value(get_id("納期_op_KOUTEI", i), delivery_time_str_list[i])

        self.end()
        