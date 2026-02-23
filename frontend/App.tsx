import "./global.css";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
// 웹 환경에서만 모바일 디버그 콘솔(eruda) 실행
if (Platform.OS === "web") {
  const eruda = require("eruda");
  eruda.init();
}
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import STTScreen from "./src/screens/STTScreen";
import TestScreen from "./src/screens/TestScreen";
import IntroScreen from "./src/screens/IntroScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import WriteScreen from "./src/screens/WriteScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SupportScreen from "./src/screens/SupportScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import GuideScreen from "./src/screens/GuideScreen";
import GlobalLoading from "./src/components/GlobalLoading";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
          }}
        >
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Test" component={TestScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="STT" component={STTScreen} />
          <Stack.Screen name="Write" component={WriteScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Guide" component={GuideScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <GlobalLoading />
    </>
  );
}
