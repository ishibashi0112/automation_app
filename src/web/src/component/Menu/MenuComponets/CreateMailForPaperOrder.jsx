import React from "react";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";
import { useMenuForm } from "../../../hook/useMenuForm";
import { Button } from "@mantine/core";

export const CreateMailForPaperOrder = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm({
    initialValues: {
      pdfFiles: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <FullScreenDropZoneInput
          form={form}
          formName="pdfFile"
          label="PDF File"
          description="使用するPDFファイルを選択"
          placeholder="PDF file"
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
