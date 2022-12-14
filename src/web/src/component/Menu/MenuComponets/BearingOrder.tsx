import React, { forwardRef } from "react";
import {
  Button,
  Select,
  TextInput,
  MultiSelect,
  Table,
  ActionIcon,
  Divider,
  Textarea,
  Autocomplete,
  Text,
} from "@mantine/core";
import { useCallback } from "react";
import { useState } from "react";
import { RiDeleteBin2Line, RiCalendarCheckLine } from "react-icons/ri";
import { DatePicker } from "@mantine/dates";
import { LoginInput } from "./LoginInput";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";
import { useMenuForm } from "../../../hook/useMenuForm";
import dayjs from "dayjs";
import { BearingOrderValues } from "types/type";
import { SelectItemProps } from "@mantine/core";
import { MantineColor } from "@mantine/core";

const getUnitInfoArray = (machineName: string): string[] => {
  const machineTypeNum = machineName.replace(/[^0-9]/g, "");
  const ReverseTypeExists =
    machineName.includes("SP") || machineName.includes("RP");
  const typeNumLength = machineTypeNum.length;
  const colors =
    typeNumLength === 3
      ? Number(machineTypeNum.slice(0, 1))
      : typeNumLength === 4
      ? Number(machineTypeNum.slice(0, 2))
      : 0;

  if (!colors) {
    return ["L", "R"];
  }

  const count = [...Array(colors)].map((v, k) => k);

  const UnitInfo = count.reduce(
    (prev, current, i) => {
      const LR: string[] = ReverseTypeExists
        ? [`上${i + 1}L`, `上${i + 1}R`, `下${i + 1}L`, `下${i + 1}R`]
        : [`${i + 1}L`, `${i + 1}R`];
      console.log(LR);
      return [...prev, ...LR];
    },
    ["L", "R"]
  );

  return UnitInfo;
};

const bearingItemsInfo = [
  { value: "464312202Z", description: "L40/44 : ｺﾞﾑ胴" },
  { value: "4443005004", description: "L40/44 : 版胴 ｺｰﾀｰｺﾞﾑ胴" },
  { value: "7643100903", description: "LS40 : ｺﾞﾑ胴" },
  { value: "7643031202", description: "LS40 : 版胴" },
  { value: "4443212004", description: "L40/44 GL40 GLX: 圧胴,渡胴" },
  { value: "EFS3110101", description: "GL40/44 GLX40/44 : ｺｰﾀｰｺﾞﾑ胴" },
  { value: "7423200700", description: "LS40P GLX40 : 圧胴,渡胴" },
] as const;

const bearingItemNames = [
  "ｺﾞﾑ胴",
  "版胴",
  "圧胴",
  "渡胴",
  "ｺｰﾀｰｺﾞﾑ",
  "A渡胴",
  "DU胴",
  "NO胴",
] as const;

interface ItemProps extends SelectItemProps {
  color: MantineColor;
  description: string;
}

const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ description, value, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Text>{value}</Text>
      <Text size="xs" color="dimmed">
        {description}
      </Text>
    </div>
  )
);

export const BearingOrder = () => {
  const [unitNumbers, setUnitNumbers] = useState<string[]>([]);
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm<
    BearingOrderValues,
    (
      values: BearingOrderValues
    ) => Omit<BearingOrderValues, "deliveryTime"> & { deliveryTime: string }
  >({
    initialValues: {
      id: "",
      password: "",
      orderNum: "",
      linesNum: "",
      customerName: "",
      machineInfo: { name: "", number: "" },
      items: [{ itemNum: "", type: "", locatios: [] }],
      deliveryTime: "",
      file: "",
      description: "",
    },

    transformValues: (values) => ({
      ...values,
      deliveryTime: dayjs(values.deliveryTime).format("YY年M月D日"),
    }),
  });

  const handleOnBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const machineName = e.currentTarget.value;
      const unitInfoArray = getUnitInfoArray(machineName);
      setUnitNumbers(unitInfoArray);
    },
    []
  );

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <Divider
          className="mt-0"
          my="lg"
          size="sm"
          labelPosition="center"
          label="ログイン情報"
        />
        <div className="flex gap-3">
          <LoginInput form={form} />
        </div>
        <Divider my="lg" size="sm" labelPosition="center" label="手配情報" />
        <div className="flex flex-col gap-2">
          <TextInput
            label="ﾕｰｻﾞｰ名"
            description="対象のﾕｰｻﾞｰ名を入力"
            required
            {...form.getInputProps("customerName")}
          />
          <div className="flex gap-3">
            <TextInput
              className="flex-1"
              label="受注No"
              description="対象の受注NOを入力"
              required
              {...form.getInputProps("orderNum")}
            />
            <TextInput
              className="flex-1"
              label="行NO"
              description="対象の行NOを入力"
              required
              {...form.getInputProps("linesNum")}
            />
          </div>
          <div className="flex gap-3">
            <TextInput
              className="flex-1"
              label="機種"
              required
              {...form.getInputProps("machineInfo.name")}
              onBlur={handleOnBlur}
            />
            <TextInput
              className="flex-1"
              label="号機"
              required
              {...form.getInputProps("machineInfo.number")}
            />
          </div>
          <Table>
            <thead className="text-sm">
              <tr>
                <td>品番</td>
                <td>種類</td>
                <td>使用箇所</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {form.values.items.map((_, i) => (
                <tr key={i}>
                  <td>
                    <Autocomplete
                      data={bearingItemsInfo}
                      itemComponent={AutoCompleteItem}
                      limit={10}
                      maxDropdownHeight={300}
                      {...form.getInputProps(`items.${i}.itemNum`)}
                    />
                  </td>
                  <td className="max-w-[100px]">
                    <Select
                      placeholder="Pick one"
                      data={bearingItemNames}
                      {...form.getInputProps(`items.${i}.type`)}
                    />
                  </td>
                  <td>
                    <MultiSelect
                      data={unitNumbers}
                      {...form.getInputProps(`items.${i}.locatios`)}
                    />
                  </td>
                  <td>
                    {form.values.items.length > 1 ? (
                      <ActionIcon
                        color="red"
                        onClick={() => form.removeListItem("items", i)}
                      >
                        <RiDeleteBin2Line />
                      </ActionIcon>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} align="right">
                  <Button
                    variant="subtle"
                    compact
                    onClick={() => {
                      form.insertListItem("items", {
                        itemNum: "",
                        type: "",
                        locatios: [],
                      });
                    }}
                  >
                    入力欄を追加
                  </Button>
                </td>
              </tr>
            </tfoot>
          </Table>

          <DatePicker
            placeholder="納期"
            label="納期"
            icon={<RiCalendarCheckLine />}
            inputFormat="YYYY/MM/DD"
            labelFormat="YYYY/MM"
            firstDayOfWeek="sunday"
            locale="ja"
            required
            {...form.getInputProps("deliveryTime")}
          />
          <FullScreenDropZoneInput<BearingOrderValues, typeof form>
            form={form}
            formName="file"
            label="嵌合検査表"
            description="使用するファイルを選択"
            placeholder="file"
          />

          <Textarea
            placeholder="備考"
            label="備考"
            description="特記事項を入力（メタル製作がある場合はその旨を入力）"
            autosize
            {...form.getInputProps("description")}
          />
        </div>
        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>
      </div>

      {OverLay}

      {resultView}
    </form>
  );
};
