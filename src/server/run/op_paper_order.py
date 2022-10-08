# C:\Users\kkc4726\Desktop\projects\automation\repair_order

from dataclasses import dataclass, field
from typing import  Literal, TypedDict
import os
import signal

from dotenv import load_dotenv
from server.classes.Op import Op
from server.classes.OpKoutei import OpKoutei
from server.function import error_action, success_action, today_str
from server.type import ExcelDataKoutei, MainProcessingResultsType
from server.utils import create_excel, get_id 

# load_dotenv("../../.env")

class ExcelDataOpPaper(TypedDict):
    品番: str
    受注NO: str 
    行NO: str 
    取引先code: str 
    納期: str
    備考: str
    

@dataclass
class OpPaper(Op):
    id: str 
    password: str
    startPage: int
    type: Literal["国内", "海外"] = "国内"
    excel_list: list[ExcelDataOpPaper] = field(default_factory=list)

    def __post_init__(self):
        super().set_up()
        super().open_main_page(os.environ["SERVICE_SYSTEM_URL"])
        super().Login(self.id, self.password)
    
    def add_to_excel_list(self, excel_data: ExcelDataOpPaper) -> None:
        self.excel_list.append(excel_data)
    
    def output_result_file(self):
        header_list = ["取引先code","品番","受注NO","行NO","納期", "備考"]
        file_name = f"紙{today_str(add_time=True)}"
        create_excel(self.excel_list, header_list, file_name)
    
    def KOUTEI_process(self, i: int) -> ExcelDataKoutei:
        koutei = OpKoutei(self.brower, self.wait, i, self.type)
        koutei.start()
        KOUTEI_excel_data = koutei.get_data_for_excel()    
        if KOUTEI_excel_data["取引先code"] == "10692":
            price_KUBUN = self.get_selected_text(get_id("単区_op_KOUTEI"))
            if price_KUBUN == "概算":
                self.select(get_id("単区_op_KOUTEI"), "決定")
        koutei.end()

        return KOUTEI_excel_data


def op_paper_order(id: str, password: str, startPage: int, type: Literal["国内", "海外"]) -> MainProcessingResultsType:

    op = OpPaper(id, password, startPage, type)
    try:
        op.menu_open("op_entry", 1)
        op.menu_open("obi_entry", 2)
        op.screen_switching(1)
        op.header_input(op.type)
        op.move_start_page(startPage)

        is_not_last_page = True
        while is_not_last_page:
            items_list = op.get_item_els()
            for i, item in enumerate(items_list):

                #次にみるitemが無い場合
                if item == []:
                    break

                #備考欄に"紙"が記載されているもの
                comment = op.get_value(get_id("備考_op_results", i))
                if "紙" in comment:
                    current_op_data = op.get_required_data_lib(i)

                    KOUTEI_excel_data = op.KOUTEI_process(i)

                    op.btn_click(get_id("更新_op_results", i))
                    if KOUTEI_excel_data["取引先code"] == "10692":
                        op.btn_click(get_id("確定check_op_results", i))
                    else:
                        op.btn_click(get_id("内示_op_results", i))

                    excel_data: ExcelDataOpPaper = {
                        "品番": current_op_data["品番"], 
                        "受注NO": current_op_data["受注NO"], 
                        "行NO": current_op_data["行NO"], 
                        "取引先code": KOUTEI_excel_data["取引先code"], 
                        "納期": KOUTEI_excel_data["納期"],
                        "備考": comment
                    }

                    op.add_to_excel_list(excel_data)


                    continue

            is_not_last_page = op.check_next_page_exists()

            if is_not_last_page:
                op.move_next_page() 
                op.nomal_wait()

        op.output_result_file()

        # op.complete()
              

        return success_action()
    except Exception as e:
        return error_action(e)
    finally:
        os.kill(op.brower.service.process.pid,signal.SIGTERM)

  
     
if __name__ == "__main__":
    print(123)
   