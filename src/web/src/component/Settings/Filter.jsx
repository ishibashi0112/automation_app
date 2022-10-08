import React from "react";
import { Select, TextInput, Popover, Button } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { RiFilterLine } from "react-icons/ri";

export const Filter = ({ column }) => {
  const [value, setValue] = useState("");
  const [debouncedText] = useDebouncedValue(value, 300);
  const headerText = column.columnDef.header;

  const handleOnChange = useCallback((e) => {
    setValue(e.currentTarget.value);
  }, []);

  useEffect(() => {
    column.setFilterValue(debouncedText);
  }, [debouncedText]);

  if (!headerText) {
    return;
  }
  console.log("Filter");

  return (
    <Popover trapFocus>
      <Popover.Target>
        <Button color="dark" compact variant={value ? "light" : "subtle"}>
          <RiFilterLine />
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        {headerText === "ルール" ? (
          <Select
            size="xs"
            clearable
            value={value}
            data={["処理をスルー", "伝票を発行", "発注計画を削除"]}
            onChange={setValue}
          />
        ) : headerText === "反映" ? (
          <Select
            size="xs"
            clearable
            data={["true", "false"]}
            onChange={setValue}
          />
        ) : (
          <TextInput size="xs" value={value} onChange={handleOnChange} />
        )}
      </Popover.Dropdown>
    </Popover>
  );
};
