from server.classes.ServiceSystemOperation import ServiceSystemOperation
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver
from dataclasses import dataclass
from server.utils import get_id, get_xpath

@dataclass
class Rd(ServiceSystemOperation):
    brower: WebDriver
    wait: WebDriverWait
    order_num: str 
    lines_num: str 
    item_num: str 
    menu_num: int

    def __post_init__(self) -> None:
        super().screen_switching(self.menu_num)
    
    def search(self) -> None:
        super().set_value(get_id("品番_rd_search"), self.item_num)
        super().btn_click(get_id("検索_rd_search"))
        super().nomal_wait()
    
    def back(self) -> None:
        super().btn_click(get_id("品番_rd_header"))


    def check_delete_target_exists(self) -> bool:
        results_els = super().get_elements("xpath", get_xpath("検索結果_rd_results"))
        status_list = []
        for i, _ in enumerate(results_els):          
            status = super().get_value(get_id("ｽﾃｰﾀｽ_rd_results", i))
            status_list.append(status)

        return "未引当" in status_list
    
    
    def all_delete(self) -> None:
        results_els = super().get_elements("xpath", get_xpath("検索結果_rd_results"))
        for i, _ in enumerate(results_els):          
            if not super().get_value(get_id("ｽﾃｰﾀｽ_rd_results", i)) == "未引当":

                continue

            super().btn_click(get_id("削除_rd_results", i))
    
    def end(self) -> None:
        super().btn_click(get_id("確認_rd_results"))
        super().clickable_wait("H_dtrmn_btn") 
        super().btn_click(get_id("確定_rd_results"))
        super().alert_accept()
        super().clickable_wait("H_srch_btn")
    
    def nomal_process(self) -> None:
        self.search()
        is_delete_record = self.check_delete_target_exists()
        if not is_delete_record :
            self.back()
            return
            
        self.all_delete()
        self.end()

            