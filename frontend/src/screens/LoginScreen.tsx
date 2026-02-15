import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import WaveLogo from "../components/WaveLogo";

/**
 * @description 성인 인증 및 로그인 진입 화면
 */
const LoginScreen = ({ navigation }: any) => {
  const handleAdultAuth = () => {
    // 실제 PASS 인증 로직 연동 지점
    console.log("PASS adult authentication started");
    // 성공 시 홈 화면으로 이동
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* Decorative Background Elements */}
      <View className="absolute -top-20 -right-20 w-80 h-80 bg-[#00E0D0]/10 rounded-full blur-3xl" />
      <View className="absolute top-1/2 -left-32 w-64 h-64 bg-[#00E0D0]/5 rounded-full blur-3xl" />

      <View className="flex-1 px-8 justify-center">
        {/* Logo */}
        <View className="mb-10 pt-10">
          <View className="w-20 h-20 bg-[#00E0D0] rounded-[28px] items-center justify-center shadow-lg">
            <WaveLogo size={42} color="#001220" />
          </View>
        </View>

        {/* Hero Text */}
        <View className="mb-12">
          <Text className="text-white text-[38px] font-bold leading-tight mb-4">어른들의{"\n"}고요한 파도</Text>
          <Text className="text-[#E0E0E0]/50 text-lg leading-7">
            정제되지 않은 진심을 쏟아내는{"\n"}익명 성인 커뮤니티 너울입니다.
          </Text>
        </View>

        {/* Info Box */}
        <View className="bg-[#002845]/40 p-8 rounded-[32px] border border-white/5 mb-14">
          <View className="flex-row items-center mb-4">
            <View className="w-1.5 h-1.5 rounded-full bg-[#E7433C] mr-2.5" />
            <Text className="text-[#E0E0E0] font-bold text-base">성인 전용 안내</Text>
          </View>
          <Text className="text-[#E0E0E0]/60 leading-6 text-[14px]">
            너울은 안전한 대화를 위해 본인인증을 통한 성인 확인이 필수입니다. 탈퇴 후 90일 이내인 경우 재가입이
            제한됩니다.
          </Text>
        </View>

        {/* Social Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Home")}
            className="bg-[#FEE500] h-16 rounded-2xl flex-row items-center justify-center shadow-lg"
          >
            <Text className="text-[#191919] text-lg font-bold">카카오로 계속하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Home")}
            className="bg-white h-16 rounded-2xl flex-row items-center justify-center shadow-lg"
          >
            <Text className="text-[#191919] text-lg font-bold">Google로 계속하기</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          className="mt-12 flex-row items-center justify-center"
        >
          <Text className="text-[#00E0D0] text-sm font-bold">아직 회원이 아니신가요? </Text>
          <Text className="text-[#00E0D0] text-sm font-bold border-b border-[#00E0D0]">회원가입하기</Text>
          <Text className="text-[#00E0D0] text-sm font-bold ml-1"> {">"} </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
