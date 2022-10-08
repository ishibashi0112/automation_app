from server.classes.ServiceSystemOperation import ServiceSystemOperation
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver
from dataclasses import dataclass
from server.utils import  get_id, get_xpath


@dataclass
class Ha(ServiceSystemOperation):
    brower: WebDriver
    wait: WebDriverWait
    order_num: str
    lines_num: str
    item_num: str
    menu_num: int
    
    def __post_init__(self) -> None:
        super().screen_switching(self.menu_num)
    
    def search(self) -> None:
        super().set_value(get_id("品番_ha_search"), self.item_num)
        super().btn_click(get_id("検索_ha_search"))
        super().nomal_wait()
    
    def do(self) -> None:
        order_els = super().get_elements("xpath", get_xpath("検索結果_ha_results"))

        for i in range(len(order_els)-1):
            order_num_ha = super().get_value(get_id("受注NO_ha_results", i))
            lines_num_ha = super().get_value(get_id("行NO_ha_results", i))
            if self.order_num == order_num_ha and self.lines_num == lines_num_ha:
                super().btn_click(get_id("変更_ha_results" ,i))
                super().the_element_view_wait("M1_ctl02_H_m1_slct_chk") 
                super().btn_click(get_id("削除_ha_results" ,i))
                super().btn_click(get_id("確認_ha_results" ,i))
                super().clickable_wait("H_dtrmn_btn")
                super().btn_click(get_id("確定_ha_results" ,i))
                super().the_element_view_wait("H_item_cd") 
                break
