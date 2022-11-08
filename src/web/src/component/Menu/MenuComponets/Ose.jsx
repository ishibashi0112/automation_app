import React from "react";
import { Button } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useMenuForm } from "../../../hook/useMenuForm";

export const Ose = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm({
    initialValues: {
      id: "",
      password: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>
      </div>

      {OverLay}

      {resultView}
    </form>
  );
};
