import React from "react";
import { PasswordInput, TextInput } from "@mantine/core";

export const LoginInput = ({ form }) => {
  return (
    <>
      <TextInput
        className="flex-1"
        placeholder="service system ID"
        label="ID"
        description="サービスシステムのIDを入力"
        required
        data-autofocus
        {...form.getInputProps("id")}
      />

      <PasswordInput
        className="flex-1"
        placeholder="service system PASS"
        label="PASS"
        description="サービスシステムのPasswordを入力"
        required
        {...form.getInputProps("password")}
      />
    </>
  );
};
