from dataclasses import dataclass
import os
from typing import Literal, TypedDict
from server.classes.Op import Op
from server.classes.StmpMailer import StmpMailer
from server.classes.Win32comExcelOparation import Win32comExcelOparation
from server.function import error_action, success_action, today_str 
from server.type import  MainProcessingResultsType
import shutil
import base64

class BearingOrderMachineInfo(TypedDict):
    name: str
    number: str

class BearingOrderItemsInfo(TypedDict):
    itemNum: str 
    type: Literal["ｺﾞﾑ胴", "版胴", "圧胴", "渡胴", "ｺｰﾀｰｺﾞﾑ","A渡胴", "DU胴", "NO胴",]     
    locatios: list[str]

class BearingOrderFileInfo(TypedDict):
    data: str
    name: str



@dataclass
class BearingOrder(Op):
    id: str
    password: str
    orderNum: str
    linesNum: str
    customerName: str
    machineInfo: BearingOrderMachineInfo
    items: list[BearingOrderItemsInfo] 
    deliveryTime: str
    file: str
    description: str

    def __post_init__(self) -> None:
        today = today_str(add_time=True)[:8]
        BASE_PATH = f"Y:\\530_資材事業課\\パーツセンター\\※GPC_購買部\\発注G\\胴ベアリング依頼"
        self.excel_flame_path = f"{BASE_PATH}\\_胴ベアリング依頼書雛形.xlsx"
        self.new_excel_path = f"{BASE_PATH}\\{today}.xlsx"
        self.new_pdf_path = f"{BASE_PATH}\\受注NO_{self.orderNum} {self.machineInfo['name']}-{self.machineInfo['number']} {today}.pdf"
        self.new_pdf_filename = os.path.basename(self.new_pdf_path)
        self.bearing_file = base64.b64decode(self.file)
        self.bearing_file_name = "嵌合検査表.pdf"
        

    def create_order_sheet(self) -> None:
        shutil.copyfile(self.excel_flame_path, self.new_excel_path)

        excel = Win32comExcelOparation(self.new_excel_path)
        excel.open(1)
        excel.set_cell_value("C9", self.customerName)
        excel.set_cell_value("C10", self.orderNum)
        excel.set_cell_value("C11", self.machineInfo["name"])
        excel.set_cell_value("C12", self.machineInfo["number"])
        excel.set_cell_value("C21", self.description)
        excel.set_cell_value("L29", f"希望納期: {self.deliveryTime}")

        for i, item in enumerate(self.items):
            unit_text = ", ".join(item["locatios"])
            item_text = f"{item['itemNum']} {item['type']}({unit_text}) 計{len(item['locatios'])}ヶ"
            excel.set_cell_value((14+i, 3), item_text)
        
        excel.excel_to_pdf(self.new_pdf_path)
        excel.close()

        os.remove(self.new_excel_path)
    
    def send_order_email(self) -> None:
        from_address = "komori.service.automation@gmail.com"
        # cc_address = "hideaki_nemoto@komori.co.jp"
        password = "vwsogyjfmxjoqzmf"
        to_address = 'yuki_ishibashi@komori.co.jp'


        # メール件名、本文
        subject = f"{today_str()} 胴ベアリング 依頼"
        body = """
        ichikawa@kyoni.co.jp
        inami@kyoni.co.jp

        ㈱京二
        市川所長　井波様

        いつも大変お世話になっております。
        本件、添付にて新規の胴ベアリング手配依頼となります。

        ご確認の程宜しく御願いいたします。

        小森ｺｰﾎﾟﾚｰｼｮﾝ　つくばｸﾞﾛｰﾊﾞﾙﾊﾟｰﾂｾﾝﾀｰ　石橋
        """
        
        
        mail = StmpMailer("smtp.gmail.com", 587, from_address, password)
        
        # cc_address=cc_address,
        mail.set_send_to(from_address, to_address,  subject=subject )
        mail.set_body(body)
        mail.attach_file(self.new_pdf_path, self.new_pdf_filename)
        mail.attach_file(self.bearing_file, self.bearing_file_name)
        print(123)
        mail.send_email()
        print(456)

        



def bearing_order(
        id: str ,
        password: str, 
        orderNum: str, 
        linesNum: str, 
        customerName: str, 
        machineInfo: BearingOrderMachineInfo, 
        items: list[BearingOrderItemsInfo], 
        deliveryTime: str, 
        file: str, 
        description: str
    ) -> MainProcessingResultsType:

    try:
        bo = BearingOrder(id, password, orderNum, linesNum, customerName, machineInfo, items, deliveryTime, file, description)

        bo.create_order_sheet()
        bo.send_order_email()


        return success_action()
    except Exception as e:
        return error_action(e)
    # finally:
    #     os.kill(op.brower.service.process.pid, signal.SIGTERM)


if __name__ == "__main__":
    print(11)
    # bearing_order("kkc4726","kkc@4726", {})





# from_address = "rsajc33780@yahoo.co.jp"
# user = "rsajc33780"
# password = "KKC@service@7156"
# mail = StmpMailer("smtp.mail.yahoo.co.jp", 587, user, password)