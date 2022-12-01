import React, { FC } from "react";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";
import { useMenuForm } from "hook/useMenuForm";
import { Button } from "@mantine/core";
import { CreateMailForPaperOrderValues } from "types/type";

export const CreateMailForPaperOrder: FC = () => {
  const { form, handleOnSubmit, OverLay, resultView } =
    useMenuForm<CreateMailForPaperOrderValues>({
      initialValues: {
        pdfFiles: "",
      },
    });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <FullScreenDropZoneInput<CreateMailForPaperOrderValues, typeof form>
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
