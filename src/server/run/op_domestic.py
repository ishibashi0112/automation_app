import os
import signal
from server.classes.OpMainProcess import OpMainProcess
from server.type import MainProcessingResultsType
from server.function import error_action, success_action, today_str
from server.type import RuleOp
from server.utils import get_id


def op_domestic(settings_op: RuleOp, id: str, password: str, startPage: int, nameInitial: str) -> MainProcessingResultsType:

    op = OpMainProcess(id, password, startPage, nameInitial, settings_op, "国内")
    try:
        op.menu_open("op_entry", 1)
        op.menu_open("obi_entry", 2)
        op.menu_open("ha_entry", 3)
        op.menu_open("rd_entry", 4)
        op.screen_switching(1)
        op.header_input("国内")
        op.move_start_page(startPage)

        while True:
            items_list = op.get_item_els()

            for i, item in enumerate(items_list):
                #次にみるitemが無い場合
                if item == []:
                    break

                #備考欄に記載がある場合
                if op.get_value(get_id("備考_op_results", i)):
                    continue

                # 設定より特有のルールがある場合
                unique_rule = op.get_unique_item_rule(i)
                if unique_rule:
                    if unique_rule["rule"] == '処理をスルー':
                        continue

                    elif unique_rule["rule"] == '伝票を発行':
                        op.confirmed_as_it_is(i, "設定ルールより、伝票発行")
                        continue

                    elif unique_rule["rule"] == '発注計画を削除':
                        op.delete_and_add_excel_data(i, "設定ルールより、削除")   
                        continue

                #生産中止品の場合
                if op.get_value(get_id("生産中止ﾌﾗｸﾞ_op_results", i)):
                    op.add_comment_and_through(i, f"{today_str()} 生産中止")
                    continue
                

                
                #web注文の場合
                if op.get_value(get_id("受注者ｺｰﾄﾞ_op_results", i)) == "WEBB":
                    op.web_order_process(i)
                    continue

                #補充手配分の場合
                if not op.get_value(get_id("受注NO_op_results", i)):               
                    if op.get_value(get_id( "製番_op_results", i))[:2] == "93":
                        qty = int(op.get_value(get_id("数量_op_results", i)).replace(',', ''))
                        op.check_qty_and_lot(i, qty)

                    op.confirmed_as_it_is(i, "補充")
                    continue

                # KM各週手配分の場合
                if op.get_value(get_id("製番_op_results", i)) == "3BFRUKM":
                    op.confirmed_as_it_is(i, "KM")
                    continue

                #預かり修理品の場合
                last_three_character = op.get_value(get_id("品番_op_results", i))[7:]
                if "K" in last_three_character:
                    op.set_value(get_id("備考_op_results", i), "預かり修理")
                    continue

                #引当品の場合
                if not op.get_value(get_id("製番_op_results", i))[:2] == "93":
                    op.process(i, "引当")

                    continue

                # 最終的に残るもの。
                op.process(i)

            if op.check_next_page_exists():
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
    # op_domestic("kkc4726", "kkc@4726", 4, "IY", [])