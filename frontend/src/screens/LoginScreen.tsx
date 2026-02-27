import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { CheckSquare, Square, X, MessageCircle, Waves } from "lucide-react-native";
import { Linking } from "react-native";
import WaveLogo from "../components/WaveLogo";
import { useGlobalLoader } from "../hooks/useGlobalLoader";
import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";
import { api } from "../services/api";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

/**
 * @description 소셜 로그인 연동 중심의 로그인 화면 - 미니멀 디자인 반영
 */
const LoginScreen = ({ navigation }: any) => {
  const [isAutoLogin, setIsAutoLogin] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { startLoading, stopLoading } = useGlobalLoader();
  const { setStatus, setUserId, setNickname, nickname, hasSeenGuide, appTheme } = useUserStore();

  const PROXY_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/callback`;
  const redirectUri = PROXY_URL;

  const returnUrl = AuthSession.makeRedirectUri({
    scheme: "swell",
    path: "oauth",
  });

  const [kakaoRequest, kakaoResponse, promptKakaoAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID || "",
      scopes: ["profile_nickname"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    { authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize" },
  );

  const [googleRequest, googleResponse, promptGoogleAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
      scopes: ["profile", "email"],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" },
  );

  const googleVerifierRef = React.useRef<string | null>(null);
  const kakaoVerifierRef = React.useRef<string | null>(null);
  const activePlatformRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (kakaoRequest?.codeVerifier) {
      kakaoVerifierRef.current = kakaoRequest.codeVerifier;
    }
  }, [kakaoRequest]);

  useEffect(() => {
    if (googleRequest?.codeVerifier) {
      googleVerifierRef.current = googleRequest.codeVerifier;
    }
  }, [googleRequest]);

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (url.includes("swell://oauth")) {
        const query = url.split("?")[1];
        if (query) {
          const params: Record<string, string> = {};
          query.split("&").forEach((part) => {
            const parts = part.split("=");
            const key = parts[0];
            const value = parts[1] ? decodeURIComponent(parts[1]) : "";
            params[key] = value;
          });

          if (params.code) {
            const provider = activePlatformRef.current || (url.includes("google") ? "google" : "kakao");
            const verifier = provider === "kakao" ? kakaoVerifierRef.current : googleVerifierRef.current;
            handleAuthComplete(provider, params.code, verifier || undefined);
          }
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (kakaoResponse?.type === "success" && kakaoResponse.params.code) {
      handleAuthComplete("kakao", kakaoResponse.params.code, kakaoVerifierRef.current || undefined);
    } else if (kakaoResponse?.type === "error") {
      Alert.alert("로그인 실패", kakaoResponse.error?.message || "카카오 로그인에 실패했습니다.");
    }
  }, [kakaoResponse]);

  useEffect(() => {
    if (googleResponse?.type === "success" && googleResponse.params.code) {
      handleAuthComplete("google", googleResponse.params.code, googleVerifierRef.current || undefined);
    } else if (googleResponse?.type === "error") {
      Alert.alert("로그인 실패", googleResponse.error?.message || "Google 로그인에 실패했습니다.");
    }
  }, [googleResponse]);

  const handleSocialLogin = async (platform: string) => {
    activePlatformRef.current = platform;
    if (platform === "kakao") {
      await promptKakaoAsync();
    } else if (platform === "google") {
      await promptGoogleAsync();
    }
  };

  const isProcessingRef = React.useRef(false);

  const handleAuthComplete = async (provider: string, accessToken: string, codeVerifier?: string) => {
    if (isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;
      setIsLoggingIn(true);
      startLoading(500);

      const response = await api.auth.socialLogin(provider, accessToken, redirectUri, codeVerifier);

      if (response.success && response.user) {
        setStatus(response.user.status || "USER");
        setUserId(response.user.id);
        if (response.user.nickname) setNickname(response.user.nickname);
        if (response.token) {
          useUserStore.getState().setToken(response.token);
        }

        if (hasSeenGuide) {
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        } else {
          navigation.replace("Guide");
        }
      } else if (response.error === "NOT_REGISTERED") {
        Alert.alert("미등록 계정", "등록되지 않은 계정입니다.\n아직 회원이 아니신가요?", [
          { text: "취소", style: "cancel" },
          {
            text: "회원가입하기",
            onPress: () => navigation.navigate("Register", { socialData: response.socialData }),
            style: "default",
          },
        ]);
      } else {
        Alert.alert("로그인 실패", response.message || "로그인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("[Login Error]", error);
      Alert.alert("오류", "서버와의 통신이 원활하지 않습니다.");
    } finally {
      setIsLoggingIn(false);
      stopLoading();
      isProcessingRef.current = false;
    }
  };

  const handleDevLogin = () => {
    setUserId("user1");
    setNickname("지친신입사원");
    setStatus("USER");

    if (hasSeenGuide) {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } else {
      navigation.replace("Guide");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      {/* 배경 장식 - 더 은은하게 조정 */}
      <View
        style={{ backgroundColor: THEMES[appTheme].accent + "0A" }}
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
      />

      <View className="flex-1 px-10 justify-center">
        {/* 상단 로고 섹션 - 더 미니멀하게 축소 */}
        <View className="mb-12 items-center">
          <View
            style={{ backgroundColor: THEMES[appTheme].accent + "14" }}
            className="w-16 h-16 rounded-[24px] items-center justify-center border border-white/5 mb-4"
          >
            <WaveLogo size={32} color={THEMES[appTheme].accent} />
          </View>
          <Text style={{ color: THEMES[appTheme].text }} className="text-[28px] font-bold tracking-tight text-center">
            너울
          </Text>
          <Text style={{ color: THEMES[appTheme].text }} className="opacity-40 text-center text-xs mt-2 font-medium">
            익명 커뮤니티
          </Text>
        </View>

        {/* Social Buttons Section - 미니멀한 스타일로 전면 개편 */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin("kakao")}
            disabled={isLoggingIn}
            className="bg-[#FEE500] h-[52px] rounded-[16px] flex-row items-center justify-center mb-3"
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <Text className="text-[#191919] text-[15px] font-semibold">카카오로 시작하기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin("google")}
            disabled={isLoggingIn}
            style={{ backgroundColor: THEMES[appTheme].text + "0D" }}
            className="h-[52px] rounded-[16px] flex-row items-center justify-center border border-white/5 mb-4"
          >
            {isLoggingIn ? (
              <ActivityIndicator color={THEMES[appTheme].text} />
            ) : (
              <Text style={{ color: THEMES[appTheme].text }} className="text-[15px] font-semibold">
                Google로 시작하기
              </Text>
            )}
          </TouchableOpacity>

          {/* Dev Test Login Button - 더 눈에 띄지 않게 처리 */}
          {(__DEV__ || Platform.OS === "web") && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleDevLogin} className="py-2 items-center mb-2">
              <Text style={{ color: THEMES[appTheme].text }} className="opacity-20 text-[12px] font-medium">
                테스트 계정으로 이용하기
              </Text>
            </TouchableOpacity>
          )}

          {/* Auto Login Checkbox */}
          <View className="items-center mt-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAutoLogin(!isAutoLogin)}
              className="flex-row items-center py-2"
            >
              <View className="mr-2">
                {isAutoLogin ? (
                  <CheckSquare size={16} color={THEMES[appTheme].accent} />
                ) : (
                  <Square size={16} color={THEMES[appTheme].text} opacity={0.2} />
                )}
              </View>
              <Text
                style={{ color: isAutoLogin ? THEMES[appTheme].accent : THEMES[appTheme].text + "33" }}
                className="text-[13px] font-medium"
              >
                자동 로그인 유지
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Links - 더 얇고 깔끔하게 */}
        <View className="items-center mt-8">
          <TouchableOpacity onPress={() => Alert.alert("회원가입 안내", "로그인 시 자동으로 회원가입이 진행됩니다.")}>
            <Text style={{ color: THEMES[appTheme].text }} className="text-[13px] opacity-30 font-medium underline">
              회원가입 정보 확인하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
