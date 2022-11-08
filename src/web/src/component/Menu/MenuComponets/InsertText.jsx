import React from "react";
import { Button, FileInput } from "@mantine/core";
import { useMenuForm } from "../../../hook/useMenuForm";
import { useSharedState } from "../../../hook/useSharedState";
import { base64Encode } from "../../../utils/base64";

export const InsertText = ({ type }) => {
  const [menu] = useSharedState("menu");
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm({
    initialValues: {
      pdfFiles: "",
      excelFile: "",
    },
    transformValues: async (values) => ({
      pdfFiles: await base64Encode(values.pdfFiles),
      excelFile: await base64Encode(values.excelFile),
    }),
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <FileInput
          label={type === "支給" ? "支給" : "特急製作依頼書"}
          description={
            type === "支給"
              ? "支給品一覧のPDFを選択"
              : "特急製作依頼書のPDFを選択"
          }
          placeholder="only pdf file "
          accept=".pdf"
          required
          {...form.getInputProps("pdfFiles")}
        />
        <FileInput
          label={type === "支給" ? "支給結果" : "紙内示結果"}
          description={
            type === "支給"
              ? "支給品内示の結果EExcelを選択"
              : "紙内示の結果Excelを選択"
          }
          placeholder="only Excel file "
          accept=".xlsx"
          required
          {...form.getInputProps("excelFile")}
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
