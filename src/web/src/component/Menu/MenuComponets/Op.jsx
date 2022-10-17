import React from "react";
import { Button, NumberInput, TextInput } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useSharedState } from "../../../hook/useSharedState";
import { useMenuForm } from "../../../hook/useMenuForm";

export const Op = () => {
  const [menu] = useSharedState("menu");
  const { form, handleOnSubmit, isLoading, OverLay, resultView } =
    useMenuForm(menu);

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />
        <NumberInput
          defaultValue={0}
          placeholder="page num"
          label="StartPage"
          description="1 = 10ページ分スキップします"
          required
          {...form.getInputProps("startPage")}
        />
        <TextInput
          placeholder="Your Initial"
          label="Name Initial"
          description="備考欄に記載する自分のイニシャルを入力"
          {...form.getInputProps("nameInitial")}
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