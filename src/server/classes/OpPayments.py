from dataclasses import dataclass
from server.classes.ServiceSystemOperation import ServiceSystemOperation
from server.utils import get_id
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver

@dataclass
class OpPayments(ServiceSystemOperation):
    brower: WebDriver
    wait: WebDriverWait
    i: int 
    order_num: str = ""
    lines_num: str = ""
    item_num: str = ""      

    
    def start(self) -> bool:
        if super().get_value(get_id("支給品ﾌﾗｸﾞ_op_results", self.i)):
            super().btn_click(get_id("支給_op_results", self.i))
            super().the_element_view_wait("H_cnfrm_btn")
            return True

        return False

    def end(self) -> None:
        super().btn_click(get_id("確認_op_payments"))
        super().clickable_wait("H_dtrmn_btn") 
        super().btn_click(get_id("確定_op_payments"))
        super().the_element_view_wait(get_id("備考_op_results"))
    
    def click_only(self) -> bool:
        is_payments = self.start()
        if is_payments:
            self.end()
        
        return is_payments

    def payments_exists(self) -> list[int]:
        sup = super()
        return [len(sup.get_elements("id", get_id("品番_op_payments", i))) for i in range(5)]
    
    
    def click_only_when_creating_op(self) -> bool:

        KAMOKU = super().get_value(get_id("科目_op_results", self.i))
        if KAMOKU == "07":
            super().btn_click(get_id("支給_op_results", self.i))
            super().the_element_view_wait("H_cnfrm_btn")
            payments_item_num = sum(self.payments_exists())
            payments_item_exists = True if payments_item_num > 0 else False
            self.end()

            return payments_item_exists

        return False

    
