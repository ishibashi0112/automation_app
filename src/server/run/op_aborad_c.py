import os
import signal
from server.classes.OpMainProcess import OpMainProcess
from server.type import MainProcessingResultsType
from server.function import error_action, success_action, today_str
from server.utils import get_id

def op_aborad_c(id: str, password: str) -> MainProcessingResultsType:
    op = OpMainProcess(id, password)
    try:
        op.menu_open("op_entry", 1)
        op.screen_switching(1)
        op.header_input("海外C")


        is_not_last_page = True
        while is_not_last_page:
            items_array = op.get_item_els()

            for i, item in enumerate(items_array):
                #次にみるitemが無い場合
                if len(item) == 0:
                    break

                #備考欄に記載がある場合
                if op.get_value(get_id("備考_op_results", i)):
                    continue

                #生産中止品の場合
                if op.get_value(get_id("生産中止ﾌﾗｸﾞ_op_results", i)):
                    op.add_comment_and_through(i, f"{today_str()} 生産中止")
                    continue
                


                if op.get_value(get_id("製番_op_results", i))[:2] == "93":
                    qty = int(op.get_value(get_id("数量_op_results", i)).replace(',', ''))
                    print(qty)
                    qty_checked = op.check_qty_and_lot(i, qty)
                    print(qty_checked)
                    op.set_qty(i, qty_checked)
                    
                op.confirmed_as_it_is(i, is_excel=False)

            is_not_last_page = op.check_next_page_exists() 

            if is_not_last_page:
                op.move_next_page()
                op.nomal_wait()
                
                
# ========================================================================================
        op.new_excel()
        return success_action()
    except Exception as e:
        op.new_excel()
        return error_action(e)
    finally:
        os.kill(op.brower.service.process.pid, signal.SIGTERM)



    
if __name__ == "__main__":
    op_aborad_c("kkc4726", "kkc@4726")