import React, { FC } from "react";
import { Button, Checkbox } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useMenuForm } from "hook/useMenuForm";
import { LoginValues } from "types/type";

export const OpC: FC = () => {
  const { form, handleOnSubmit, OverLay, resultView } =
    useMenuForm<LoginValues>({
      initialValues: {
        id: "",
        password: "",
      },
    });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />

        {/* <Checkbox
          label="I agree to sell my privacy"
          {...form.getInputProps("termsOfService", { type: "checkbox" })}
        /> */}

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>

        {OverLay}

        {resultView}
      </div>
    </form>
  );
};
