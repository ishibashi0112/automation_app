import { Alert, Loader, LoadingOverlay, ScrollArea, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useCallback, useState } from "react";
import { RiCheckboxCircleLine, RiCloseCircleLine } from "react-icons/ri";
import { base64Encode } from "../utils/base64";
import { useItems } from "./useItems";
import { useSchedules } from "./useSchedules";
import { useSuppliers } from "./useSuppliers";
import dayjs from "dayjs";

const FilesToBase64Encode = async (values) => {
  const results = await Promise.all(
    Object.entries(values).map(async (value) => {
      if (value[1] instanceof File) {
        const encodedFile = await base64Encode(value[1]);

        return { [value[0]]: encodedFile };
      }
      return { [value[0]]: value[1] };
    })
  );
  return results;
};

const dateToString = (values) => {
  const results = Object.entries(values).reduce((prev, current) => {
    if (current[1] instanceof Date) {
      const dateString = dayjs(current[1]).format("YY年M月D日");
      return { ...prev, [current[0]]: dateString };
    }
    return { ...prev, [current[0]]: current[1] };
  }, {});

  return results;
};

export const useMenuForm = (menu) => {
  const { data: items } = useItems();
  const { data: schedules } = useSchedules();
  const { data: suppliers } = useSuppliers();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState({
    state: "",
    message: "",
    type: "",
  });

  const form = useForm(menu.form.data);

  const handleOnSubmit = useCallback(
    async (values) => {
      setIsLoading(true);

      const convertedDate = dateToString(values);
      const convertedFiles = await FilesToBase64Encode(convertedDate);

      const params = convertedFiles.reduce((prev, current) => {
        return { ...prev, ...current };
      }, {});

      const settings = { items, schedules, suppliers };

      const runResult = await menu.runFunc(menu.title, settings, params);
      setResult(runResult);
      setIsLoading(false);
    },
    [menu, items, schedules, suppliers]
  );

  return {
    form,
    handleOnSubmit,
    isLoading,
    OverLay: (
      <LoadingOverlay
        visible={isLoading}
        loader={
          <>
            <Loader variant="dots" />
            <Text>実行中…</Text>
          </>
        }
        radius="sm"
        zIndex={10000}
      />
    ),
    resultView: result.state ? (
      <>
        {/* <Overlay className="z-0" radius="sm" color="black" /> */}
        <div className="z-10 absolute top-0 left-0 w-full h-full flex items-center justify-center ">
          <Alert
            className="min-w-[300px]"
            title={result.state === "error" ? "Error" : "Success"}
            color={result.state === "error" ? "red" : "teal"}
            icon={
              result.state === "error" ? (
                <RiCloseCircleLine />
              ) : (
                <RiCheckboxCircleLine />
              )
            }
            withCloseButton
            onClose={() =>
              setResult({
                state: "",
                message: "",
                type: "",
              })
            }
          >
            {result.state === "error" ? (
              <ScrollArea className="h-36">
                <p>{`type:${result.type}`}</p>
                <p>{`message:${result.message}`}</p>
                <p>{`full_message:${result.fullMessage}`}</p>
              </ScrollArea>
            ) : (
              <p className="font-bold">処理が正常に完了しました。</p>
            )}
          </Alert>
        </div>
      </>
    ) : null,
  };
};
