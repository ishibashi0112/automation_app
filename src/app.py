# cd C:\Users\kkc4726\Desktop\projects\komori_service_automation
# python -m eel src/app.py src/web/build --onefile --noconsole --hidden-import plyer.platforms.win.notification --name automation_app
# python -m eel app.py web/build --onefile --noconsole --hidden-import plyer.platforms.win.notification --name automation_app
from dotenv import load_dotenv

load_dotenv()

import os
import re
from typing import Any, Optional, TypedDict
import eel
import datetime
import jpholiday
import pyocr
from pdf2image import convert_from_bytes
import io
import base64
from server.function import get_list_value
from server.run.create_mail_for_paper_order import create_mail_for_paper_order
from server.run.insert_payments_order_info import insert_payments_order_info
from server.run.item_judge import item_judge
from server.run.payments_order import payments_order
from server.run.insert_order_info import insert_order_info
from server.run.op_domestic import op_domestic
from server.run.op_aborad import op_aborad
from server.run.op_aborad_c import op_aborad_c
from server.run.os_order import os_order
from server.run.op_paper_order import op_paper_order
from server.run.repair_order import repair_order
from server.run.op_excel import op_excel
from server.run.bearing_order import bearing_order

from server.type import MainProcessingResultsType, RunArgsTypes
import datetime

def main() -> None:
    port = 9999 
    eel.init("./web/build")  
    eel.start("index.html", port=port)  

# @eel.expose()を指定してJavaScriptから呼べるように関数を登録
@eel.expose
def run_automation(menu_name, settings, params) -> Any:    
    
    class AddHoliday(jpholiday.OriginalHoliday):
        def _is_holiday(self, date):
            all_ownly_holidays = []
            for schedule in settings["schedules"]:
                start = schedule["start"]
                start_date = datetime.datetime.strptime(start, "%Y%m%d")
                end = schedule["end"]
                end_date = datetime.datetime.strptime(end, "%Y%m%d")
                range_days = (end_date-start_date).days + 1

                holidays_list = []
                for i in range(range_days):
                    holiday = start_date + datetime.timedelta(days=i)
                    weekday = holiday.weekday()
                    is_day_off = weekday == 5 or weekday == 6
                    if not is_day_off:
                        holidays_list.append(holiday)
                    
                all_ownly_holidays += holidays_list

            for ownly_holiday in all_ownly_holidays:
                date_str = date.strftime("%Y/%m/%d")
                ownly_holiday_str = ownly_holiday.strftime("%Y/%m/%d")

                if date_str == ownly_holiday_str:
                    return True

            return False

        def _is_holiday_name(self, date):
            return '独自カレンダー' 


    if menu_name == "発注計画(国内) 展開":
        return op_domestic(settings["items"], **params )

    if menu_name == "発注計画(海外A) 展開":
        return op_aborad(settings["items"], **params)

    if menu_name == "発注計画(海外C) 展開":
        return op_aborad_c(**params)

    if menu_name == "特急製作依頼書 作成":
        return op_paper_order(**params)

    if menu_name == "ｵｰﾀﾞｰｼｰﾄ 作成":
        return os_order(**params)

    if menu_name == "預かり修理 展開":
        return repair_order(**params)
        
    if menu_name == "支給品 手配":
        return payments_order(**params)
    
    if menu_name == "発注計画 展開(Excel)":
        return op_excel(**params)
    
    if menu_name == "胴ﾍﾞｱﾘﾝｸﾞ 手配":
        return bearing_order(**params)

    if menu_name == "特急製作依頼書 ﾃｷｽﾄ挿入":
        return insert_order_info(**params)
    
    if menu_name == "支給品一覧 ﾃｷｽﾄ挿入":
        return insert_payments_order_info(**params)

    if menu_name == "特急製作依頼書 ﾒｰﾙ作成":
        return create_mail_for_paper_order(**params)
    
    if menu_name == "品番判断ｴﾝﾄﾘｰ 自動確定":
        return item_judge(**params)
    
    return None



class OcrRepairOrderInfo(TypedDict):
    orderNum: Optional[str]
    linesNum: Optional[str]
    itemNum : Optional[str]

class OcrResult(TypedDict):
    info: list[OcrRepairOrderInfo]
    images: list[str]


def pillow_to_base64(img, format="jpeg") -> str:
    buffer = io.BytesIO()
    img.save(buffer, format)
    img_str = base64.b64encode(buffer.getvalue()).decode("ascii")

    return img_str


@eel.expose
def ocr_for_repair_order_pdf(pdf_files: list[str]) -> OcrResult:
    decoded_pdf_files: list[bytes] =[ base64.b64decode(file) for file in pdf_files]

    #pyocrにTesseractを指定する。
    pyocr.tesseract.TESSERACT_CMD = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    poppler_path = r"C:\Program Files\poppler-22.04.0\Library\bin"
    output_path =  os.environ["REPAIR_ORDER_PDF_OUTPUT_PATH"]
    tools = pyocr.get_available_tools()
    tool = tools[0]
    builder = pyocr.builders.TextBuilder(tesseract_layout=3)
    lang = "jpn"

    repair_order_info_list = []
    img_list = []
    for file in decoded_pdf_files:
        img_pages_list = convert_from_bytes(file, poppler_path=poppler_path, output_folder=output_path, fmt='jpeg', )
        text_list = [tool.image_to_string(img, lang=lang, builder=builder) for img in img_pages_list ]

        for img in img_pages_list:
            
            encoded_img = pillow_to_base64(img)
            img_list.append(encoded_img)
            
        for text in text_list:
          
            split_text_list = text.split()

            order_num_pattern = r"(0000)([4-9]{1})([0-9]{5})"
            order_num_list: list[str] = list(filter(lambda txt: re.fullmatch(order_num_pattern, txt), split_text_list))
            order_num: str = get_list_value(order_num_list, 0)
            
            if order_num:
                order_num_idx: int = split_text_list.index(order_num)
    

                lines_num_pattern = r"[0-9]{,3}"
                text_list_for_lines_num = split_text_list[order_num_idx + 1 : ]
                lines_num_list = list(filter( lambda txt: re.fullmatch(lines_num_pattern, txt) , text_list_for_lines_num)) 
                lines_num = get_list_value(lines_num_list, 0)

            item_num_pattern = r"([A-Z0-9]{10})"
            item_num_list = list(filter(lambda txt: re.fullmatch(item_num_pattern, txt), split_text_list))
            removed_order_num = list(filter(lambda txt: not(txt.startswith("0000")), item_num_list))
            item_num = get_list_value(removed_order_num, 0)

            print(f"================================================================================================")
            print()
            print("本文:")
            print(text)
            print()
            print("split:")
            print(f"{split_text_list}")
            print()
            print("lines_num_split:")
            print(f"{text_list_for_lines_num}")
            print()
            print(f"受注NO: {order_num}")
            print(f"行NO: {lines_num}")
            print(f"品番: {item_num}")
            print(f"================================================================================================")

            repair_order_info: OcrRepairOrderInfo = {
                "orderNum": order_num,
                "linesNum": lines_num,
                "itemNum" : item_num 
            }

            repair_order_info_list.append(repair_order_info)
    print(repair_order_info_list)

    return {
       "info": repair_order_info_list,
       "images": img_list
    }
        


if __name__ == "__main__":
    main()