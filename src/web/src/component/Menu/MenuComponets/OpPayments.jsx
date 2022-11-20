import React from "react";
import { Select, NumberInput, TextInput, Button } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useMenuForm } from "../../../hook/useMenuForm";

export const OpPayments = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm({
    initialValues: {
      id: "",
      password: "",
      type: "",
      startPage: 1,
      nameInitial: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
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
          defaultValue={1}
          placeholder="page num"
          label="StartPage"
          description="開始するページ数を指定します"
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
