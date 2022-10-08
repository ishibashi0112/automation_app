import React, { useState } from "react";
import { Header } from "./component/Header";
import { useItems } from "./hook/useItems";
import { Alert, AppShell, Container, Loader } from "@mantine/core";
import { RiAlertLine } from "react-icons/ri";
import { useSchedules } from "./hook/useSchedules";
import { Main } from "./component/Main";
import { Navbar } from "./component/Navbar";
import { useSuppliers } from "./hook/useSuppliers";
import { useLocalStorage, useToggle } from "@mantine/hooks";

export const App = () => {
  const { error: itemsError, isLoading: itemsLoading } = useItems();
  const { error: schedulesError, isLoading: schedulesLoading } = useSchedules();
  const { error: suppliersError, isLoading: suppliersLoading } = useSuppliers();
  const [mainMenu, setMainMenu] = useState(0);
  const [drawerOpened, drawerToggle] = useToggle([false, true]);

  const [colorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
  });
  const dark = colorScheme === "dark";

  if (itemsLoading || schedulesLoading || suppliersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="m-0">
          <Loader />
        </p>
        <p className="my-0 ml-1 text-lg">Loading...</p>
      </div>
    );
  }

  if (itemsError || schedulesError || suppliersError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert icon={<RiAlertLine size={16} />} title="ERROR" color="red">
          エラーが発生しました。アプリを再起動してください。
        </Alert>
      </div>
    );
  }

  return (
    <>
      <AppShell
        classNames={{
          main: dark ? "bg-black" : "bg-gray-100",
        }}
        navbar={
          <Navbar
            drawerOpened={drawerOpened}
            drawerToggle={drawerToggle}
            setMainMenu={setMainMenu}
          />
        }
        header={<Header drawerToggle={drawerToggle} />}
        navbarOffsetBreakpoint="sm"
      >
        <Container size="lg">
          <Main mainMenu={mainMenu} />
        </Container>
      </AppShell>
    </>
  );
};
