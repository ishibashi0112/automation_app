from server.classes.WebDriverOparation import WebDriverOparation
from time import sleep
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC
from server.type import menuNameType
from server.type import MenuDataValue, MenuDataType
from server.utils import get_xpath


class ServiceSystemOperation(WebDriverOparation):

    def Login(self, login_id: str, login_pass: str) -> None:
        super().set_value("LoginIDBox", login_id)
        super().set_value("PasswordBox", login_pass)
        sleep(1)
        super().btn_click("btnLogin")

        try:
            login_wait = WebDriverWait(self.brower, 4)
            login_wait.until(EC.alert_is_present())
            super().alert_accept()
        except TimeoutException:
            pass
        except Exception as e:
            print(e)

        
        super().the_element_view_wait("mn_66")

    def menu_open(self, menu_name: menuNameType , open_num: int) -> None:
        menus: MenuDataType = {
            "op_entry": {"open": ["mn_66", "mn_67"], "wait": "H_srch_btn" }, 
            "obi_entry": {"open": ["mn_4", "mn_11"], "wait": "H_base_point_cd"},
            "ha_entry": {"open": ["mn_101", "mn_107"], "wait": "H_item_cd" },
            "rd_entry": {"open": ["mn_101", "mn_113"], "wait": "H_item_cd" },
            "os_entry": {"open": ["mn_66", "mn_74"], "wait": "H_new_entry_btn" },
            "or_inquiry": {"open": ["mn_178", "mn_343","mn_344"], "wait": "ReportViewerControl_ctl04_ctl07_txtValue" },
            "dr_inquiry": {"open": ["mn_178", "mn_343","mn_365"], "wait": "ReportViewerControl_ctl04_ctl07_txtValue" },
            "or_change_entry": {"open": ["mn_1", "mn_66", "mn_70"], "wait": "H_srch_btn" },
            "item_judge_entry": {"open": ["mn_66", "mn_71"], "wait": "H_srch_btn"}
            }
        
        menu: MenuDataValue = menus[menu_name]
        menu_open = menu["open"]
        menu_wait = menu["wait"]

        for i, attr_value in enumerate(menu_open):
            super().btn_click(attr_value)
            if len(menu_open)-1 > i:
              super().the_element_view_wait(menu_open[i+1])
        
        super().screen_switching(open_num)
        super().the_element_view_wait(menu_wait)
        super().screen_switching(0)
    
    def move_next_page(self) -> None:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn"))
        nextpage_btn = page_list[-1]
        nextpage_btn.click()
    
    def check_next_page_exists(self) -> bool:
        page_list = super().get_elements("xpath", get_xpath("ﾍﾟｰｼﾞ_Next_btn"))
        last_a_tag_text = page_list[-1].text

        return True if "Next" in last_a_tag_text else False