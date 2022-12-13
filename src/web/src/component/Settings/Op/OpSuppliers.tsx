import React from "react";
import { useState, useCallback, useEffect } from "react";
import "dayjs/locale/ja";
import {
  Button,
  Card,
  Menu,
  Overlay,
  Popover,
  Select,
  Switch,
  Table,
  TextInput,
} from "@mantine/core";
import {
  RiAddBoxLine,
  RiCheckFill,
  RiCloseFill,
  RiDeleteBin2Line,
  RiEdit2Line,
  RiMoreLine,
} from "react-icons/ri";
import { MdSaveAlt } from "react-icons/md";
import { useSWRConfig } from "swr";
import { useForm } from "@mantine/form";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { Filter } from "component/Settings/Filter";
import { useRemoveModal } from "hook/useRemoveModal";
import { useSuppliers } from "hook/useSuppliers";
import { db } from "lib/firebase";
import { showNotification } from "@mantine/notifications";
import { FC } from "react";
import { SettingOpSuplliers } from "types/type";

const columns = [
  {
    accessorKey: "code",
    header: "ｺｰﾄﾞ",
  },
  {
    accessorKey: "name",
    header: "取引先名",
  },
  {
    accessorKey: "rule",
    header: "ルール",
  },
  {
    accessorKey: "isApply",
    header: "反映",
  },
  {
    accessorKey: "menu",
    header: "",
  },
];

type SettingOpSupplierValues = {
  code: string;
  name: string;
  rule: string;
};

export const OpSuppliers: FC<{ title: string }> = ({ title }) => {
  const [popOpened, setPopOpened] = useState(false);
  const [isLoading, setIsLoading] = useState({ add: false, save: false });
  const [columnFilters, setColumnFilters] = useState<SettingOpSuplliers[]>([]);
  const [updateArray, setUpdateArray] = useState<SettingOpSuplliers[]>([]);
  const { data: suppliers } = useSuppliers();
  const { mutate } = useSWRConfig();

  const form = useForm<SettingOpSupplierValues>({
    initialValues: {
      code: "",
      name: "",
      rule: "",
    },
  });

  const table = useReactTable({
    data: suppliers,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hadnleSubmit = useCallback(
    async (values: SettingOpSupplierValues): Promise<void> => {
      try {
        setIsLoading((prev) => ({ ...prev, add: true }));
        await addDoc(collection(db, "suppliers"), { ...values, isApply: true });
        form.reset();
        await mutate("suppliers");
        showNotification({
          title: "追加処理が正常に完了しました。",
          message: `品番:${values.code}  ${values.name}を追加しました。`,
          color: "teal",
          icon: <RiCheckFill />,
        });
      } catch (error) {
        showNotification({
          title: "追加に失敗しました。",
          message: "処理が失敗しました",
          color: "red",
          icon: <RiCloseFill />,
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, add: false }));
      }
    },
    []
  );

  const handleClickSave: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, save: true }));
      await Promise.all(
        updateArray.map(async (supplier: SettingOpSuplliers) => {
          const { id, ...updateSupplier } = supplier;
          const supplierRef = doc(db, "suppliers", supplier.id);
          await updateDoc(supplierRef, updateSupplier);
        })
      );
      await mutate("suppliers");
      setUpdateArray([]);
      showNotification({
        title: "更新処理が正常に完了しました。",
        message: "更新内容が反映されました。",
        color: "teal",
        icon: <RiCheckFill />,
      });
    } catch (error) {
      showNotification({
        title: "更新に失敗しました。",
        message: "処理が失敗しました",
        color: "red",
        icon: <RiCloseFill />,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, save: false }));
    }
  };

  useEffect(() => {
    return () => {
      if (updateArray.length) {
        setUpdateArray([]);
      }
    };
  }, []);

  return (
    <div>
      {title}
      <Card className="min-h-[550px]" shadow="sm">
        <div className="p-2">
          <Popover
            opened={popOpened}
            onClose={isLoading.add ? undefined : () => setPopOpened(false)}
            position="bottom-start"
          >
            <Popover.Target>
              <Button
                variant="light"
                compact
                leftIcon={<RiAddBoxLine />}
                onClick={() => setPopOpened((o) => !o)}
              >
                取引先を追加
              </Button>
            </Popover.Target>

            <Popover.Dropdown>
              <form
                className="flex flex-col gap-2"
                onSubmit={form.onSubmit(hadnleSubmit)}
              >
                <p className="m-0">追加フォーム</p>
                <TextInput
                  label="コード"
                  placeholder="取引先ｺｰﾄﾞを入力してください"
                  required
                  {...form.getInputProps("code")}
                />
                <TextInput
                  label="取引先名"
                  placeholder="取引先名を入力してください"
                  required
                  {...form.getInputProps("name")}
                />
                <Select
                  data={["処理をスルー", "伝票を発行"]}
                  placeholder="Pick one"
                  label="ルール"
                  required
                  {...form.getInputProps("rule")}
                />
                <Button
                  className="mt-3"
                  type="submit"
                  leftIcon={<RiAddBoxLine />}
                  loading={isLoading.add}
                >
                  追加
                </Button>
              </form>
            </Popover.Dropdown>
          </Popover>

          <Button
            className="mx-2"
            variant="subtle"
            leftIcon={<MdSaveAlt />}
            compact
            disabled={updateArray.length < 1}
            loading={isLoading.save}
            onClick={handleClickSave}
          >
            保存
          </Button>
        </div>

        {suppliers ? (
          <Table highlightOnHover>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      <div className="inline">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                      <div className="inline">
                        {header.column.getCanFilter() ? (
                          <Filter column={header.column} />
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <TableRows
                  key={row.id}
                  row={row}
                  setUpdateArray={setUpdateArray}
                />
              ))}
            </tbody>
          </Table>
        ) : null}
      </Card>
      {isLoading.save && <Overlay opacity={0} color="black" zIndex={20} />}
    </div>
  );
};

