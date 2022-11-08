import { Alert, Loader, LoadingOverlay, ScrollArea, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useCallback, useState } from "react";
import { RiCheckboxCircleLine, RiCloseCircleLine } from "react-icons/ri";
import { useItems } from "./useItems";
import { useSchedules } from "./useSchedules";
import { useSharedState } from "./useSharedState";
import { useSuppliers } from "./useSuppliers";

export const useMenuForm = (formData) => {
  const { data: items } = useItems();
  const { data: schedules } = useSchedules();
  const { data: suppliers } = useSuppliers();
  const [menu] = useSharedState("menu");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState({
    state: "",
    message: "",
    type: "",
  });

  const form = useForm(formData);

  const handleOnSubmit = useCallback(
    async (values) => {
      setIsLoading(true);
      const loadedValues = await values;
      const settings = { items, schedules, suppliers };

      const runResult = await menu.runFunc(menu.title, settings, loadedValues);
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
