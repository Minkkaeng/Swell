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

      <View className="flex-1 px-8 justify-around py-20">
        {/* Branding */}
        <View className="items-center">
          <View
            className="w-24 h-24 bg-[#00E0D0] rounded-3xl items-center justify-center mb-8 shadow-2xl"
            style={{ transform: [{ rotate: "12deg" }] }}
          >
            <WaveLogo size={60} color="#001220" />
          </View>
          <Text className="text-[#E0E0E0] text-4xl font-bold tracking-[6px] mb-4">너울 (SWELL)</Text>
          <Text className="text-[#E0E0E0]/60 text-base text-center leading-7">
            정제되지 않은 진심을{"\n"}파도에 실어 보내는 고요한 시간
          </Text>
        </View>

        {/* Auth Section */}
        <View>
          <View className="bg-[#002845]/40 p-8 rounded-[40px] border border-white/5 mb-10">
            <View className="flex-row items-center mb-5">
              <View className="w-2 h-2 rounded-full bg-[#E7433C] mr-3" />
              <Text className="text-[#E0E0E0] font-bold text-lg">성인 전용 커뮤니티</Text>
            </View>
            <Text className="text-[#E0E0E0]/70 leading-7 text-[15px]">
              너울은 안전하고 진솔한 대화를 위해{"\n"}
              본인인증을 통한 성인 확인이 필수입니다.{"\n"}
              당신의 성숙한 파도를 환영합니다.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAdultAuth}
            className="bg-[#00E0D0] h-18 rounded-[24px] flex-row items-center justify-center shadow-lg self-center px-12"
          >
            <Text className="text-[#001220] text-lg font-bold mr-3">로그인</Text>
            <ArrowRight size={22} color="#001220" />
          </TouchableOpacity>

          <View className="mt-8 items-center">
            <View className="flex-row items-center mb-6">
              <Text className="text-[#E0E0E0]/40 text-sm mr-2">아직 회원이 아니신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-[#00E0D0] text-sm font-bold border-b border-[#00E0D0]">회원가입하기</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-[#E0E0E0]/30 text-center text-xs">탈퇴 후 90일 이내인 경우 재가입이 제한됩니다.</Text>
            <View className="h-[1px] w-12 bg-white/10 mt-4" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
