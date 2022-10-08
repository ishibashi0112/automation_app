import React, { useCallback } from "react";
import { Button, NumberInput, TextInput } from "@mantine/core";

import { LoginInput } from "./LoginInput";
import { useForm } from "@mantine/form";
import { useSharedState } from "../../../hook/useSharedState";
import { useMenuForm } from "../../../hook/useMenuForm";

export const OpC = () => {
  const [menu] = useSharedState("menu");
  const { form, handleOnSubmit, isLoading, OverLay, resultView } =
    useMenuForm(menu);

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={form.onSubmit(handleOnSubmit)}>
        <LoginInput form={form} />

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>
      </form>

      {OverLay}

      {resultView}
    </div>
  );
};
