import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from "react-native";
import { CheckSquare, Square } from "lucide-react-native";
import { Linking } from "react-native";
import WaveLogo from "../components/WaveLogo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalLoader } from "../hooks/useGlobalLoader";
import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";
import { api } from "../services/api";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { NavigationProp, useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

/**
 * @description 소셜 로그인 연동 중심의 로그인 화면
 */
const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [isAutoLogin, setIsAutoLogin] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { startLoading, stopLoading } = useGlobalLoader();
  const { setStatus, setUserId, setNickname, hasSeenGuide, appTheme } = useUserStore();

  // 자체 백엔드 프록시 주소 (카카오/구글 콘솔에 등록할 유일한 주소)
  const redirectUri = "https://swell-backend.onrender.com/api/auth/proxy";

  console.log(`[Auth] Platform: ${Platform.OS}, Redirect URI: ${redirectUri}`);

  // === 카카오 로그인 설정 ===
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

  // === 구글 로그인 설정 ===
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

  const activePlatformRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const kakaoVerifierRef = useRef<string | null>(null);
  const googleVerifierRef = useRef<string | null>(null);

  // Verifier 동기화 및 유지
  useEffect(() => {
    if (kakaoRequest?.codeVerifier) {
      kakaoVerifierRef.current = kakaoRequest.codeVerifier;
      AsyncStorage.setItem("kakao_verifier", kakaoRequest.codeVerifier);
      console.log("[Auth] Kakao Verifier saved:", kakaoRequest.codeVerifier.substring(0, 5) + "...");
    }
  }, [kakaoRequest]);

  useEffect(() => {
    if (googleRequest?.codeVerifier) {
      googleVerifierRef.current = googleRequest.codeVerifier;
      AsyncStorage.setItem("google_verifier", googleRequest.codeVerifier);
      console.log("[Auth] Google Verifier saved:", googleRequest.codeVerifier.substring(0, 5) + "...");
    }
  }, [googleRequest]);

  /**
   * @description 백엔드로 인가 코드와 검증기(PKCE), 프록시 Redirect URI 전달
   */
  const handleAuthComplete = async (provider: string, code: string, codeVerifier?: string) => {
    if (isProcessingRef.current) {
      console.log("[Auth] Already processing a login request, skipping...");
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsLoggingIn(true);
      console.log(`[Auth] handleAuthComplete triggered for ${provider}. Code mode.`);
      startLoading(500);

      console.log(`[Auth] Calling api.auth.socialLogin for ${provider}...`);
      const response = await api.auth.socialLogin(provider, code, redirectUri, codeVerifier);
      console.log(`[Auth] Backend Response for ${provider}:`, response);

      if (response.success && response.user) {
        setStatus(response.user.status || "USER");
        setUserId(response.user.id);
        if (response.user.nickname) setNickname(response.user.nickname);

        if (hasSeenGuide) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
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
    } catch (error: any) {
      console.error("[Login Error]", error);
      const detail = error?.message || "알 수 없는 에러";
      Alert.alert("오류", `서버와의 통신이 원활하지 않습니다.\n(${detail})`);
    } finally {
      setIsLoggingIn(false);
      isProcessingRef.current = false;
      stopLoading();
    }
  };

  /**
   * @description 딥링크 리스너 (강제 캐치용)
   */
  useEffect(() => {
    const handleUrl = async (url: string) => {
      console.log("[Auth] Deep Link Detected:", url);
      if (url.includes("swell://oauth")) {
        const query = url.split("?")[1] || url.split("#")[1]; // 토큰은 보통 해시(#)로 옴
        if (query) {
          const params: Record<string, string> = {};
          query.split("&").forEach((part) => {
            const parts = part.split("=");
            const key = parts[0];
            const value = parts[1] ? decodeURIComponent(parts[1]) : "";
            params[key] = value;
          });

          const code = params.code;
          console.log(`[Auth] Parsed deep link params. Code exists? ${!!code}`);
          if (code) {
            console.log("[Auth] Code found in deep link, processing...");
            const provider = activePlatformRef.current || (url.includes("google") ? "google" : "kakao");

            // 1. Ref 확인, 2. State 확인, 3. AsyncStorage 확인
            let codeVerifier =
              provider === "google"
                ? googleVerifierRef.current || googleRequest?.codeVerifier
                : kakaoVerifierRef.current || kakaoRequest?.codeVerifier;

            if (!codeVerifier) {
              const savedVerifier = await AsyncStorage.getItem(`${provider}_verifier`);
              if (savedVerifier) {
                codeVerifier = savedVerifier;
                console.log(`[Auth] Recovered ${provider} verifier from AsyncStorage`);
              }
            }

            console.log(
              `[Auth] Final Check - Provider: ${provider}, Code: ${code.substring(0, 10)}..., Verifier: ${codeVerifier ? "FOUND" : "NOT FOUND"}`,
            );
            handleAuthComplete(provider, code, codeVerifier || undefined);
          } else {
            console.log("[Auth] No code found in deep link params. Params:", params);
            stopLoading();
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
  }, [googleRequest, kakaoRequest]);

  /**
   * @description Expo AuthSession 응답 처리
   */
  useEffect(() => {
    if (kakaoResponse?.type === "success") {
      const code = kakaoResponse.params.code;
      if (code) {
        console.log("[Auth] Kakao Auth Success, Code:", code.substring(0, 10) + "...");
        handleAuthComplete("kakao", code, kakaoRequest?.codeVerifier);
      } else {
        Alert.alert("인증 오류", "카카오로부터 인증 코드를 받지 못했습니다.");
      }
    } else if (kakaoResponse?.type === "error") {
      console.log("[Kakao Auth Error]", kakaoResponse.error);
      Alert.alert("로그인 실패", kakaoResponse.error?.message || "카카오 로그인에 실패했습니다.");
    }
  }, [kakaoResponse]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const code = googleResponse.params.code;
      if (code) {
        console.log("[Auth] Google Auth Success, Code:", code.substring(0, 10) + "...");
        handleAuthComplete("google", code, googleRequest?.codeVerifier);
      } else {
        Alert.alert("인증 오류", "Google로부터 인증 코드를 받지 못했습니다.");
      }
    } else if (googleResponse?.type === "error") {
      console.log("[Google Auth Error]", googleResponse.error);
      Alert.alert("로그인 실패", googleResponse.error?.message || "Google 로그인에 실패했습니다.");
    }
  }, [googleResponse]);

  const handleSocialLogin = async (platform: string) => {
    activePlatformRef.current = platform; // 현재 시도 중인 플랫폼 기억

    if (platform === "kakao") {
      // [Bulletproof] 브라우저 이동 전 암호키를 저장소에 확실히 박아넣음
      if (kakaoRequest?.codeVerifier) {
        await AsyncStorage.setItem("kakao_verifier", kakaoRequest.codeVerifier);
        kakaoVerifierRef.current = kakaoRequest.codeVerifier;
        console.log("[Auth] Kakao Verifier strictly saved before prompt.");
      }
      console.log("[Auth] Kakao Login Attempt:", { redirectUri });
      await promptKakaoAsync();
    } else if (platform === "google") {
      if (googleRequest?.codeVerifier) {
        await AsyncStorage.setItem("google_verifier", googleRequest.codeVerifier);
        googleVerifierRef.current = googleRequest.codeVerifier;
        console.log("[Auth] Google Verifier strictly saved before prompt.");
      }
      console.log("[Auth] Google Login Attempt:", { redirectUri });
      await promptGoogleAsync();
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      {/* 배경 장식 */}
      <View
        style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
      />
      <View
        style={{ backgroundColor: THEMES[appTheme].accent + "0D" }}
        className="absolute top-1/2 -left-32 w-64 h-64 rounded-full blur-3xl"
      />

      <View className="flex-1 px-8 justify-center">
        <View className="mb-8 pt-6 items-center">
          <View
            style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
            className="w-20 h-20 rounded-[30px] items-center justify-center border border-white/5 shadow-2xl mb-6"
          >
            <WaveLogo size={40} color={THEMES[appTheme].accent} />
          </View>
          <Text
            style={{ color: THEMES[appTheme].text }}
            className="text-3xl font-black leading-tight tracking-tighter text-center"
          >
            너울
          </Text>
        </View>

        <View className="mb-10 items-center">
          <Text
            style={{ color: THEMES[appTheme].text }}
            className="opacity-40 text-center text-xs leading-5 font-medium"
          >
            정제되지 않은 진심을 쏟아내는{"\n"}익명 성인 커뮤니티
          </Text>
        </View>

        {/* Social Buttons Section */}
        <View className="space-y-4 mb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin("kakao")}
            disabled={isLoggingIn}
            className="bg-[#FEE500] h-[56px] rounded-[24px] flex-row items-center justify-center shadow-lg mb-4"
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <Text className="text-[#191919] text-lg font-bold">카카오톡 로그인</Text>
            )}
          </TouchableOpacity>

          {/* 임시 UI 확인용 우회 버튼 (모든 환경 노출) */}
          {true && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleAuthComplete("test", "test_code")}
              disabled={isLoggingIn}
              style={{ borderColor: THEMES[appTheme].accent, borderStyle: "dashed" }}
              className="h-[52px] rounded-[24px] flex-row items-center justify-center border mb-6"
            >
              <Text style={{ color: THEMES[appTheme].accent }} className="text-base font-bold">
                [Dev] API 연결 테스트 (Bypass)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSocialLogin("google")}
            disabled={isLoggingIn}
            className="bg-white h-[56px] rounded-[24px] flex-row items-center justify-center shadow-lg mb-8"
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <Text className="text-[#191919] text-lg font-bold">Google 로그인</Text>
            )}
          </TouchableOpacity>

          {/* Auto Login Checkbox */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAutoLogin(!isAutoLogin)}
            className="flex-row items-center justify-center py-2"
          >
            <View className="mr-2">
              {isAutoLogin ? (
                <CheckSquare size={20} color={THEMES[appTheme].accent} />
              ) : (
                <Square size={20} color={THEMES[appTheme].text} opacity={0.3} />
              )}
            </View>
            <Text
              style={{ color: isAutoLogin ? THEMES[appTheme].accent : THEMES[appTheme].text + "4D" }}
              className="text-sm font-medium"
            >
              자동 로그인 유지하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Links */}
        <View className="flex-row items-center justify-center">
          <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-sm">
            계정이 없으신가요?
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "회원가입 안내",
                "위의 '카카오톡 로그인' 또는 'Google 로그인' 버튼을 눌러주세요. 등록되지 않은 계정이라면 간편 회원가입으로 자동 연결됩니다.",
              )
            }
            className="ml-2"
          >
            <Text
              style={{ color: THEMES[appTheme].accent, borderBottomColor: THEMES[appTheme].accent + "4D" }}
              className="text-sm font-bold border-b"
            >
              회원가입하고 시작하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
