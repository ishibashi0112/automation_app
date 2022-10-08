from dataclasses import dataclass
import win32com.client


@dataclass
class Win32comExcelOparation:
    path: str

    def __post_init__(self) -> None:
        self.excel_app = win32com.client.Dispatch("Excel.Application") 
        self.excel_app.Visible = False
        self.excel_app.DisplayAlerts = False 

    # ※シート番号は左から1,2,3・・・・
    def open(self, sheet_num: int) -> None :
        self.wb = self.excel_app.Workbooks.Open(self.path)
        self.ws = self.wb.WorkSheets(sheet_num)
        self.ws.Select()
    
    def close(self) -> None :
        self.wb.Close()
    
    def set_cell_value(self, cell: str | tuple[int, int], value: str) -> None:
        if isinstance(cell, tuple):
            rows, col = cell
            self.ws.Cells(rows, col).Value = value
        else:
            self.ws.Range(cell).Value = value

    def excel_to_pdf(self, path: str) -> None :
        self.wb.ActiveSheet.ExportAsFixedFormat(0, path)