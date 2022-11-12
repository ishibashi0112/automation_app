import { Button, Card, Collapse, Group, Menu, TextInput } from "@mantine/core";
import { DateRangePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";
import { addDoc, collection } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  RiAddBoxLine,
  RiCalendarCheckLine,
  RiCheckFill,
  RiCloseFill,
  RiDeleteBin2Line,
  RiEdit2Line,
  RiMoreLine,
} from "react-icons/ri";
import { useSWRConfig } from "swr";
import { useRemoveModal } from "../../hook/useRemoveModal";
import { useSchedules } from "../../hook/useSchedules";
import { db } from "../../lib/firebase";

export const Schedule = ({ title }) => {
  const [isLoading, setIsLoading] = useState({ add: false, save: false });
  const [opened, setOpen] = useState(false);
  const { data: schedules } = useSchedules();
  const { mutate } = useSWRConfig();

  const { setRemoveDoc, setOpenRemoveModal, modal } =
    useRemoveModal("schedules");

  const form = useForm({
    initialValues: {
      title: "",
      dateRange: [new Date(), new Date()],
      move: "",
    },
  });

  const [colorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
  });
  const dark = colorScheme === "dark";

  const hadnleSubmit = useCallback(async (values) => {
    try {
      setIsLoading((prev) => ({ ...prev, add: true }));
      const start = dayjs(values.dateRange[0]).format("YYYYMMDD");
      const end = dayjs(values.dateRange[1]).format("YYYYMMDD");
      await addDoc(collection(db, "schedules"), {
        title: values.title,
        start,
        end,
      });

      form.reset();
      await mutate("schedules");
      setOpen(false);

      showNotification({
        title: "追加処理が正常に完了しました。",
        message: `設定を追加しました。`,
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

  const handleClickRemoveMenu = useCallback((schedule) => {
    setOpenRemoveModal(true);
    setRemoveDoc(schedule);
  }, []);

  return (
    <div>
      {title}
      <Card mih={600} shadow="sm" radius="md">
        <Button
          className="my-2"
          variant="light"
          compact
          leftIcon={<RiAddBoxLine />}
          onClick={() => setOpen((o) => !o)}
        >
          範囲を追加
        </Button>
        <Collapse in={opened}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.onSubmit(hadnleSubmit)}
          >
            <TextInput
              label={"タイトル"}
              required
              {...form.getInputProps("title")}
            />
            <DateRangePicker
              label="期間"
              icon={<RiCalendarCheckLine />}
              locale="ja"
              required
              {...form.getInputProps("dateRange")}
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
        </Collapse>

        {schedules.map((schedule) => (
          <Group
            className={`p-2 rounded-sm transition hover:transition ${
              dark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }  `}
            position="apart"
            align="center"
            key={schedule.id}
          >
            <div>
              <p className="m-0">{schedule.title}</p>
              <div className="flex">
                <p className="m-0">
                  {dayjs(schedule.start).format("YY年M月D日")}
                </p>
                <p className="m-0">～</p>
                <p className="m-0">
                  {dayjs(schedule.end).format("YY年M月D日")}
                </p>
              </div>
            </div>
            <Menu position="bottom-end">
              <Menu.Target>
                <Button variant="subtle" color="dark" compact>
                  <RiMoreLine />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{schedule.title}</Menu.Label>
                <Menu.Item icon={<RiEdit2Line />}>編集</Menu.Item>
                <Menu.Item
                  color="red"
                  icon={<RiDeleteBin2Line />}
                  onClick={() => handleClickRemoveMenu(schedule)}
                >
                  削除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ))}

        {modal}
      </Card>
    </div>
  );
};
