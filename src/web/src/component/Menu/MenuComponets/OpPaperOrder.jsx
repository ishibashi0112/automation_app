import React from "react";
import { Select, NumberInput, Button } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useSharedState } from "../../../hook/useSharedState";
import { useMenuForm } from "../../../hook/useMenuForm";

export const OpPaperOrder = () => {
  const [menu] = useSharedState("menu");
  const { form, handleOnSubmit, isLoading, OverLay, resultView } =
    useMenuForm(menu);

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={form.onSubmit(handleOnSubmit)}>
        <LoginInput form={form} />
        <Select
          data={["国内", "海外"]}
          placeholder="Pick one"
          label="国内/海外"
          description="対応する向け地を選択"
          required
          {...form.getInputProps("type")}
        />
        <NumberInput
          defaultValue={0}
          placeholder="page num"
          label="StartPage"
          description="1 = 10ページ分スキップします"
          required
          {...form.getInputProps("startPage")}
        />

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>
      </form>

      {OverLay}

      {resultView}
    </div>
  );
};
