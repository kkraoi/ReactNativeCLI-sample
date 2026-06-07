/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { StyleSheet, View, Text } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "./src/screens/LoginScreen";
import { MainMenuScreen } from "./src/screens/MainMenuScreen";
import { TestWebViewInlineScreen } from "./src/screens/TestWebViewInlineScreen";
import { TestWebViewOuterScreen } from "./src/screens/TestWebViewOuterScreen";
import { NetworkingScreen } from "./src/screens/NetworkingScreen";
import { QrScannerScreen } from "./src/screens/QrScannerScreen";
import { BarcodeScannerScreen } from "./src/screens/BarcodeScannerScreen";

export type RootStackPramList = {
  Login: undefined;
  MainMenuScreen: undefined;
  TestWebViewInlineScreen: undefined;
  TestWebViewOuterScreen: undefined;
  NetworkingScreen: undefined;
  QrScannerScreen: undefined;
  BarcodeScannerScreen: undefined;
}

const Stack = createNativeStackNavigator<RootStackPramList>();

function App(): React.JSX.Element {

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,
            headerBackTitle: '',
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{title: "ログイン"}}
          />

          <Stack.Screen
            name="MainMenuScreen"
            component={MainMenuScreen}
            options={{title: "ホーム"}}
          /> 

          <Stack.Screen
            name="TestWebViewInlineScreen"
            component={TestWebViewInlineScreen}
            options={{title: "テストWebView"}}
          /> 

          <Stack.Screen
            name="TestWebViewOuterScreen"
            component={TestWebViewOuterScreen}
            options={{title: "テストWebViewアセット利用"}}
          /> 

          <Stack.Screen
            name="NetworkingScreen"
            component={NetworkingScreen}
            options={{title: "Networking"}}
          />

          <Stack.Screen
            name="QrScannerScreen"
            component={QrScannerScreen}
            options={{title: "QRスキャナー"}}
          /> 

          <Stack.Screen
            name="BarcodeScannerScreen"
            component={BarcodeScannerScreen}
            options={{title: "バーコードスキャナー"}}
          /> 
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;