from dataclasses import dataclass, field
import os
import signal
from typing import Any, TypedDict

from dotenv import load_dotenv
from server.classes.ServiceSystemOperation import ServiceSystemOperation
from server.function import error_action, success_action, today_str
from server.utils import create_excel, get_id, get_xpath
from selenium.webdriver.remote.webelement import WebElement

# load_dotenv("../../.env")

class IJEExcelData(TypedDict):
    受注NO: str
    行NO: str
    品番: str
    品名: str
    仕様: str
    受注者: str
    ｺﾒﾝﾄ: str

@dataclass
class ItemJudge(ServiceSystemOperation):
    id: str 
    password: str

    excel_list: Any = field(default_factory=list)

    def __post_init__(self) -> None:
        super().set_up()
        super().open_main_page(os.environ["SERVICE_SYSTEM_URL"])
        super().Login(self.id, self.password)
    
    def get_item_els(self) -> list[WebElement]:
        sup = super()
        return [sup.get_elements("id", get_id("品番_ij_results", i)) for i in range(6)]
    

    def new_excel(self) -> None:
        header_list = ["受注NO", "行NO", "品番", "品名", "仕様", "受注者", "ｺﾒﾝﾄ"]
        file_path = f"Y:\\530_資材事業課\\パーツセンター\\※GPC_購買部\\発注G\\automation\\result_data\\品番判断{today_str(True)}.xlsx"

        create_excel(self.excel_list ,header_list, file_path)
    

    def get_data_for_excel(self, i: int) -> IJEExcelData:
        return {
            "受注NO": super().get_value(get_id("受注NO_ij_results", i)),
            "行NO": super().get_value(get_id("行NO_ij_results", i)),
            "品番": super().get_value(get_id("品番_ij_results", i)),
            "品名": super().get_value(get_id("品名_ij_results", i)),
            "仕様": super().get_value(get_id("仕様_ij_results", i)),
            "受注者": super().get_value(get_id("受注者_ij_results", i)),
            "ｺﾒﾝﾄ": super().get_value(get_id("ｺﾒﾝﾄ_ij_results", i))
        }

    def append_excel_data(self, i: int) -> None:
        self.excel_list.append(self.get_data_for_excel(i))


def item_judge(id: str, password: str):
    ije = ItemJudge(id, password)
    try:
        ije.menu_open("item_judge_entry", 1)

        ije.screen_switching(1)
        ije.btn_click(get_id("検索_ij_search"))
        ije.nomal_wait()
        
        while True:
            items = ije.get_item_els()
            for i, item in enumerate(items):
                #次にみるitemが無い場合
                if item == []:
                    break

                if ije.get_value(get_id("DBﾌﾗｸﾞ_ij_results", i)):
                    ije.btn_click(get_id("更新_ij_results", i))
                    ije.btn_click(get_id("確定_ij_results", i))

                    continue

                ije.append_excel_data(i)
            
            next_page_exists = ije.check_next_page_exists() 

            if next_page_exists:
                ije.move_next_page()
                ije.nomal_wait()
            else:
                break
        
        ije.new_excel()
        return success_action()
    except Exception as e:
        ije.new_excel()
        return error_action(e)
    finally:
        os.kill(ije.brower.service.process.pid, signal.SIGTERM)

