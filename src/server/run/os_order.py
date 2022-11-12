# C:\Users\kkc4726\Desktop\projects\automation\os
from dataclasses import dataclass, field
from time import sleep
from typing import Any, Optional, TypedDict
import os
import signal
from server.classes.Op import Op
from server.function import error_action, get_various_weeks, success_action
from server.type import MainProcessingResultsType 

class OsOrderItemInfo(TypedDict):
    品番: str
    数量: int
    JOBNO: str
    受注NO: Optional[str]

@dataclass
class OsOrder(Op):
    id: str 
    password: str

    no_order_list: Any = field(default_factory=list)
    has_order_list: Any = field(default_factory=list)

    def __post_init__(self) -> None:
        super().set_up()
        super().open_main_page(os.environ["SERVICE_SYSTEM_URL"])
        super().Login(self.id, self.password)
    
    def or_inquiry_header_input(self) -> None:
        super().set_value( "ReportViewerControl_ctl04_ctl07_txtValue", 10692)
        super().select("ReportViewerControl_ctl04_ctl11_ddValue", "未着荷")
        super().select("ReportViewerControl_ctl04_ctl27_ddValue", "未打切")
        super().btn_click("ReportViewerControl_ctl04_ctl00")

        sleep(90)
    
    def or_inquiry_is_last_page(self) -> bool:
        current_page = int(super().get_value("ReportViewerControl_ctl05_ctl00_CurrentPage"))
        total_page = int(super().get_text("ReportViewerControl_ctl05_ctl00_TotalPages"))

        if current_page == total_page:
            return True
        else:
            return False
    

    def or_inquiry_summarize_qty(self, original_list) -> list[OsOrderItemInfo]:
        new_list = []
        for i, original_dict in enumerate(original_list):
            if i == 0:
                new_list.append(original_dict)
                continue

            state_dict = {"exists": False, "idx": 0}
            for i_b, new_list_dict in enumerate(new_list):
                if original_dict["品番"] == new_list_dict["品番"]:
                    state_dict = {"exists": True, "idx": i_b}
                    break

            if state_dict["exists"]:
                new_list[state_dict["idx"]]["数量"] += original_dict["数量"]
                new_list[state_dict["idx"]]["JOBNO"] += f"/{original_dict['JOBNO']}"

            else:
                new_list.append(original_dict)

        return new_list

    
    def or_inquiry_process(self) -> None:
        page = 1
        while True:     
            xpath_num = "3" if page == 1 else "1"
            base_xpath = f"//div[@id='VisibleReportContentReportViewerControl_ctl09']/div/table/tbody/tr/td/table/tbody/tr[1]/td/table/tbody/tr/td/table/tbody/tr[{xpath_num}]/td/table/tbody"
            order_items = super().get_elements(
                    "xpath", 
                    f"{base_xpath}/tr"
                ) 

            for row in range(len(order_items)-2):
                td_elements = super().get_elements(
                    "xpath", 
                    f"{base_xpath}/tr[{row+3}]/td"
                ) 

                item_dict = {}
                for col, td in enumerate(td_elements):
                    if col == 0:
                        item_dict["品番"] = td.text

                    if col == 11:
                        item_dict["数量"] = int(td.text)

                    if col == 13:
                        item_dict["JOBNO"] = td.text
                    
                    # 回答納期欄に値が入っている場合はスルー
                    if col == 16 and len(td.text) > 1:
                        break

                    if col == 22:
                        item_dict["受注NO"] = td.text
                        
                        # 受注NOが振られているかどうかで格納するリストを振り分ける
        
                        if len(item_dict["受注NO"]) == 10:            
                            self.has_order_list = [*self.has_order_list, item_dict] 
                        else:
                            self.no_order_list = [*self.no_order_list, item_dict] 

            
            if self.or_inquiry_is_last_page():
                break

            else:
                page += 1
                super().btn_click("ReportViewerControl_ctl05_ctl00_Next_ctl00_ctl00")

                sleep(5)

        self.has_order_list = self.or_inquiry_summarize_qty(self.has_order_list)
        self.no_order_list = self.or_inquiry_summarize_qty(self.no_order_list)
    

    def ose_write_process(self, items_list: list[OsOrderItemInfo], type) -> None:
        twe_weeks_later = get_various_weeks("move", 2) 
        three_weeks_later = get_various_weeks("move", 3) 

        super().btn_click( "H_new_entry_btn")

        super().the_element_view_wait("H_spclt_to_cd")

        super().set_value( "H_spclt_to_cd", 29711)
        super().set_value( "H_prdt_no", "9300NAI")
        super().set_value( "H_model_cd", "000")
        super().set_value( "H_sn", "0000")

        if type == "受注有":
            super().set_value( "H_rqst_dlvry_days", twe_weeks_later.strftime("%Y/%m/%d"))
            super().set_value( "H_cntn", "お客様より受注を頂いている分となります")

        if type == "受注無し":
            super().set_value( "H_rqst_dlvry_days", three_weeks_later.strftime("%Y/%m/%d"))
            super().set_value( "H_cntn", "ﾊﾟｰﾂｾﾝﾀｰ在庫補充分となります")
        
        i = 0
        for i_b, order in enumerate(items_list):
            id_text = f"{i+2}" if len(str(i+2)) == 2 else f"0{i+2}"

            super().set_value( f"M1_ctl{id_text}_H_m1_item_cd", order["品番"])
            super().set_value( f"M1_ctl{id_text}_H_m1_qty", order["数量"])

            if len(items_list)-1 == i_b:
                break
            
            i += 1
            if i > 9:
                i = 0
            
            super().btn_click( "H_dtl_add_btn")

            id_text = f"{i+2}" if len(str(i+2)) == 2 else f"0{i+2}"
            super().the_element_view_wait(f"M1_ctl{id_text}_H_m1_item_cd")
            
        
        super().btn_click( "H_cnfrm_btn")
        super().clickable_wait("H_dtrmn_btn")
        super().btn_click( "H_dtrmn_btn")
        super().clickable_wait("H_prnt_btn")
        super().btn_click( "H_prnt_btn")
        super().btn_click( "header_Button2")

        super().alert_accept()

        super().clickable_wait("H_new_entry_btn")
    
    def or_change_entry_process(self) -> None:
        jobno_list1 = [order["JOBNO"].split(sep="/") for order in self.no_order_list]
        jobno_list2 = [order["JOBNO"].split(sep="/") for order in self.has_order_list]
        jobno_list = jobno_list1 + jobno_list2

        for jobno in jobno_list:
            for job_str in jobno:
                super().set_value("H_po_job_no_fr",job_str)
                super().set_value("H_po_job_no_to",job_str)

                super().btn_click( "H_srch_btn")
                
                super().the_element_view_wait("M1_ctl02_H_m1_upd_chk")
                
                super().btn_click( "M1_ctl02_H_m1_upd_chk")
                super().set_value( "M1_ctl02_H_m1_answr_dlvry_days", "2099/01/01")

                super().btn_click( "H_cnfrm_btn")
                super().clickable_wait("H_dtrmn_btn")
                super().btn_click( "H_dtrmn_btn")
                super().clickable_wait("H_srch_btn")
        




def os_order(id: str, password: str) -> MainProcessingResultsType:
    try:
        oso = OsOrder(id, password)
        oso.menu_open("os_entry", 1)
        oso.menu_open("or_inquiry", 2)
        oso.menu_open("or_change_entry", 3)
        oso.screen_switching(2)

        oso.or_inquiry_header_input()
        oso.or_inquiry_process()

        oso.screen_switching(1)
        
        if (len(oso.no_order_list)):
            oso.ose_write_process(oso.no_order_list, "受注無し")

        if (len(oso.has_order_list)):
            oso.ose_write_process(oso.has_order_list, "受注有")    

        print(oso.no_order_list)
        print(oso.has_order_list)
        
        oso.screen_switching(3)

        oso.or_change_entry_process()
        
       
        return success_action()
    except Exception as e:
        return error_action(e)
    finally:
        os.kill(oso.brower.service.process.pid,signal.SIGTERM)
        

         
if __name__ == "__main__":
    os_order("kkc4726","kkc@4726")
  

        



   