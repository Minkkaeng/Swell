import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 웹 환경에서만 모바일 디버그 콘솔(eruda) 실행
if (Platform.OS === "web") {
  const eruda = require("eruda");
  eruda.init();
}

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import STTScreen from "./src/screens/STTScreen";
import TestScreen from "./src/screens/TestScreen";
import IntroScreen from "./src/screens/IntroScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import BirthYearScreen from "./src/screens/BirthYearScreen";
import WriteScreen from "./src/screens/WriteScreen";
import PostDetailScreen from "./src/screens/PostDetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SupportScreen from "./src/screens/SupportScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import GuideScreen from "./src/screens/GuideScreen";
import "./global.css";
import GlobalLoading from "./src/components/GlobalLoading";
import { api } from "./src/services/api";

import { registerForPushNotificationsAsync } from "./src/services/notificationService";
import { useUserStore } from "./src/store/userStore";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { setPushToken, userId, notificationsEnabled } = useUserStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 푸시 알림 설정
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setPushToken(token);
        // 이미 로그인된 상태라면 서버에도 토큰 업데이트
        if (userId && !userId.startsWith("guest_")) {
          api.users.updatePushToken(userId, token, notificationsEnabled);
        }
      }
    });
  }, [userId]);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#001220" }} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Intro"
          screenOptions={{
            headerShown: false,
            animation: "none", // 애니메이션 제거 요청 반영
          }}
        >
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="BirthYear" component={BirthYearScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="STT" component={STTScreen} />
          <Stack.Screen name="Write" component={WriteScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Guide" component={GuideScreen} />
          <Stack.Screen name="Test" component={TestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <GlobalLoading />
    </SafeAreaProvider>
  );
}
