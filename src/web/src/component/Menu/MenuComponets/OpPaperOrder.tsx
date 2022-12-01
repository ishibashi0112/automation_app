import React, { FC } from "react";
import { Select, NumberInput, Button } from "@mantine/core";
import { LoginInput } from "./LoginInput";
import { useMenuForm } from "hook/useMenuForm";
import { OpPaperValues } from "types/type";

export const OpPaperOrder: FC = () => {
  const { form, handleOnSubmit, OverLay, resultView } =
    useMenuForm<OpPaperValues>({
      initialValues: {
        id: "",
        password: "",
        type: "",
        startPage: 1,
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

        <Button className="mt-4" type="submit" variant="filled">
          実行する
        </Button>

        {OverLay}

        {resultView}
      </div>
    </form>
  );
};
