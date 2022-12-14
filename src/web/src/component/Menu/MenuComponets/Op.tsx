import React, { FC } from "react";
import { Button, NumberInput, TextInput } from "@mantine/core";
import { useMenuForm } from "hook/useMenuForm";
import { LoginInput } from "./LoginInput";
import { OpValues } from "types/type";

export const Op: FC = () => {
  const { form, handleOnSubmit, OverLay, resultView } = useMenuForm<OpValues>({
    initialValues: {
      id: "",
      password: "",
      startPage: 1,
      nameInitial: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleOnSubmit)}>
      <div className="flex flex-col gap-2">
        <LoginInput form={form} />
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
