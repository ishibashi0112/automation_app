import React, { FC, useState } from "react";
import {
  Dropzone,
  MS_EXCEL_MIME_TYPE,
  PDF_MIME_TYPE,
  IMAGE_MIME_TYPE,
} from "@mantine/dropzone";
import { Avatar, FileInput, Group, Text, Tooltip } from "@mantine/core";
import { MdOutlineFileUpload, MdOutlineUploadFile } from "react-icons/md";
import { RiCloseCircleLine, RiFileTextLine } from "react-icons/ri";
import { AiOutlineInfo } from "react-icons/ai";
import { useCallback } from "react";
import { UseFormReturnType } from "@mantine/form";
import { _TransformValues } from "@mantine/form/lib/types";
import { FormValues } from "types/type";

type Props<T> = {
  label: string;
  form?: T | null;
  formName?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  isInfo?: boolean;
  isExcelOnly?: boolean;
  multiple?: boolean;
  setFiles?: React.Dispatch<React.SetStateAction<File[]>> | null;
};

export const FullScreenDropZoneInput = <
  Values,
  T extends UseFormReturnType<Values, _TransformValues<Values>>
>(
  props: Props<T>
) => {
  const {
    form = null,
    formName = "",
    label = "",
    description = "",
    placeholder = "file",
    required = false,
    isInfo = true,
    isExcelOnly = false,
    multiple = false,
    setFiles = null,
  } = props;

  const [value, setValue] = useState<File[] | null>(null);

  const handleOnChange = useCallback((files: File[]) => {
    setValue(files);
    if (setFiles) {
      setFiles(files);
    }
  }, []);

  const handleOnDrop = (files: File[]) => {
    form ? form.getInputProps(formName).onChange(files[0]) : null;
    setFiles ? handleOnChange(files) : null;
  };

  return (
    <>
      {form ? (
        <FileInput
          classNames={{ required: "block", label: "flex gap-1" }}
          label={isInfo ? <WithInfoLabel label={label} /> : label}
          description={description}
          placeholder={placeholder}
          accept={isExcelOnly ? ".xlsx" : "image/png,image/jpeg,.pdf,.xlsx"}
          required={required}
          multiple={multiple}
          icon={<MdOutlineFileUpload />}
          {...form.getInputProps(formName)}
        />
      ) : null}
      {setFiles ? (
        <FileInput
          classNames={{ required: "block", label: "flex gap-1" }}
          label={isInfo ? <WithInfoLabel label={label} /> : label}
          description={description}
          placeholder={placeholder}
          accept={isExcelOnly ? ".xlsx" : "image/png,image/jpeg,.pdf,.xlsx"}
          required={required}
          multiple={multiple}
          icon={<MdOutlineFileUpload />}
          value={value}
          onChange={handleOnChange}
        />
      ) : null}
      <Dropzone.FullScreen
        activateOnClick={false}
        accept={
          isExcelOnly
            ? MS_EXCEL_MIME_TYPE
            : [...IMAGE_MIME_TYPE, ...MS_EXCEL_MIME_TYPE, ...PDF_MIME_TYPE]
        }
        multiple={multiple}
        onDrop={handleOnDrop}
        onReject={(files) => console.log("rejected files", files)}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: 220, pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <MdOutlineUploadFile size={50} stroke={"1.5"} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <RiCloseCircleLine size={50} stroke={"1.5"} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <RiFileTextLine size={50} stroke={"1.5"} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              Drag&Dropでファイルを選択できます。
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              許可された拡張子（.png .Jpeg .jpg .pjpeg .pjp .pdf .xlsx ）
            </Text>
          </div>
        </Group>
      </Dropzone.FullScreen>
    </>
  );
};

const WithInfoLabel: FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex items-center gap-1">
      <div>{label}</div>
      <Tooltip label="Drag&Dropでもファイルを選択できます。">
        <Avatar size={20} radius="xl" color={"blue"}>
          <AiOutlineInfo size={15} />
        </Avatar>
      </Tooltip>
    </div>
  );
};
