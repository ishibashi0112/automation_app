import React, { FC, useState } from "react";
import {
  Button,
  TextInput,
  Table,
  ActionIcon,
  SegmentedControl,
  Image,
  CloseButton,
  Divider,
} from "@mantine/core";
import { RiDeleteBin2Line } from "react-icons/ri";
import { LoginInput } from "./LoginInput";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";
import { useCallback } from "react";
import { base64Encode } from "../../../utils/base64";
import { Rnd } from "react-rnd";
import { Carousel } from "@mantine/carousel";
import { useMenuForm } from "../../../hook/useMenuForm";
import { RepairOrderValues } from "types/type";
import { OCRResult } from "types/type";

export const RepairOrder: FC = () => {
  const [value, setValue] = useState("folder");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isSubWindowOpen, setIsSubWindowOpen] = useState(false);

  const { form, handleOnSubmit, OverLay, resultView } =
    useMenuForm<RepairOrderValues>({
      initialValues: {
        id: "",
        password: "",
        orders: [{ orderNum: "", linesNum: "", itemNum: "" }],
      },
    });

  const handleClickOCR: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(
      async (e) => {
        setIsOcrLoading(true);

        let repairOrderData: OCRResult;
        if (e.currentTarget.innerText === "新規ﾌｫﾙﾀﾞからﾃｷｽﾄ抽出") {
          repairOrderData = await window.eel.ocr_for_repair_order_pdf()();
        } else {
          const encoded_Files = await Promise.all(
            files.map(async (file) => base64Encode(file))
          );

          repairOrderData = await window.eel.ocr_for_repair_order_pdf(
            encoded_Files
          )();
        }
        repairOrderData.info.map((data, i) => {
          if (!i) {
            form.setFieldValue("orders.0.orderNum", data.orderNum);
            form.setFieldValue("orders.0.linesNum", data.linesNum);
            form.setFieldValue("orders.0.itemNum", data.itemNum);
          } else {
            form.insertListItem("orders", {
              orderNum: data.orderNum,
              linesNum: data.linesNum,
              itemNum: data.itemNum,
            });
          }
        });

        setPreviews(repairOrderData.images);
        setFiles([]);
        setIsOcrLoading(false);
      },
      [form, files]
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

        <LoginInput form={form} />

        <Divider my="lg" size="sm" labelPosition="center" label="手配情報" />

        <div className="flex flex-col gap-3">
          <SegmentedControl
            className="w-80"
            value={value}
            size="xs"
            onChange={setValue}
            data={[
              { label: "ﾌｫﾙﾀﾞ", value: "folder" },
              { label: "ﾌｧｲﾙ", value: "files" },
            ]}
          />
          {value === "folder" ? (
            <div>
              <Button
                className="mr-3"
                size="xs"
                variant="light"
                onClick={handleClickOCR}
                loading={isOcrLoading}
              >
                新規ﾌｫﾙﾀﾞからﾃｷｽﾄ抽出
              </Button>
              <Button
                size="xs"
                variant="light"
                disabled={previews.length > 0 ? false : true}
                onClick={() => setIsSubWindowOpen((o) => !o)}
              >
                ﾌﾟﾚﾋﾞｭｰ表示
              </Button>
            </div>
          ) : (
            <>
              <FullScreenDropZoneInput<RepairOrderValues, typeof form>
                label="PDF Filse"
                multiple
                setFiles={setFiles}
              />

              <div className="ml-auto mt-2">
                <Button
                  className="w-24 mr-2"
                  size="xs"
                  variant="light"
                  onClick={handleClickOCR}
                  loading={isOcrLoading}
                  disabled={files.length ? false : true}
                >
                  ﾃｷｽﾄ抽出
                </Button>
                <Button
                  className="w-24"
                  size="xs"
                  variant="light"
                  disabled={previews.length > 0 ? false : true}
                  onClick={() => setIsSubWindowOpen((o) => !o)}
                >
                  ﾌﾟﾚﾋﾞｭｰ表示
                </Button>
              </div>
            </>
          )}
          <Table>
            <thead className="text-sm">
              <tr>
                <td>受注NO</td>
                <td>行NO</td>
                <td>品番</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {form.values.orders.map((_, i) => (
                <tr key={i}>
                  <td>
                    <TextInput
                      {...form.getInputProps(`orders.${i}.orderNum`)}
                      required
                    />
                  </td>
                  <td>
                    <TextInput
                      className="max-w-[70px]"
                      required
                      {...form.getInputProps(`orders.${i}.linesNum`)}
                    />
                  </td>
                  <td>
                    <TextInput
                      required
                      {...form.getInputProps(`orders.${i}.itemNum`)}
                    />
                  </td>
                  <td>
                    {form.values.orders.length > 1 ? (
                      <ActionIcon
                        color="red"
                        onClick={() => form.removeListItem("orders", i)}
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
                      form.insertListItem("orders", {
                        orderNum: "",
                        linesNum: "",
                        itemNum: "",
                      });
                    }}
                  >
                    入力欄を追加
                  </Button>
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>

        {isSubWindowOpen ? (
          <Rnd
            className="bg-gray-200 z-[1000] shadow-xl rounded-sm relative"
            default={{
              x: 0,
              y: 0,
              width: 550,
              height: 320,
            }}
            disableDragging={true}
          >
            <div className="p-2">
              <CloseButton
                className="absolute top-1 left-1 z-[9999]"
                onClick={() => setIsSubWindowOpen((o) => !o)}
              />
              <ImagePreviews previews={previews} />
            </div>
          </Rnd>
        ) : null}

        {OverLay}

        {resultView}
      </div>
    </form>
  );
};

const ImagePreviews: FC<{ previews: string[] }> = ({ previews }) => {
  return (
    <>
      <Carousel
        classNames={{ indicator: "bg-gray-300" }}
        // slideSize="70%"
        height={300}
        orientation="vertical"
        slideGap="xs"
        withIndicators
      >
        {previews.map((preview, i) => (
          <Carousel.Slide key={i}>
            <Image
              className="select-none"
              height={300}
              src={`data:image/jpeg;base64,${preview}`}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </>
  );
};
