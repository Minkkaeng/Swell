import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { ShieldCheck, AlertCircle, Briefcase, X } from "lucide-react-native";
import WaveLogo from "../components/WaveLogo";

const { width, height } = Dimensions.get("window");

/**
 * @description 브랜드 테마가 적용된 선택 모달 컴포넌트
 */
const SelectionModal = ({ visible, title, data, selectedValue, onSelect, onClose }: any) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-[#1A1A1A] rounded-t-[40px] p-8" style={{ height: height * 0.6 }}>
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-white text-xl font-bold">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
            >
              <X size={20} color="#E0E0E0" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                className={`py-5 mb-3 rounded-2xl items-center border ${
                  selectedValue === item ? "bg-[#00E0D0]/10 border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                }`}
              >
                <Text
                  className={`text-lg ${selectedValue === item ? "text-[#00E0D0] font-bold" : "text-[#E0E0E0]/60"}`}
                >
                  {item}
                  {title.includes("연도") ? "년" : "월"}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </View>
    </Modal>
  );
};

type LoginStep = "INITIAL" | "AGE_SELECTION";

/**
 * @description 온보딩 및 연령 확인 로직을 포함한 로그인 화면
 */
const LoginScreen = ({ navigation }: any) => {
  const [loginStep, setLoginStep] = useState<LoginStep>("INITIAL");
  const [birthYear, setBirthYear] = useState<string>("2000");
  const [birthMonth, setBirthMonth] = useState<string>("1");
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showAdultModal, setShowAdultModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [canConfirmAdult, setCanConfirmAdult] = useState(false);

  // 애니메이션 수치
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showAdultModal) {
      // 모달 페이드 인
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 3초 후 확인 버튼 노출
      const timer = setTimeout(() => {
        setCanConfirmAdult(true);
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      buttonFadeAnim.setValue(0);
      setCanConfirmAdult(false);
    }
  }, [showAdultModal]);

  /**
   * @description 소셜 로그인 버튼 클릭 시 실행
   */
  const handleSocialLogin = (platform: string) => {
    console.log(`${platform} login attempted`);
    // 소셜 로그인 후 연령 단계로 진입
    setLoginStep("AGE_SELECTION");
  };

  /**
   * @description 연령 검증 로직
   */
  const handleVerifyAge = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);

    // 한국 나이 기준 만 19세 이상 체크 (생년 기준)
    // 간단한 로직: 현재 연도 - 태어난 연도 > 19 이거나, 19이면서 달이 지난 경우
    let age = currentYear - year;
    if (currentMonth < month) {
      age--;
    }

    if (age < 19) {
      setShowWarningModal(true);
    } else {
      setShowAdultModal(true);
    }
  };

  /**
   * @description 미성년자 경고 모달 닫기 (메인 초기화)
   */
  const handleCloseWarning = () => {
    setShowWarningModal(false);
    setLoginStep("INITIAL");
  };

  /**
   * @description 성인 인증 최종 확인 (메인 전환)
   */
  const handleConfirmAdult = () => {
    if (canConfirmAdult) {
      setShowAdultModal(false);
      navigation.replace("Home"); // 홈 화면으로 이동
    }
  };

  // 연도 목록 생성 (1950 ~ 현재)
  const years = Array.from({ length: 76 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* 배경 장식 */}
      <View className="absolute -top-20 -right-20 w-80 h-80 bg-[#00E0D0]/10 rounded-full blur-3xl" />
      <View className="absolute top-1/2 -left-32 w-64 h-64 bg-[#00E0D0]/5 rounded-full blur-3xl" />

      <View className="flex-1 px-8 justify-center">
        {loginStep === "INITIAL" ? (
          <>
            <View className="mb-10 pt-10">
              <View className="w-20 h-20 bg-[#00E0D0] rounded-[28px] items-center justify-center shadow-lg">
                <WaveLogo size={42} color="#001220" />
              </View>
            </View>

            <View className="mb-12">
              <Text className="text-white text-[38px] font-bold leading-tight mb-4">어른들의{"\n"}고요한 파도</Text>
              <Text className="text-[#E0E0E0]/50 text-lg leading-7">
                정제되지 않은 진심을 쏟아내는{"\n"}익명 성인 커뮤니티 너울입니다.
              </Text>
            </View>

            {/* Social Buttons */}
            <View className="space-y-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialLogin("kakao")}
                className="bg-[#FEE500] h-[60px] rounded-2xl flex-row items-center justify-center shadow-md mb-4"
              >
                <View className="w-6 h-6 items-center justify-center mr-2">
                  {/* <Text className="font-bold text-[#191919]">K</Text> */}
                </View>
                <Text className="text-[#191919] text-lg font-bold">카카오톡 로그인</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialLogin("google")}
                className="bg-white h-[60px] rounded-2xl flex-row items-center justify-center shadow-md"
              >
                <View className="w-6 h-6 items-center justify-center mr-2">
                  {/* <Text className="font-bold text-[#191919]">G</Text> */}
                </View>
                <Text className="text-[#191919] text-lg font-bold">Google 로그인</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Link */}
            <View className="mt-12 flex-row items-center justify-center">
              <Text className="text-[#E0E0E0]/30 text-sm">처음이신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")} className="ml-2">
                <Text className="text-[#00E0D0] text-sm font-bold border-b border-[#00E0D0]/30">
                  회원가입하고 시작하기
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View>
            <TouchableOpacity onPress={() => setLoginStep("INITIAL")} className="mb-8">
              <Text className="text-[#00E0D0] text-base">← 이전으로</Text>
            </TouchableOpacity>

            <Text className="text-white text-3xl font-bold mb-2">안녕하세요!</Text>
            <Text className="text-[#E0E0E0]/60 text-lg mb-10">본인 확인을 위해 생년월일을 선택해 주세요.</Text>

            <View className="flex-row space-x-4 mb-12">
              <View className="flex-1">
                <Text className="text-[#E0E0E0]/40 mb-2 ml-1">태어난 연도</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowYearPicker(true)}
                  className="bg-[#002845] rounded-2xl p-5 border border-white/5 active:border-[#00E0D0]/50"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-xl font-medium">{birthYear}년</Text>
                    <Text className="text-[#00E0D0] text-sm opacity-50">변경</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="w-32">
                <Text className="text-[#E0E0E0]/40 mb-2 ml-1">월</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowMonthPicker(true)}
                  className="bg-[#002845] rounded-2xl p-5 border border-white/5 active:border-[#00E0D0]/50"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-xl font-medium">{birthMonth}월</Text>
                    <Text className="text-[#00E0D0] text-sm opacity-50">변경</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleVerifyAge}
              className="bg-[#00E0D0] h-[60px] rounded-2xl items-center justify-center shadow-lg"
            >
              <Text className="text-[#001220] text-lg font-bold">인증 완료</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 연도 선택 모달 */}
      <SelectionModal
        visible={showYearPicker}
        title="태어난 연도 선택"
        data={years}
        selectedValue={birthYear}
        onSelect={(val: string) => {
          setBirthYear(val);
          setShowYearPicker(false);
        }}
        onClose={() => setShowYearPicker(false)}
      />

      {/* 월 선택 모달 */}
      <SelectionModal
        visible={showMonthPicker}
        title="태어난 월 선택"
        data={months}
        selectedValue={birthMonth}
        onSelect={(val: string) => {
          setBirthMonth(val);
          setShowMonthPicker(false);
        }}
        onClose={() => setShowMonthPicker(false)}
      />

      {/* 성인 강조 모달 */}
      <Modal transparent visible={showAdultModal} animationType="none">
        <View className="flex-1 justify-center items-center bg-[#001220]/95 px-6">
          <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
            <View className="w-24 h-24 bg-[#00E0D0]/20 rounded-full items-center justify-center mb-6">
              <Briefcase size={48} color="#00E0D0" />
            </View>

            <Text className="text-[#00E0D0] text-xl font-bold mb-4">본인 인증 완료</Text>
            <Text className="text-white text-2xl font-bold text-center mb-4 leading-relaxed">
              너울은 성인 및 직장인을 위한{"\n"}프라이빗 커뮤니티입니다.
            </Text>
            <Text className="text-[#E0E0E0]/50 text-center mb-12 px-6">
              정중하고 따뜻한 대화를 통해{"\n"}고요한 파도 같은 휴식을 즐겨보세요.
            </Text>

            {!canConfirmAdult ? (
              <View className="h-16 items-center justify-center">
                <Text className="text-[#00E0D0]/40">안전한 서비스 환경을 구축 중입니다...</Text>
              </View>
            ) : (
              <Animated.View style={{ opacity: buttonFadeAnim, width: "100%" }}>
                <TouchableOpacity
                  onPress={handleConfirmAdult}
                  className="bg-[#00E0D0] h-[60px] rounded-2xl items-center justify-center shadow-lg"
                >
                  <Text className="text-[#001220] text-lg font-bold">확인 및 입장하기</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* 미성년자 경고 모달 */}
      <Modal transparent visible={showWarningModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-10">
          <View className="bg-[#1A1A1A] w-full p-8 rounded-[32px] border border-white/10 items-center">
            <AlertCircle size={60} color="#E7433C" className="mb-6" />
            <Text className="text-white text-xl font-bold mb-3 text-center">접근 제한 안내</Text>
            <Text className="text-[#E0E0E0]/60 text-center mb-8 leading-relaxed">
              죄송합니다. 너울은 만 19세 이상의{"\n"}
              성인만 이용 가능한 서비스입니다.{"\n"}
              성인 인증 시점에 다시 방문해 주세요.
            </Text>
            <TouchableOpacity
              onPress={handleCloseWarning}
              className="bg-[#E7433C] w-full h-14 rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">초기화면으로</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;
