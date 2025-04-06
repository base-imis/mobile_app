import React, { useState } from "react";
import { useSelector } from "react-redux";

import RootStack from "./RootStack";
import SignInScreen from "../screens/auth/SigninScreen";
import PermissionProvider from "../hooks/PermissionContext";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "../utils/navigation";

const AppNavigation = () => {
  const { token, permissions } = useSelector((state) => state.auth);

  const switchRoute = () => {
    if (!!token && !!permissions) {
      return <RootStack />;
    } else {
      return <SignInScreen />;
    }
  };
  return (
    <PermissionProvider>
      <NavigationContainer ref={navigationRef}>
        {switchRoute()}
      </NavigationContainer>
    </PermissionProvider>
  );
};

export default AppNavigation;
