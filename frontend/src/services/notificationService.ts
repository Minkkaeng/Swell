import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useUserStore } from "../store/userStore";
import { api } from "./api";

// 알림 표시 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * @description 푸시 알림 권한 요청 및 토큰 획득
 */
export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("푸시 알림 권한 획득 실패");
      return;
    }

    try {
      // projectId는 app.json의 extra.eas.projectId에서 가져옴
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log("획득한 푸시 토큰:", token);

      // 스토어 및 백엔드에 토큰 저장
      const { userId, setPushToken } = useUserStore.getState();
      if (token) {
        setPushToken(token);
        if (userId) {
          await api.users.updatePushToken(userId, token);
        }
      }
    } catch (e) {
      console.log("토큰 획득 중 오류 발생:", e);
    }
  } else {
    console.log("실제 기기가 아니므로 푸시 알림을 사용할 수 없습니다.");
  }

  return token;
};
