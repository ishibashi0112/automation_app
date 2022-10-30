from typing import Final, Literal, Optional
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome import service as fs
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
from selenium.webdriver.remote.webelement import WebElement
from webdriver_manager.microsoft import EdgeChromiumDriverManager



class WebDriverOparation:

    def set_up(self) -> None:
        chrome_service = fs.Service(executable_path=ChromeDriverManager().install())
        options = Options()
        options.add_experimental_option("detach", True)
        self.brower = webdriver.Chrome(service=chrome_service,options=options)
        self.wait =  WebDriverWait(self.brower , 15)
    
    def edge_set_up(self) -> None:
        edge_service = fs.Service(executable_path=EdgeChromiumDriverManager().install())
        self.brower = webdriver.Edge(service=edge_service)
        self.wait =  WebDriverWait(self.brower , 15)
 
    def open_main_page(self, url: str) -> None:
        self.brower.get(url)
    
    def alert_accept(self) -> None:  
        alert = self.brower.switch_to.alert
        alert.accept()
    
    # 要素(attr_value)が表示されるまで待つ
    attrNameType = Literal["id", "class", "tag_name", "xpath"]
    def the_element_view_wait(self, attr_value: str, attr_name: attrNameType="id") -> None:
        by = self.get_by(attr_name)
        self.wait.until(EC.visibility_of_element_located((by, attr_value)))
    
    def clickable_wait(self, attr_value: str, attr_name: attrNameType="id") -> None:
        by = self.get_by(attr_name)
        self.wait.until(EC.element_to_be_clickable((by, attr_value)))
    
    # ﾍﾟｰｼﾞの全ての要素が表示されるまで待つ
    def nomal_wait(self) -> None:
        self.wait.until(EC.presence_of_all_elements_located)
    
    # 画面切り替え　0:メインメニュー 1:発注計画エントリー 2:品目別受注照会
    def screen_switching(self, num: int) -> None:
        handle_array = self.brower.window_handles
        self.brower.switch_to.window(handle_array[num])

    def get_by(self, attr_name: Literal["id", "class", "tag_name", "xpath", "name"]) -> Optional[str]:
        attrs: Final[dict[str, str]] = {"id":  By.ID, "class": By.CLASS_NAME,"tag_name": By.TAG_NAME, "xpath": By.XPATH, "name": By.NAME}
        by: Optional[str] = attrs.get(attr_name)
        return by
    
    def get_element(self, attr_name: attrNameType, attr_value: str) -> WebElement:
        by = self.get_by(attr_name)
        element = self.brower.find_element(by=by, value=attr_value)
        return element
    
    def get_elements(self, attr_name: attrNameType, attr_value: str) -> list[WebElement]:
        by = self.get_by(attr_name)
        elements = self.brower.find_elements(by=by, value=attr_value)
        return elements
            
    def get_value(self, attr_value: str, attr_name: attrNameType="id") -> str:
        element = self.get_element(attr_name, attr_value)
        value = element.get_attribute("value")
        return value
    
    def get_checked(self, attr_value: str, attr_name: attrNameType="id") -> str:
        element = self.get_element(attr_name, attr_value)
        value = element.get_attribute("checked")
        return value
    
    def get_text(self, attr_value: str, attr_name: attrNameType="id") -> str:
        element = self.get_element(attr_name, attr_value)
        text = element.text
        return text

    def set_value(self,  attr_value: str, set_value: str, attr_name: attrNameType="id",) -> None:
        element = self.get_element(attr_name, attr_value)
        element.clear()
        element.send_keys(set_value)

    def btn_click(self, attr_value: str="", attr_name: attrNameType="id", arg_element: Optional[WebElement]= None) -> None:
        if arg_element:
            arg_element.click()
            return

        element = self.get_element(attr_name, attr_value)
        element.click()

    def select(self, attr_value: str="", select_value: str="", attr_name: attrNameType="id") -> None:
        element = self.get_element(attr_name, attr_value)
        select_el = Select(element)
        select_el.select_by_visible_text(select_value)

    def get_selected_text(self, attr_value: str="", attr_name: attrNameType="id") -> str:
        element = self.get_element(attr_name, attr_value)
        select_el: Select = Select(element)
        selected_option: WebElement = select_el.first_selected_option
        selected_text: str = selected_option.text
        return selected_text
