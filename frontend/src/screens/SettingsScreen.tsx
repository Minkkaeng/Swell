import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Modal,
  Linking,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  EyeOff,
  Database,
  Info,
  LogOut,
  ChevronRight,
  Trash2,
  X,
  UserX,
  ShieldAlert,
  ShieldCheck,
  Palette,
  Lock,
  BookOpen,
} from "lucide-react-native";

import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";
import { api } from "../services/api";

/**
 * @description 환경 설정 화면
 */
const SettingsScreen = ({ navigation }: any) => {
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const {
    userId,
    blockedUsers,
    unblockUser,
    resetStore,
    appTheme,
    setAppTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    isSecretModeActive,
    appPassword,
    setSecretMode,
    setAppPassword,
  } = useUserStore();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [tempTheme, setTempTheme] = useState(appTheme);

  // 시크릿 모드 관련 상태 추가
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"activate" | "deactivate" | "change">("activate");
  const [passwordStep, setPasswordStep] = useState(1);
  const [pinBuffer, setPinBuffer] = useState("");
  const [firstPin, setFirstPin] = useState("");

  const handlePINPress = (num: string) => {
    if (pinBuffer.length < 4) {
      const nextPin = pinBuffer + num;
      setPinBuffer(nextPin);

      if (nextPin.length === 4) {
        processPIN(nextPin);
      }
    }
  };

  const processPIN = (pin: string) => {
    if (passwordMode === "activate") {
      if (passwordStep === 1) {
        setFirstPin(pin);
        setPasswordStep(2);
        setPinBuffer("");
      } else {
        if (pin === firstPin) {
          setAppPassword(pin);
          setSecretMode(true);
          setShowPasswordModal(false);
          Alert.alert("성공", "시크릿 모드가 활성화되었습니다.");
        } else {
          Alert.alert("오류", "비밀번호가 일치하지 않습니다. 다시 시도해주세요.");
          resetPINFlow();
        }
      }
    } else if (passwordMode === "deactivate") {
      if (pin === appPassword) {
        setSecretMode(false);
        setAppPassword(null);
        setShowPasswordModal(false);
        Alert.alert("성공", "시크릿 모드가 비활성화되었습니다.");
      } else {
        Alert.alert("오류", "비밀번호가 틀렸습니다.");
        setPinBuffer("");
      }
    } else if (passwordMode === "change") {
      if (passwordStep === 1) {
        if (pin === appPassword) {
          setPasswordStep(2); // 이제 새로운 비번 입력 단계
          setPinBuffer("");
        } else {
          Alert.alert("오류", "현재 비밀번호가 틀렸습니다.");
          setPinBuffer("");
        }
      } else if (passwordStep === 2) {
        setFirstPin(pin);
        setPasswordStep(3); // 새로운 비번 확인 단계
        setPinBuffer("");
      } else {
        if (pin === firstPin) {
          setAppPassword(pin);
          setShowPasswordModal(false);
          Alert.alert("성공", "비밀번호가 변경되었습니다.");
        } else {
          Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
          resetPINFlow();
          setPasswordMode("change");
          setPasswordStep(2); // 다시 새로운 비번 입력부터
        }
      }
    }
  };

  const resetPINFlow = () => {
    setPinBuffer("");
    setFirstPin("");
    setPasswordStep(1);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: () => {
          resetStore(); // 스토어 상태 초기화
          navigation.replace("Login");
        },
        style: "destructive",
      },
    ]);
  };

  const SettingItem = ({ icon, label, rightElement, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between p-6 border-b border-white/5"
    >
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
          className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        >
          {React.cloneElement(icon as React.ReactElement, { color: THEMES[appTheme].accent })}
        </View>
        <Text style={{ color: THEMES[appTheme].text }} className="font-medium">
          {label}
        </Text>
      </View>
      {rightElement ? rightElement : <ChevronRight size={20} color={THEMES[appTheme].text} opacity={0.3} />}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      style={{ color: THEMES[appTheme].text }}
      className="text-xs font-bold tracking-widest mt-10 mb-4 px-2 uppercase opacity-40"
    >
      {title}
    </Text>
  );

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color={THEMES[appTheme].text} />
        </TouchableOpacity>
        <Text style={{ color: THEMES[appTheme].text }} className="text-lg font-bold">
          환경 설정
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-8 pb-20" showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <SectionHeader title="알림" />
        <View
          style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
          className="rounded-[35px] border border-white/5 overflow-hidden"
        >
          <SettingItem
            icon={<Bell size={20} />}
            label="푸시 알림"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={(enabled) => {
                  setNotificationsEnabled(enabled);
                  // 알림 토큰이 있는 경우 서버에 상태 업데이트
                  const { pushToken } = useUserStore.getState();
                  if (userId && pushToken && !userId.startsWith("guest_")) {
                    api.users.updatePushToken(userId, pushToken, enabled);
                  }
                }}
                trackColor={{ false: THEMES[appTheme].surface, true: THEMES[appTheme].accent }}
                thumbColor="#E0E0E0"
              />
            }
          />
        </View>

        {/* Display Section */}
        <SectionHeader title="화면 설정" />
        <View
          style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
          className="rounded-[35px] border border-white/5 overflow-hidden"
        >
          <SettingItem
            icon={<Palette size={20} />}
            label="테마 설정"
            onPress={() => {
              setTempTheme(appTheme);
              setShowThemeModal(true);
            }}
            rightElement={
              <View className="flex-row items-center">
                <Text style={{ color: THEMES[appTheme].text }} className="text-xs mr-3 opacity-40">
                  {appTheme === "midnight"
                    ? "미드나잇"
                    : appTheme === "ocean"
                      ? "오션"
                      : appTheme === "sunset"
                        ? "선셋"
                        : "포레스트"}
                </Text>
                <ChevronRight size={20} color={THEMES[appTheme].text} opacity={0.3} />
              </View>
            }
          />
        </View>

        {/* Privacy Section */}
        <SectionHeader title="개인정보 및 보안" />
        <View
          style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
          className="rounded-[35px] border border-white/5 overflow-hidden"
        >
          <SettingItem
            icon={<EyeOff size={20} />}
            label="차단된 사용자 관리"
            onPress={() => setShowBlockedModal(true)}
          />
          <SettingItem
            icon={<Lock size={20} />}
            label="시크릿 모드 (잠금)"
            rightElement={
              <Switch
                value={isSecretModeActive}
                onValueChange={(value) => {
                  resetPINFlow();
                  if (value) {
                    setPasswordMode("activate");
                    setShowPasswordModal(true);
                  } else {
                    setPasswordMode("deactivate");
                    setShowPasswordModal(true);
                  }
                }}
                trackColor={{ false: THEMES[appTheme].surface, true: THEMES[appTheme].accent }}
                thumbColor="#E0E0E0"
              />
            }
          />
          {isSecretModeActive && (
            <SettingItem
              icon={<ShieldCheck size={20} />}
              label="비밀번호 변경"
              onPress={() => {
                resetPINFlow();
                setPasswordMode("change");
                setShowPasswordModal(true);
              }}
            />
          )}
          <SettingItem
            icon={<Trash2 size={20} color="#E7433C" />}
            label="활동 기록 삭제"
            onPress={() => setShowDeleteModal(true)}
          />
        </View>

        {/* Support & Others */}
        <SectionHeader title="지원 및 정보" />
        <View
          style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
          className="rounded-[35px] border border-white/5 overflow-hidden"
        >
          <SettingItem
            icon={<Info size={20} color={THEMES[appTheme].text} />}
            label="앱 버전"
            rightElement={
              <Text style={{ color: THEMES[appTheme].text }} className="text-xs opacity-30">
                v1.0.0
              </Text>
            }
          />
          <SettingItem
            icon={<Database size={20} />}
            label="오픈소스 라이선스"
            onPress={() => setShowLicenseModal(true)}
          />
          <SettingItem
            icon={<BookOpen size={20} />}
            label="약관 및 정책"
            onPress={() => Linking.openURL("https://minkkaeng.github.io/Swell-docs/")}
          />
        </View>

        {/* Account Management */}
        <View className="mt-12 mb-20 px-2 space-y-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full py-6 rounded-[30px] border border-[#E7433C]/30 items-center justify-center mb-4"
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#E7433C" />
              <Text className="text-[#E7433C] font-bold ml-2">로그아웃</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              /* 
              // [유료화 전환 시 활성화 예정]
              Alert.alert(
                "너울 탈퇴하기", 
                "아직 사용하지 않은 유료 상품이 있습니다. 탈퇴 시 환불이 불가한데 정말 탈퇴하시겠습니까?",
                [
                  { text: "취소", style: "cancel" },
                  { text: "탈퇴", onPress: () => { resetStore(); navigation.replace("Login"); }, style: "destructive" }
                ]
              );
              */
              Alert.alert(
                "너울 탈퇴하기",
                "정말 너울을 떠나시겠습니까? 작성하신 소중한 사연들은 익명으로 남게 됩니다.",
                [
                  { text: "취소", style: "cancel" },
                  {
                    text: "탈퇴하기",
                    onPress: async () => {
                      try {
                        if (userId) {
                          await api.users.withdraw(userId);
                        }
                      } catch (error) {
                        console.error("Failed to withdraw:", error);
                      }
                      resetStore();
                      navigation.replace("Login");
                    },
                    style: "destructive",
                  },
                ],
              );
            }}
            className="w-full py-2 items-center justify-center"
          >
            <Text className="text-[#E0E0E0]/20 text-xs font-bold underline">너울 탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Theme Selection Modal */}
      <Modal visible={showThemeModal} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-20">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center">
              <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                테마 설정
              </Text>
              <TouchableOpacity
                onPress={() => setShowThemeModal(false)}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8">
              {/* Theme Preview Card */}
              <View className="mb-10">
                <Text
                  style={{ color: THEMES[appTheme].accent }}
                  className="text-[10px] font-bold tracking-[3px] mb-4 uppercase text-center"
                >
                  PREVIEW
                </Text>
                <View
                  style={{ backgroundColor: THEMES[tempTheme].bg }}
                  className="w-full h-48 rounded-[40px] border border-white/10 overflow-hidden p-6 items-center justify-center shadow-2xl"
                >
                  <View
                    style={{ backgroundColor: THEMES[tempTheme].surface }}
                    className="w-full h-24 rounded-3xl border border-white/5 items-center justify-center mb-4"
                  >
                    <Text style={{ color: THEMES[tempTheme].accent }} className="text-xl font-bold">
                      Swell Wave
                    </Text>
                  </View>
                  <Text style={{ color: THEMES[tempTheme].text }} className="text-xs opacity-60 text-center">
                    선택한 테마가 앱 전체에 적용됩니다.{"\n"}잔잔한 물결을 느껴보세요.
                  </Text>
                </View>
              </View>

              {/* Theme Options */}
              <View
                style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
                className="rounded-[35px] border border-white/5 p-6 mb-10"
              >
                <Text style={{ color: THEMES[appTheme].text }} className="font-bold mb-6 ml-2">
                  컬러 팔레트 선택
                </Text>
                <View className="flex-row flex-wrap justify-between px-2">
                  {[
                    { id: "midnight", color: "#001220", label: "미드나잇" },
                    { id: "ocean", color: "#002135", label: "오션" },
                    { id: "sunset", color: "#1A1025", label: "선셋" },
                    { id: "forest", color: "#0A120A", label: "포레스트" },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setTempTheme(t.id as any)}
                      className="items-center w-[22%]"
                    >
                      <View
                        style={{
                          backgroundColor: t.color,
                          borderColor: tempTheme === t.id ? THEMES[appTheme].accent : "rgba(255,255,255,0.1)",
                        }}
                        className={`w-14 h-14 rounded-2xl mb-2 items-center justify-center border-2`}
                      >
                        {tempTheme === t.id && (
                          <View style={{ backgroundColor: THEMES[appTheme].accent }} className="w-2 h-2 rounded-full" />
                        )}
                      </View>
                      <Text
                        style={{ color: tempTheme === t.id ? THEMES[appTheme].accent : THEMES[appTheme].text + "4D" }}
                        className={`text-[10px] font-bold`}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setAppTheme(tempTheme);
                  setShowThemeModal(false);
                  Alert.alert("테마 변경", "새로운 테마가 적용되었습니다.");
                }}
                style={{ backgroundColor: THEMES[appTheme].accent, shadowColor: THEMES[appTheme].accent }}
                className="py-6 rounded-[30px] items-center justify-center shadow-lg mb-12 shadow-[#00E0D0]/20"
              >
                <Text style={{ color: THEMES[appTheme].bg }} className="font-black text-lg">
                  테마 저장하기
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Blocked Users Manager Modal */}
      <Modal visible={showBlockedModal} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-24">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center mb-4">
              <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                차단된 사용자 관리
              </Text>
              <TouchableOpacity
                onPress={() => setShowBlockedModal(false)}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8">
              {blockedUsers.length === 0 ? (
                <View className="flex-1 items-center justify-center pt-24">
                  <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6">
                    <UserX size={32} color={THEMES[appTheme].text} opacity={0.2} />
                  </View>
                  <Text style={{ color: THEMES[appTheme].text }} className="text-lg font-bold opacity-30">
                    차단된 사용자가 없습니다
                  </Text>
                </View>
              ) : (
                blockedUsers.map((user) => (
                  <View
                    key={user.id}
                    style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
                    className="p-6 rounded-[35px] border border-white/5 mb-4 flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-lg mb-1">
                        {user.nickname}
                      </Text>
                      <Text style={{ color: THEMES[appTheme].text }} className="text-xs font-medium opacity-30">
                        차단 일시: {user.blockedAt}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        Alert.alert("차단 해제", `${user.nickname}님의 차단을 해제하시겠습니까?`, [
                          { text: "취소", style: "cancel" },
                          {
                            text: "해제",
                            onPress: () => unblockUser(user.id),
                            style: "destructive",
                          },
                        ]);
                      }}
                      className="bg-[#E7433C]/10 h-12 px-6 rounded-2xl border border-[#E7433C]/20 items-center justify-center"
                    >
                      <Text className="text-[#E7433C] text-sm font-bold">해제</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Open Source License Modal */}
      <Modal visible={showLicenseModal} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-24">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center mb-6">
              <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                오픈소스 라이선스
              </Text>
              <TouchableOpacity
                onPress={() => setShowLicenseModal(false)}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
              <View
                style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
                className="p-8 rounded-[35px] border border-white/5 mb-8"
              >
                <Text style={{ color: THEMES[appTheme].text }} className="text-sm leading-7 mb-8 px-2 opacity-60">
                  너울(Swell)은 더 나은 서비스를 만들기 위해 다양한 오픈소스를 사용하고 있습니다. 사용된 라이브러리에
                  기여한 모든 개발자분들께 감사드립니다.
                </Text>

                {[
                  { name: "React & React Native", license: "MIT", url: "facebook/react-native" },
                  { name: "Expo SDK", license: "MIT", url: "expo/expo" },
                  { name: "Zustand", license: "MIT", url: "pmndrs/zustand" },
                  { name: "NativeWind", license: "MIT", url: "marklawlor/nativewind" },
                  { name: "Lucide React Native", license: "ISC", url: "lucide-icons/lucide" },
                  { name: "React Navigation", license: "MIT", url: "react-navigation/react-navigation" },
                  { name: "React Native Reanimated", license: "MIT", url: "software-mansion/react-native-reanimated" },
                  {
                    name: "React Native Async Storage",
                    license: "MIT",
                    url: "react-native-async-storage/async-storage",
                  },
                  { name: "Expo Auth Session", license: "MIT", url: "expo/expo" },
                  { name: "Expo Crypto", license: "MIT", url: "expo/expo" },
                  { name: "React Native SVG", license: "MIT", url: "software-mansion/react-native-svg" },
                  {
                    name: "React Native Safe Area Context",
                    license: "MIT",
                    url: "th3rdwave/react-native-safe-area-context",
                  },
                  { name: "React Native Screens", license: "MIT", url: "software-mansion/react-native-screens" },
                ].map((lib, i) => (
                  <View
                    key={i}
                    className="flex-row items-center justify-between py-6 border-b border-white/5 last:border-b-0"
                  >
                    <View className="flex-1 pr-4">
                      <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-base mb-1">
                        {lib.name}
                      </Text>
                      <Text style={{ color: THEMES[appTheme].text }} className="text-xs font-medium opacity-30">
                        {lib.url}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: THEMES[appTheme].accent + "1A",
                        borderColor: THEMES[appTheme].accent + "33",
                      }}
                      className="px-3 py-1.5 rounded-xl border"
                    >
                      <Text
                        style={{ color: THEMES[appTheme].accent }}
                        className="text-[10px] font-black uppercase tracking-widest"
                      >
                        {lib.license}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PIN Input Modal */}
      <Modal visible={showPasswordModal} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/90 items-center justify-center px-8">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="w-full p-10 rounded-[40px] border border-white/10 items-center"
          >
            <View
              style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
              className="w-16 h-16 rounded-full items-center justify-center mb-6"
            >
              <Lock size={32} color={THEMES[appTheme].accent} />
            </View>

            <Text style={{ color: THEMES[appTheme].text }} className="text-xl font-bold mb-2">
              {passwordMode === "activate"
                ? passwordStep === 1
                  ? "비밀번호 설정"
                  : "비밀번호 확인"
                : passwordMode === "deactivate"
                  ? "비밀번호 입력"
                  : passwordStep === 1
                    ? "현재 비밀번호 입력"
                    : passwordStep === 2
                      ? "새 비밀번호 입력"
                      : "새 비밀번호 확인"}
            </Text>
            <Text style={{ color: THEMES[appTheme].text }} className="opacity-40 text-sm mb-10">
              {passwordMode === "activate" && passwordStep === 2
                ? "한 번 더 입력해 주세요"
                : "4자리 숫자를 입력해 주세요"}
            </Text>

            {/* PIN Dots */}
            <View className="flex-row space-x-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: pinBuffer.length >= i ? THEMES[appTheme].accent : THEMES[appTheme].text + "1A",
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                  }}
                />
              ))}
            </View>

            {/* Numeric Pad */}
            <View className="w-full flex-row flex-wrap justify-between">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"].map((val, idx) => (
                <TouchableOpacity
                  key={idx}
                  disabled={val === ""}
                  onPress={() => {
                    if (val === "delete") setPinBuffer(pinBuffer.slice(0, -1));
                    else if (val !== "") handlePINPress(val);
                  }}
                  className="w-[30%] h-20 items-center justify-center mb-2"
                >
                  {val === "delete" ? (
                    <ArrowLeft size={24} color={THEMES[appTheme].text} />
                  ) : (
                    <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                      {val}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowPasswordModal(false);
                resetPINFlow();
              }}
              className="mt-8"
            >
              <Text style={{ color: "#E7433C" }} className="font-bold">
                취소
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Activity History Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/80 items-center justify-center p-8">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="p-10 rounded-[40px] border border-[#E7433C]/20 w-full items-center"
          >
            <View className="w-16 h-16 bg-[#E7433C]/10 rounded-full items-center justify-center mb-6">
              <ShieldAlert size={32} color="#E7433C" />
            </View>
            <Text style={{ color: THEMES[appTheme].text }} className="text-xl font-bold mb-4 text-center">
              활동 기록 삭제
            </Text>
            <Text style={{ color: THEMES[appTheme].text }} className="text-center leading-7 mb-10 text-sm opacity-60">
              모든 게시글 및 댓글이 삭제되며{"\n"}
              사용자 등급 및 뱃지 데이터가{"\n"}
              초기화되어 복구할 수 없습니다.{"\n\n"}
              정말로 모든 기록을 삭제하시겠습니까?
            </Text>

            <View className="flex-row space-x-4 w-full">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-white/5 py-4 rounded-2xl items-center"
              >
                <Text style={{ color: THEMES[appTheme].text }} className="font-bold">
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    if (userId) {
                      await api.users.deleteHistory(userId);
                      Alert.alert("완료", "모든 활동 기록이 삭제되었습니다.");
                    }
                  } catch (error) {
                    Alert.alert("오류", "활동 기록 삭제 중 문제가 발생했습니다.");
                  } finally {
                    setShowDeleteModal(false);
                  }
                }}
                className="flex-1 bg-[#E7433C] py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold">삭제하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
