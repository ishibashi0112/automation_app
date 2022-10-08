import { Button, Modal, Overlay, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { RiCheckFill, RiCloseFill, RiDeleteBin2Line } from "react-icons/ri";
import { useSWRConfig } from "swr";
import { db } from "../lib/firebase";

export const useRemoveModal = (collectionName) => {
  const [removeDoc, setRemoveDoc] = useState({});
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const handleRemove = useCallback(async () => {
    try {
      setIsLoading(true);
      const itemsRef = doc(db, collectionName, removeDoc.id);
      await deleteDoc(itemsRef);
      await mutate(collectionName);
      showNotification({
        title: "削除が完了しました。",
        message: "削除が正常に完了しました。",
        color: "teal",
        icon: <RiCheckFill />,
      });
    } catch (error) {
      showNotification({
        title: "削除が失敗しました。",
        message: "処理が失敗しました",
        color: "red",
        icon: <RiCloseFill />,
      });
    } finally {
      setOpenRemoveModal(false);
      setIsLoading(false);
    }
  }, [removeDoc]);

  return {
    setRemoveDoc,
    setOpenRemoveModal,
    modal: (
      <Modal
        opened={openRemoveModal}
        onClose={isLoading ? null : () => setOpenRemoveModal(false)}
        title="削除画面"
        size="xs"
      >
        {collectionName === "items" ? (
          <div className="mb-2">
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"品番"}
              value={removeDoc.itemNum}
              readOnly
            />
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"品名"}
              value={removeDoc.itemName}
              readOnly
            />
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"ルール"}
              value={removeDoc.rule}
              readOnly
            />
          </div>
        ) : (
          <div className="mb-2">
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"タイトル"}
              value={removeDoc.title}
              readOnly
            />
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"始まり"}
              value={
                removeDoc.start
                  ? dayjs(removeDoc.start).format("YY年M月D日")
                  : " "
              }
              readOnly
            />
            <TextInput
              classNames={{ input: "px-2", label: "text-xs" }}
              variant="unstyled"
              label={"終わり"}
              value={
                removeDoc.end ? dayjs(removeDoc.end).format("YY年M月D日") : " "
              }
              readOnly
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            className="mr-2"
            variant="subtle"
            color="gray"
            compact
            onClick={() => setOpenRemoveModal(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="light"
            color="red"
            compact
            leftIcon={<RiDeleteBin2Line />}
            loading={isLoading}
            onClick={handleRemove}
          >
            削除する
          </Button>
        </div>
        {isLoading && <Overlay opacity={0} color="black" zIndex={20} />}
      </Modal>
    ),
  };
};
