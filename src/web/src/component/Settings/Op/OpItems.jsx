import React from "react";
import { useState, useCallback, useEffect } from "react";
import "dayjs/locale/ja";
import {
  ActionIcon,
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
  RiArrowLeftSLine,
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
import { Filter } from "../Filter";
import { useItems } from "../../../hook/useItems";
import { useRemoveModal } from "../../../hook/useRemoveModal";
import { showNotification } from "@mantine/notifications";
import { db } from "../../../lib/firebase";

const columns = [
  {
    accessorKey: "itemNum",
    header: "品番",
  },
  {
    accessorKey: "itemName",
    header: "品名",
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

export const OpItems = ({ title }) => {
  const [popOpened, setPopOpened] = useState(false);
  const [isLoading, setIsLoading] = useState({ add: false, save: false });
  const [columnFilters, setColumnFilters] = useState([]);
  const [updateArray, setUpdateArray] = useState([]);
  const { data: items } = useItems();
  const { mutate } = useSWRConfig();

  const form = useForm({
    initialValues: {
      itemNum: "",
      itemName: "",
      rule: "",
    },
  });

  const table = useReactTable({
    data: items,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hadnleSubmit = useCallback(async (values) => {
    try {
      setIsLoading((prev) => ({ ...prev, add: true }));
      await addDoc(collection(db, "items"), { ...values, isApply: true });
      form.reset();
      await mutate("items");
      showNotification({
        title: "追加処理が正常に完了しました。",
        message: `品番:${values.itemNum}  ${values.itemName}を追加しました。`,
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
  }, []);

  const handleClickSave = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, save: true }));
      await Promise.all(
        updateArray.map(async (item) => {
          const { id, ...updateItem } = item;
          const itemRef = doc(db, "items", item.id);
          await updateDoc(itemRef, updateItem);
        })
      );
      await mutate("items");
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
      <Card shadow="sm">
        <div className="p-2">
          <Popover
            opened={popOpened}
            onClose={isLoading.add ? null : () => setPopOpened(false)}
            position="bottom-start"
            placement="start"
          >
            <Popover.Target>
              <Button
                variant="light"
                compact
                leftIcon={<RiAddBoxLine />}
                onClick={() => setPopOpened((o) => !o)}
              >
                品目を追加
              </Button>
            </Popover.Target>

            <Popover.Dropdown>
              <form
                className="flex flex-col gap-2"
                onSubmit={form.onSubmit(hadnleSubmit)}
              >
                <p className="m-0">追加フォーム</p>
                <TextInput
                  label="品番"
                  placeholder="品番を入力してください"
                  required
                  {...form.getInputProps("itemNum")}
                />
                <TextInput
                  label="品名"
                  placeholder="品名を入力してください"
                  required
                  {...form.getInputProps("itemName")}
                />
                <Select
                  data={["処理をスルー", "伝票を発行", "発注計画を削除"]}
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

        {items ? (
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
                          <Filter column={header.column} table={table} />
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

const TableRows = ({ row, setUpdateArray }) => {
  const { data: items } = useItems();
  const [isChecked, setIsChecked] = useState(row.original.isApply);

  const { setRemoveDoc, setOpenRemoveModal, modal } = useRemoveModal("items");

  const handleOnChange = useCallback(
    (e) => {
      setIsChecked((prev) => !prev);

      const itemId = e.currentTarget.dataset.id;
      const itemIdFilter = items.filter((item) => item.id === itemId);
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
    [isChecked, items]
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
                <Menu.Label>{cell.row.original.itemNum}</Menu.Label>
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
