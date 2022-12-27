import os
import signal
from server.classes.OpMainProcess import OpMainProcess
from server.type import MainProcessingResultsType
from server.function import error_action, success_action, today_str
from server.utils import get_id
from server.type import RuleOp

def op_aborad_c(settings_op: RuleOp, id: str, password: str, isChangeDeliveryTime: bool) -> MainProcessingResultsType:
    op = OpMainProcess(id, password, settings_op=settings_op, op_type="海外")
    try:
        op.menu_open("op_entry", 1)
        op.screen_switching(1)
        op.header_input("海外C")

        while True:
            items_list = op.get_item_els()

            for i, item in enumerate(items_list):
                #次にみるitemが無い場合
                if item == []:
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
                    qty_checked = op.check_qty_and_lot(i, qty)
                    op.set_qty(i, qty_checked)
                

                if isChangeDeliveryTime:
                    op.aborat_c_procces_with_change_delivery_time(i)
                else:
                    op.confirmed_as_it_is(i, is_excel=False)
                

            if  op.check_next_page_exists():
                op.move_next_page()
                op.nomal_wait()
            else:
                break
                
                
# ========================================================================================
        op.new_excel()
        return success_action()
    except Exception as e:
        op.new_excel()
        return error_action(e)
    finally:
        os.kill(op.brower.service.process.pid, signal.SIGTERM)



    
if __name__ == "__main__":
    print("")
    # op_aborad_c("kkc4726", "kkc@4726", "")