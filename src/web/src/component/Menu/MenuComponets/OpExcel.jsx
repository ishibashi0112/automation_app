import React from "react";
import { LoginInput } from "./LoginInput";
import { FullScreenDropZoneInput } from "./FullScreenDropZoneInput";

export const OpExcel = ({ form }) => {
  return (
    <div className="flex flex-col gap-3">
      <LoginInput form={form} />
      <FullScreenDropZoneInput
        form={form}
        formName="excel"
        label="Excel File"
        description="使用するExcelファイルを選択"
        placeholder="excel file"
        isExcelOnly
        required
      />
    </div>
  );
};