const TableRows: FC<{
  row: any;
  setUpdateArray: React.Dispatch<React.SetStateAction<SettingOpSuplliers[]>>;
}> = ({ row, setUpdateArray }) => {
  const { data: suppliers } = useSuppliers();
  const [isChecked, setIsChecked] = useState<boolean>(row.original.isApply);

  const { setRemoveDoc, setOpenRemoveModal, modal } =
    useRemoveModal("suppliers");

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        setIsChecked((prev) => !prev);

        const itemId = e.currentTarget.dataset.id;
        const itemIdFilter = suppliers.filter((item) => item.id === itemId);
        const updateItem = { ...itemIdFilter[0], isApply: !isChecked };
        setUpdateArray((prevArray) => {
          if (!prevArray.length) {
            return [updateItem];
          }

          const RemoveDuplicatesArray = prevArray.reduce((prev, current) => {
            if (current.id === itemId) {
              return [...prev];
            }
            return [...prev, current];
          }, []);

          return [...RemoveDuplicatesArray, updateItem];
        });
      },
      [isChecked, suppliers]
    );

  const handleClickRemoveMenu = useCallback((item) => {
    setOpenRemoveModal(true);
    setRemoveDoc(item);
  }, []);

  return (
    <tr key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <td
          className={
            cell.column.columnDef.header === "反映"
              ? "min-w-[80px]"
              : !cell.column.columnDef.header
              ? "max-w-[40px]"
              : null
          }
          key={cell.id}
        >
          {cell.column.columnDef.header === "反映" ? (
            <div>
              <Switch
                className="flex items-center"
                data-id={cell.row.original.id}
                checked={isChecked}
                onChange={handleOnChange}
              />
            </div>
          ) : !cell.column.columnDef.header ? (
            <Menu position="bottom-end">
              <Menu.Target>
                <Button variant="subtle" color="dark" compact>
                  <RiMoreLine />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{cell.row.original.code}</Menu.Label>
                <Menu.Item icon={<RiEdit2Line />}>編集</Menu.Item>
                <Menu.Item
                  color="red"
                  icon={<RiDeleteBin2Line />}
                  onClick={() => handleClickRemoveMenu(cell.row.original)}
                >
                  削除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
      {modal}
    </tr>
  );
};
