from glob import glob
import os
from datetime import datetime
from datetime import timedelta
from plyer import notification
from typing import Any, Literal
import jpholiday
import traceback
from server.type import MainProcessingResultsType 


def get_download_path() -> str:
    USERS = os.getenv("HOMEDRIVE")
    HOME = os.getenv("HOMEPATH")
    if isinstance(USERS, str) and isinstance(HOME, str):
        return USERS + HOME + "\\Downloads"
    return ""

def price_str_to_int(price_str: str) -> float | int:
    if not int(price_str[-2]) == 0:
        return float(price_str.replace(',', ''))
    return int(price_str.replace(',', '')[:-3])


def list_to_merge_str(list, delimiter: str, key: str="") -> str:
    if key:
        data_list = [data[key] for data in list] 
        data_str = delimiter.join(data_list)
        return data_str
    
    return delimiter.join(list)

def today() -> datetime:
    return datetime.today()

# stringのtodayを取得
def today_str(add_time: bool=False) -> str:
    today = datetime.today()
    today_str = today.strftime("%Y/%m/%d")
    if(add_time):
        today_str = today.strftime("%Y%m%d%H%M%S")        
    
    return today_str

def datetime_to_str(datetime_date: datetime) -> str:
    datetime_str = datetime_date.strftime("%Y/%m/%d")
    return datetime_str

def str_to_datetime(datetime_str: str) -> datetime:
    datetime_date = datetime.strptime(datetime_str, "%Y/%m/%d")
    return datetime_date


def get_various_weeks(way: Literal["move", "back"], date_num: int, base_date: datetime=today()) -> datetime:
    current_date: datetime = base_date + timedelta(weeks=date_num) if way == "move" else base_date - timedelta(weeks=date_num)

    holidays = jpholiday.between(base_date, current_date) if way == "move" else jpholiday.between(current_date, base_date)
    holidays_num= len(holidays)
    i = 0
    while i < holidays_num:
        current_date = current_date + timedelta(days=1) if way == "move" else current_date - timedelta(days=1)

        if is_day_off_and_holiday(current_date):
            continue
        else: 
            i += 1
    
    current_date = check_day_off_and_holiday(current_date)

    return current_date

def get_various_days(way: Literal["move", "back"], date_num: int, base_date: datetime=today()) -> datetime:
    current_date = base_date
    i = 0
    while i < date_num:
        current_date = current_date + timedelta(days=1) if way == "move" else current_date - timedelta(days=1)

        if is_day_off_and_holiday(current_date):
            continue
        else: 
            i += 1

    return current_date


def is_day_off_and_holiday(date: datetime) -> bool:
    weekday = date.weekday()
    is_holiday = jpholiday.is_holiday(date)
    is_day_off_or_holiday = weekday == 5 or weekday == 6 or is_holiday
    
    return is_day_off_or_holiday

def check_day_off_and_holiday(date: datetime) -> datetime: 
    is_day_off_or_holiday= is_day_off_and_holiday(date)
    current_date= date
    while is_day_off_or_holiday:
        current_date -= timedelta(days=1)
        is_day_off_or_holiday = is_day_off_and_holiday(current_date)

    return current_date

def get_various_consecutive_date_list(way: Literal["move", "back"], consecutive_num: int, base_date: datetime = today(), date_type: Literal['days', 'weeks'] = "weeks"):
    date_list = list(map(
        lambda i: get_various_weeks(way, i+1, base_date) if date_type == "weeks" else get_various_days(way, i+1, base_date), 
        range(consecutive_num)
        ))
    return date_list


def LT_to_weeks(item_lt: int) -> int:
    # LTが0の可能性があるためチェック
    if item_lt:
        weeks = item_lt // 5
        return weeks
        
    return 0

def notifications(type: Literal["success", "error"]="success") -> None:
    success_icon_path = r"C:\Users\kkc4726\Desktop\projects\komori_service_automation\web\public\success.ico"
    error_icon_path = r"C:\Users\kkc4726\Desktop\projects\komori_service_automation\web\public\error.ico"
    message = "処理が正常に完了しました" if type == "success" else "途中でエラーが発生しました"
    icon =  success_icon_path if type == "success" else error_icon_path

    notification.notify(
    title="komori service automation",
    message=message,
    app_name="komori service automation",
    app_icon=icon,
    timeout=10
)


def success_action() -> MainProcessingResultsType:
    print("end")
    notifications("success")

    return {"state": "success", "message": "","fullMessage": "", "type": ""}

def error_action(e) -> MainProcessingResultsType:
    print(e)
    print('=== エラー内容 ===')
    print('type:' + str(type(e)))
    print('args:' + str(e.args))
    print("====================")
    print(traceback.format_exc())
    notifications("error")

    return {"state": "error", "message": e.args, "fullMessage": traceback.format_exc(), "type": str(type(e))}


def get_latest_modified_file_path(dirname):
    target = os.path.join(dirname, '*')
    files = [(f, os.path.getmtime(f)) for f in glob(target)]
    latest_modified_file_path = sorted(files, key=lambda files: files[1])[-1]
    return latest_modified_file_path[0]
    

def get_list_value(base_list: list, idx: int) -> None | Any:
    try:
        return base_list[idx]
        
    except IndexError:
        return None
        
        
