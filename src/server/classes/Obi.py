from typing import Optional
from server.classes.ServiceSystemOperation import ServiceSystemOperation
from server.classes.Ha import Ha
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver
from dataclasses import dataclass, field
from server.type import ExcelDataObi, ObiOrderExistsResultsType, ObiOrderExistsType, ObiOrderSituationResultsType, ObiOrderSituationType, ObiRequiredDataType, ObiResultsOrderType
from server.utils import get_id, get_xpath


@dataclass
class Obi(ServiceSystemOperation):
    brower: WebDriver
    wait: WebDriverWait
    op_order_num: str
    op_lines_num: str
    op_item_num: str
    menu_num: int
    required_data: ObiRequiredDataType = field(default_factory=dict) 

    def __post_init__(self) -> None:
        super().screen_switching(self.menu_num)

    def search(self) -> bool:
        super().set_value(get_id("拠点_obi_search"), "p")
        super().set_value(get_id("品番_obi_search"), self.op_item_num)
        super().btn_click(get_id("検索_obi_search"))
        super().nomal_wait()
        search_result = len(super().get_elements("id", "M1"))
        
        return True if search_result else False

    def get_results_order_list(self) -> ObiResultsOrderType:
        results_items_list = super().get_elements("xpath", get_xpath("検索結果_obi_results"))
        results_order_list_upper_line = list(filter(lambda el: el.get_attribute("class") , results_items_list))
        results_order_list_bottom_line = list(filter(lambda el: not el.get_attribute("class") , results_items_list))
        
        return {"upper": results_order_list_upper_line, "bottom": results_order_list_bottom_line}
    
    def get_required_data_lib(self, i: int) -> ObiRequiredDataType:
        result: ObiRequiredDataType = {
            "status": super().get_value(get_id("ｽﾃｰﾀｽ_obi_results", i))  , 
            "受注NO": super().get_value(get_id("受注NO_obi_results", i)), 
            "行NO": super().get_value(get_id("行NO_obi_results", i)) , 
            "数量": int(super().get_value(get_id("数量_obi_results", i)).replace(',', '')), 
            "修理日": super().get_value(get_id("修理日_obi_results", i)), 
            "区分": super().get_value(get_id("区分_obi_results", i)), 
            "受注担当者": super().get_value(get_id("受注担当者_obi_results", i))
            }

        self.required_data = result

        return result
    
    # 補充分が有るかを確認
    def check_replenishment(self) -> bool:
        results_el_list = self.get_results_order_list()
        for i, _ in enumerate(results_el_list["upper"]):
            transactions_type = super().get_value(get_id("取引種別_obi_results", i))
            if transactions_type == "補充":
                return True
        
        return False

    def check_order_situation(self, before_result: Optional[ObiOrderSituationResultsType] = None) -> ObiOrderSituationResultsType:
        total_qty = 0
        current_result: ObiOrderSituationType = {
            "exist": False, 
            "many": False,
            "adjust": False,
            "total_qty": 0, 
            "ordering_qty": int(super().get_value( get_id("発注数_obi_results")).replace(',', '')), 
            "repair_days": "" 
        }       
        
        # 全受注をチャックする際は、前ページの情報を取得し引き継ぐ
        if before_result:
            current_result = before_result["data"]
            total_qty = current_result["total_qty"]
        
       
        results_el_list = self.get_results_order_list()
        for i, (_, _) in enumerate(zip(results_el_list["upper"], results_el_list["bottom"])):
            obi_data = self.get_required_data_lib(i)

            if not obi_data["status"] == "未引当":
                break

            if obi_data["区分"] == "仕込":
                total_qty += obi_data["数量"]

            if self.op_order_num == obi_data["受注NO"] and self.op_lines_num == obi_data["行NO"]:
                ZITURI_2 = int(super().get_value( get_id("実利2_obi_results")).replace(',', ''))
                # 引当調整の要否（web注文は不要）
                if (not obi_data["受注担当者"] == "自動")  and  (obi_data["数量"] <= ZITURI_2)  and  (obi_data["区分"] == "仕込"):
                    ha = Ha(self.brower, self.wait, self.op_order_num, self.op_lines_num, self.op_item_num, 3)
                    ha.search()
                    ha.do()
                    super().screen_switching(2)

                    current_result["adjust"] = True
                
                current_result["exist"] = True
                current_result["total_qty"] = total_qty
                current_result["repair_days"] = obi_data["修理日"]

                excel_data = self.get_data_for_excel(i, total_qty)

                return {"data": current_result, "excel": excel_data}
            
            if i == 6 and  not current_result["many"]:
                current_result["many"] = True

        return {"data": current_result, "excel": None}
    

    def check_order_exists(self) -> ObiOrderExistsResultsType:
        results_el_list = self.get_results_order_list()
        result: ObiOrderExistsType = {"exist": False, "repair_days": ""}
        for i, (_, _) in enumerate(zip(results_el_list["upper"], results_el_list["bottom"])):
            obi_data = self.get_required_data_lib(i)

            if not obi_data["status"] == "未引当":
                break

            if self.op_order_num == obi_data["受注NO"] and self.op_lines_num == obi_data["行NO"]:
                result["exist"] = True
                result["repair_days"] = obi_data["修理日"]

                excel_data = self.get_data_for_excel(i)

                return {"data": result, "excel": excel_data}

        return {"data": result, "excel": None}


    
    def check_all_order(self) -> ObiOrderExistsResultsType:
        if self.check_pages_exists():
            while True:
                result = self.check_order_exists()
                result_data = result["data"]
                if result_data["exist"]:
                    return result

                if self.check_next_page_exists():
                    self.move_next_page()               
                    super().nomal_wait()
                else:
                    break

            return {"data": {"exist": False, "repair_days": "" }, "excel": None}
        else:
            result = self.check_order_exists()
            return result
    
    def check_all_order_situation(self, return_qty: bool = False) -> ObiOrderSituationResultsType:
        if self.check_pages_exists():
            before_result = None
            while True:
                current_result = self.check_order_situation(before_result)
                before_result = current_result
                if current_result["data"]["exist"]:
                    return current_result

                if self.check_next_page_exists():
                    self.move_next_page()               
                    super().nomal_wait()
                else:
                    break

            return {"data": None, "excel": None} if not return_qty else before_result
        else:
            result = self.check_order_situation()
            return result
            
        
    
    def get_data_for_excel(self, i: int, total_qty: int=0) -> ExcelDataObi:
        excel_data_lib: ExcelDataObi  = {
            "品名": super().get_value(get_id("品名_obi_search",i)),
            "仕様": super().get_value(get_id("仕様_obi_search",i)),
            "受注数": int(super().get_value(get_id("受注数_obi_results",i)).replace(',', '')),
            "発注数": int(super().get_value(get_id("発注数_obi_results",i)).replace(',', '')),
            "未引当数": total_qty ,
            "客先code": super().get_value(get_id("客先ｺｰﾄﾞ_obi_results",i)),
            "客先名": super().get_value(get_id("客先名_obi_results",i)),
            "区分": self.required_data["区分"] if self.required_data else super().get_value(get_id("区分_obi_results",i)),
            "修理日": self.required_data["修理日"] if self.required_data else super().get_value(get_id("修理日_obi_results",i)),
            "実利2":  int(super().get_value(get_id("実利2_obi_results",i)).replace(',', '')),
            "受注担当者": self.required_data["受注担当者"] if self.required_data else super().get_value(get_id("受注担当者_obi_results",i)),
            "製番": super().get_value(get_id("製番_obi_results",i))
            }
        return excel_data_lib
    
    def check_pages_exists(self) -> bool:
        pagenation_zone = super().get_elements("id", "H_pager")
        return True if len(pagenation_zone) > 0 else False


    def check_next_page_exists(self) -> bool:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn_obi_results"))
        last_a_tag_text = page_list[-1].text

        return True if "Next" in last_a_tag_text else False
    
    def move_next_page(self) -> None:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn_obi_results"))
        nextpage_btn = page_list[-1]
        nextpage_btn.click()
