from server.classes.ServiceSystemOperation import ServiceSystemOperation
from server.classes.OpKoutei import OpKoutei
from server.classes.OpPayments import OpPayments
from server.function import get_various_weeks, LT_to_weeks, get_various_consecutive_date_list, datetime_to_str, str_to_datetime, today_str
from server.utils import get_id, get_xpath
from typing import Literal
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement
from datetime import datetime
from server.type import DuplicateItemType, OpRequiredDataType
from server.type import ExcelDataOp
import re


class Op(ServiceSystemOperation):

    def header_input(self, type: Literal["国内", "海外", "海外C"]) -> None:
        select_text = "国内U/A/B/C" if type == "国内" else "海外U/A" if type == "海外" else "不足 国内　海外B/C"
        super().select(get_id("計画区分_op_search"), select_text,)
        super().select(get_id("内示_op_search"), "未内示")
        super().btn_click(get_id("検索_op_search"))

        super().nomal_wait()

    
    def move_start_page(self, start_page: int) -> None:
        page_info_text = super().get_element("id", "M1PageInfo").text
        page_text_re = re.search("(?<=\().+?(?=\))", page_info_text)

        if not page_text_re:
            return

        page_text = page_text_re.group()
        last_page_text = int(page_text.split(" ")[-1])

        if start_page > last_page_text:
            raise ValueError("指定されたﾍﾟｰｼﾞ数は存在しません")

        while True:
            page_num_el_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn_op_results"))
            for page_num_el in page_num_el_list:
                if page_num_el.text == str(start_page):
                    super().btn_click(arg_element=page_num_el)
                    super().nomal_wait()

                    return

            super().btn_click(arg_element=page_num_el_list[-2])
            super().nomal_wait()

    
    def get_item_els(self) -> list[list[WebElement]]:
        sup = super()
        return [sup.get_elements("id", get_id("備考_op_results", i)) for i in range(4)]

    def get_required_data_lib(self, i: int) -> OpRequiredDataType:
        required_data: OpRequiredDataType = {
            "品番": super().get_value(get_id( "品番_op_results", i)),
            "受注NO": super().get_value(get_id( "受注NO_op_results", i)),
            "行NO": super().get_value(get_id( "行NO_op_results", i)),
            "LT": int(super().get_value(get_id( "L/T_op_results", i)).replace(',', '')),
            "数量": int(super().get_value(get_id( "数量_op_results", i)).replace(',', ''))
        }
        return required_data
    
    # 数量入力のエラー回避のため
    def set_qty(self, i:int , qty: int) -> None:
        qty_input = super().get_element("id", get_id("数量_op_results", i)) 
        qty_input.send_keys(Keys.CONTROL + 'a', Keys.BACKSPACE) 
        qty_input.send_keys(qty)
    

    def check_qty_and_lot(self, i:int, qty: int ) -> int: 
        lot = int(super().get_value(get_id("LOT_op_results", i)).replace(',', ''))
        result = divmod(qty, lot)

        if qty > lot :
            if result[1] == 0:
                return qty

            if result[1] > 0:
                new_qty = lot * (result[0]+1)
                return new_qty

        if qty <= lot :
            return lot

        return qty
    
    def check_No_EDI_exists(self, KOUTEI_data) -> bool:
        EDI_exists_list: list[bool] = [data.get("EDI") for data in KOUTEI_data] 
        No_EDI_exists = False in EDI_exists_list 
        return No_EDI_exists
    
    def check_duplicate_item_exists(self, item_num_op: str, duplicate_item_list: list[DuplicateItemType]) -> list[DuplicateItemType]:
        item_exists_list = list(filter(lambda item: item["品番"] == item_num_op, duplicate_item_list))
        
        return item_exists_list
    
    def add_comment_and_through(self, i: int, notes_text: str) -> None:
        super().btn_click(get_id("更新_op_results", i))
        super().set_value(get_id("備考_op_results", i), notes_text)  
        koutei = OpKoutei(self.brower, self.wait, i)
        koutei.click_only()
        payments = OpPayments(self.brower, self.wait, i)
        payments.click_only()


    def delete(self, i: int, notes_text: str="") -> None:
        super().btn_click(get_id("更新_op_results", i))
        super().set_value(get_id("備考_op_results",i), notes_text)
        super().btn_click(get_id("削除_op_results", i))
    

    def decide_delivery_time(self, repair_days_str: str, item_lt: int, op_type: Literal["国内", "海外"]="国内") -> str:
        nomal_delivery_time = get_various_weeks("move", LT_to_weeks(item_lt))
        later_weeks_list = get_various_consecutive_date_list("move", 8, date_type="weeks")
        # 国内の場合
        if op_type == "国内":            
            # 修理予定がない受注は、L/T通りの納期を返す
            if not repair_days_str:
                return datetime_to_str(nomal_delivery_time)
            
            repair_days = str_to_datetime(repair_days_str)
            repair_days_one_week_ago = get_various_weeks("back", 1, repair_days)
            repair_days_ago_list = get_various_consecutive_date_list("back", 3, repair_days, "days")

            # 最初にL/Tと修理日を比較
            if repair_days_ago_list[2] >= nomal_delivery_time:
                return datetime_to_str(nomal_delivery_time)

            # 修理日から-1週間に設定 (※修理日が1週間以内の場合は、1週間後に設定)
            else:
                for i, _ in enumerate(later_weeks_list):
                    if not i:
                        if repair_days < later_weeks_list[0]:
                            return datetime_to_str(later_weeks_list[0])

                        continue
                    
                    if i == 1 and repair_days_ago_list[1] < later_weeks_list[0]:
                        return datetime_to_str(repair_days_ago_list[0])

                    if later_weeks_list[i-1] <= repair_days < later_weeks_list[i]:
                        if later_weeks_list[i-1] >= repair_days_ago_list[2]:                          
                            return datetime_to_str(repair_days_ago_list[2])

                        return datetime_to_str(later_weeks_list[i-1])
                        
                return datetime_to_str(repair_days_one_week_ago)

        # 海外の場合
        else:
            twe_weeks_later = later_weeks_list[1]
            if nomal_delivery_time < twe_weeks_later:  
                return datetime_to_str(nomal_delivery_time)

            return datetime_to_str(twe_weeks_later)
    
    def decide_qty(self, i: int, op_qty: int, total_qty: int,  item_exists_list, delivery_time: str) -> int:
        # 同品番での手配が既に有る場合
        if len(item_exists_list):
            last_order_data = item_exists_list[-1]
            before_delivery_time: datetime = last_order_data.get("納期")
            current_delivery_time: datetime = str_to_datetime(delivery_time) 

            if before_delivery_time <= current_delivery_time:
                return op_qty
            else:
                return total_qty

        # 同品番での手配が無い場合且つLOTが1の場合
        elif int(super().get_value(get_id("LOT_op_results", i)).replace(',', '')) == 1:
            return total_qty
        # 　　　　　　　”　　　　　LOTが1以上の場合 
        else:
            return self.check_qty_and_lot( i, total_qty)
            
        # -------------------------------------------------------------------------------------
    
    def decide_comment(self, is_payments: bool, KOUTEI_data, name_initial: str="") -> str:
        KOUTEI_str_list = [f"工程({i+1}):{data.get('取引先名')}" for i, data in enumerate(KOUTEI_data)] 
        No_EDI_exists = self.check_No_EDI_exists(KOUTEI_data)
        comment = f"{today_str()}  ご確認の程宜しく御願い致します。 {name_initial}"
        if len(KOUTEI_data) > 1:
            # コメント確定（紙、支給品、通常で条件分岐）
            if No_EDI_exists and is_payments:
                comment = f"紙 支給 {' '.join(KOUTEI_str_list)}" 
            
            elif No_EDI_exists:
                comment = f"紙{' '.join(KOUTEI_str_list)}"

            elif is_payments:
                comment = f"支給 {' '.join(KOUTEI_str_list)}"
            else:
                comment = f"{today_str()}  {' '.join(KOUTEI_str_list)}  ご確認の程宜しく御願い致します。 {name_initial}"
        else:    
            # コメント確定（紙、支給品、通常で条件分岐）
            if No_EDI_exists and is_payments:
                comment = "紙 支給" 
            
            elif No_EDI_exists:
                comment = "紙"

            elif is_payments:
                comment = "支給"
        
        return comment

    
    def get_data_for_excel(self, i: int=0, text: Literal["内示", "確定", "削除", ""] ="") -> ExcelDataOp:
        page: int = int(super().get_text(get_xpath("ﾍﾟｰｼﾞ_op_results"), "xpath"))

        excel_data_lib: ExcelDataOp = {}
        # if not self.required_data_lib:
        #     excel_data_lib["品番"] = super().get_value(get_id("品番_op_results",i))
        #     excel_data_lib["受注NO"] = super().get_value(get_id("受注NO_op_results",i))
        #     excel_data_lib["行NO"] = super().get_value(get_id("行NO_op_results",i))
        #     excel_data_lib["LT"] = int(super().get_value(get_id("L/T_op_results",i)).replace(',', ''))

        excel_data_lib["対応"] = text
        excel_data_lib["受注NO"] = super().get_value(get_id("受注NO_op_results",i))
        excel_data_lib["行NO"] = super().get_value(get_id("行NO_op_results",i))
        excel_data_lib["page"] = page
        excel_data_lib["品番"] = super().get_value(get_id("品番_op_results",i))
        excel_data_lib["品名"] = super().get_value(get_id("品名_op_results",i))
        excel_data_lib["仕様"] = super().get_value(get_id("仕様_op_results",i))
        excel_data_lib["数量"] = int(super().get_value(get_id("数量_op_results",i)).replace(',', ''))
        excel_data_lib["LOT"] = int(super().get_value(get_id("LOT_op_results",i)).replace(',', ''))
        excel_data_lib["製番"] = super().get_value(get_id("製番_op_results",i))
        excel_data_lib["備考"] = super().get_value(get_id("備考_op_results",i))
        excel_data_lib["LT"] = int(super().get_value(get_id("L/T_op_results",i)).replace(',', ''))

        return excel_data_lib

    def check_pages_exists(self) -> bool:
        pagenation_zone = super().get_elements("id", "H_pager")
        return True if len(pagenation_zone) > 0 else False


    def check_next_page_exists(self) -> bool:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn_op_results"))
        last_a_tag_text = page_list[-1].text

        return True if "Next" in last_a_tag_text else False
    

    def move_next_page(self) -> None:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn_op_results"))
        nextpage_btn = page_list[-1]
        nextpage_btn.click()
    
    def complete(self) -> bool:
        super().btn_click(get_id("確認_op_footer"))

        if len(super().get_elements("id", "header_message1_MessageLbl")):
            return False

        super().clickable_wait("H_dtrmn_btn")
        super().btn_click(get_id("確定_op_footer"))
        super().nomal_wait()
        
        return True
    
    def clear_search_input(self) -> None:
        super().btn_click(get_id("クリア_op_search"))
        super().alert_accept()
        super().clickable_wait("H_srch_btn")
        








