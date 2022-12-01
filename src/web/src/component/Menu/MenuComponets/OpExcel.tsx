import React from "react";
import { LoginInput } from "./LoginInput";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";
import { useMenuForm } from "hook/useMenuForm";
import { Button } from "@mantine/core";
import { base64Encode } from "utils/base64";
import { OpExcelValues } from "types/type";

type OpExcelTranformValues = (
  values: OpExcelValues
) => Promise<{ id: string; password: string; excel: string }>;

export const OpExcel = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm<
    OpExcelValues,
    OpExcelTranformValues
  >({
    initialValues: {
      id: "",
      password: "",
      excel: "",
    },
    transformValues: async (values) => ({
      ...values,
      excel:
        values.excel instanceof File
          ? await base64Encode(values.excel)
          : values.excel,
    }),
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />
        <FullScreenDropZoneInput<OpExcelValues, typeof form>
          form={form}
          formName="excel"
          label="Excel File"
          description="使用するExcelファイルを選択"
          placeholder="excel file"
          isExcelOnly
          required
        />
        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>
      </div>

      {OverLay}

      {resultView}
    </form>
  );
};
