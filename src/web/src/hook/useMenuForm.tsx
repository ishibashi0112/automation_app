import { Alert, Loader, LoadingOverlay, ScrollArea, Text } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import React, { useCallback, useState } from "react";
import { RiCheckboxCircleLine, RiCloseCircleLine } from "react-icons/ri";
import { useItems } from "hook/useItems";
import { useSchedules } from "hook/useSchedules";
import { useMenuState } from "hook/useMenuState";
import { useSuppliers } from "./useSuppliers";
import { ReactNode } from "react";
import { FormValues } from "types/type";
import { UseFormInput, _TransformValues } from "@mantine/form/lib/types";
import { ResultState } from "utils/menuData";

type useMenuFormReturnType<
  Values,
  TransformValues extends _TransformValues<Values> = (values: Values) => Values
> = {
  form: UseFormReturnType<Values, TransformValues>;
  handleOnSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
  OverLay: ReactNode;
  resultView: ReactNode | null;
};

export const useMenuForm = <
  Values extends FormValues,
  TransformValues extends _TransformValues<Values> = (values: Values) => Values
>(
  formData: UseFormInput<Values, TransformValues>
): useMenuFormReturnType<Values, TransformValues> => {
  const { data: items } = useItems();
  const { data: schedules } = useSchedules();
  const { data: suppliers } = useSuppliers();
  const [menu] = useMenuState();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState>({
    state: "",
    message: "",
    fullMessage: "",
    type: "",
  });
  const form = useForm<Values, TransformValues>(formData);

  const handleOnSubmit = useCallback(
    async (values: typeof form.values) => {
      setIsLoading(true);
      const loadedValues = await values;
      const settings = {
        op: {
          items: items ? items : [],
          suppliers: suppliers ? suppliers : [],
        },
        schedules: schedules ? schedules : [],
      };

      if (!menu) {
        return;
      }

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
            <Text>????????????</Text>
          </>
        }
        radius="sm"
        zIndex={10000}
      />
    ),
    resultView: result.state ? (
      <>
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
                fullMessage: "",
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
              <p className="font-bold">???????????????????????????????????????</p>
            )}
          </Alert>
        </div>
      </>
    ) : null,
  };
};
