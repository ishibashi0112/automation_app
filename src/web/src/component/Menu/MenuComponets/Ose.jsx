import React from "react";
import { Select, NumberInput, Button } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useSharedState } from "../../../hook/useSharedState";
import { useMenuForm } from "../../../hook/useMenuForm";

export const Ose = () => {
  const [menu] = useSharedState("menu");
  const { form, handleOnSubmit, isLoading, OverLay, resultView } =
    useMenuForm(menu);

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
