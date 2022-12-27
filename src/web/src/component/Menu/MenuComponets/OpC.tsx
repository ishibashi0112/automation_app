import React, { FC } from "react";
import { Button, Checkbox } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useMenuForm } from "hook/useMenuForm";
import { OpCValues } from "types/type";

export const OpC: FC = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm<OpCValues>({
    initialValues: {
      id: "",
      password: "",
      isChangeDeliveryTime: false,
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />

        <Checkbox
          className="mt-3"
          label="デフォルト納期をL/T通りに修正する"
          {...form.getInputProps("isChangeDeliveryTime", { type: "checkbox" })}
        />

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>

        {OverLay}

        {resultView}
      </div>
    </form>
  );
};
