import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Platform } from "react-native";
import {
  ArrowLeft,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Briefcase,
  Smartphone,
  Shield,
  Link,
} from "lucide-react-native";
import WaveLogo from "../components/WaveLogo";

/**
 * @description 회원가입 화면 (본인인증 제외, 소셜 계정 연동 중심)
 */
const RegisterScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1); // 1: Terms, 2: Social Link, 3: Basic Info
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    agreeTerms: false,
    agreePrivacy: false,
    socialPlatform: "", // "kakao" or "google"
    isSocialLinked: false,
  });
  const [showBirthMask, setShowBirthMask] = useState(false);

  // 만 19세 성인 판별 로직
  const isAdult = (birthday: string) => {
    if (birthday.length !== 8) return false;
    const year = parseInt(birthday.substring(0, 4));
    const month = parseInt(birthday.substring(4, 6)) - 1;
    const day = parseInt(birthday.substring(6, 8));
    const birthDateObj = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age >= 19;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // 가입 완료 시 홈 또는 로그인으로 이동
      navigation.navigate("Login");
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.agreeTerms && formData.agreePrivacy;
    if (step === 2) return formData.isSocialLinked;
    if (step === 3) return formData.name && isAdult(formData.birthDate) && formData.gender !== "";
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-8 py-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-12">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
              <ArrowLeft size={28} color="#E0E0E0" />
            </TouchableOpacity>

            <Text className="text-[#E0E0E0]/40 text-sm font-bold">회원가입 {step}/3</Text>

            <TouchableOpacity className="w-10 h-10 items-center justify-center">
              <Menu size={28} color="#E0E0E0" />
            </TouchableOpacity>
          </View>

          {/* Branding */}
          <View className="items-center mb-12">
            <View className="w-16 h-16 bg-[#00E0D0] rounded-2xl items-center justify-center">
              <WaveLogo size={32} color="#001220" />
            </View>
            <Text className="text-[#E0E0E0] text-xl font-bold mt-4 tracking-widest">새로운 파도의 시작</Text>
          </View>

          {step === 1 ? (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">너울의 물결에{"\n"}합류하기 위한 약관동의</Text>

              <View className="bg-[#002845]/40 p-6 rounded-3xl border border-white/5 mb-8">
                <Text className="text-[#E0E0E0]/60 text-xs leading-5">
                  너울은 성인 전용 익명 커뮤니티로, 쾌적한 환경 유지를 위해 기본 약관 및 커뮤니티 가이드라인 준수가
                  필수입니다.
                </Text>
              </View>

              <View className="space-y-4">
                {[
                  { key: "agreeTerms", label: "[필수] 이용약관 동의" },
                  { key: "agreePrivacy", label: "[필수] 개인정보 수집 및 이용 동의" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() =>
                      setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })
                    }
                    className={`flex-row items-center p-6 rounded-2xl border mb-4 ${
                      formData[item.key as keyof typeof formData]
                        ? "bg-[#00E0D0]/10 border-[#00E0D0]"
                        : "bg-[#002845]/40 border-white/5"
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center mr-4 ${
                        formData[item.key as keyof typeof formData] ? "bg-[#00E0D0]" : "border border-white/20"
                      }`}
                    >
                      {formData[item.key as keyof typeof formData] && <Check size={14} color="#001220" />}
                    </View>
                    <Text className="text-[#E0E0E0] flex-1">{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : step === 2 ? (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">연동할 소셜 계정을{"\n"}선택해 주세요.</Text>

              <View className="space-y-4">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setFormData({ ...formData, socialPlatform: "kakao", isSocialLinked: true })}
                  className={`flex-row items-center px-6 h-[60px] rounded-3xl border mb-4 ${
                    formData.socialPlatform === "kakao"
                      ? "bg-[#FEE500] border-[#FEE500]"
                      : "bg-[#002845]/60 border-white/10"
                  }`}
                >
                  <View className="w-10 h-10 bg-black/5 rounded-full items-center justify-center mr-4">
                    <Link size={20} color={formData.socialPlatform === "kakao" ? "#191919" : "#00E0D0"} />
                  </View>
                  <Text
                    className={`font-bold text-lg ${formData.socialPlatform === "kakao" ? "text-[#191919]" : "text-[#E0E0E0]"}`}
                  >
                    카카오계정 연동하기
                  </Text>
                  {formData.socialPlatform === "kakao" && (
                    <View className="ml-auto">
                      <CheckCircle2 size={24} color="#191919" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setFormData({ ...formData, socialPlatform: "google", isSocialLinked: true })}
                  className={`flex-row items-center px-6 h-[60px] rounded-3xl border ${
                    formData.socialPlatform === "google" ? "bg-white border-white" : "bg-[#002845]/60 border-white/10"
                  }`}
                >
                  <View className="w-10 h-10 bg-black/5 rounded-full items-center justify-center mr-4">
                    <Link size={20} color={formData.socialPlatform === "google" ? "#191919" : "#00E0D0"} />
                  </View>
                  <Text
                    className={`font-bold text-lg ${formData.socialPlatform === "google" ? "text-[#191919]" : "text-[#E0E0E0]"}`}
                  >
                    Google계정 연동하기
                  </Text>
                  {formData.socialPlatform === "google" && (
                    <View className="ml-auto">
                      <CheckCircle2 size={24} color="#191919" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-[#E0E0E0]/30 text-xs mt-8 px-2 leading-5">
                * 별도의 비밀번호 없이 소셜 계정으로 안전하게 로그인할 수 있습니다.
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">기본 정보를{"\n"}완성해 주세요.</Text>

              <View className="space-y-6">
                <View className="mb-6">
                  <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-2 ml-1">NICKNAME (실명 권장)</Text>
                  <TextInput
                    placeholder="이름 또는 닉네임"
                    placeholderTextColor="#E0E0E030"
                    className="bg-[#002845]/40 h-16 rounded-2xl px-6 text-[#E0E0E0] border border-white/5"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-2 ml-1">BIRTHDATE (8 DIGITS)</Text>
                  <View className="flex-row items-center bg-[#002845]/40 h-16 rounded-2xl px-6 border border-white/5">
                    <TextInput
                      placeholder="예: 19950123"
                      placeholderTextColor="#E0E0E030"
                      keyboardType="numeric"
                      secureTextEntry={showBirthMask}
                      className="flex-1 text-[#E0E0E0]"
                      value={formData.birthDate}
                      maxLength={8}
                      onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                    />
                    <TouchableOpacity onPress={() => setShowBirthMask(!showBirthMask)}>
                      {showBirthMask ? <EyeOff size={20} color="#E0E0E040" /> : <Eye size={20} color="#E0E0E040" />}
                    </TouchableOpacity>
                  </View>
                  {formData.birthDate.length === 8 && !isAdult(formData.birthDate) && (
                    <Text className="text-[#E7433C] text-xs mt-2 ml-1">만 19세 미만은 가입이 제한됩니다.</Text>
                  )}
                </View>

                <View>
                  <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-2 ml-1">GENDER</Text>
                  <View className="flex-row space-x-4">
                    {["남성", "여성"].map((g) => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setFormData({ ...formData, gender: g })}
                        className={`flex-1 h-16 rounded-2xl items-center justify-center border ${
                          formData.gender === g ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                        } ${g === "남성" ? "mr-4" : ""}`}
                      >
                        <Text
                          className={`font-bold text-base ${formData.gender === g ? "text-[#001220]" : "text-[#E0E0E0]"}`}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer Button */}
        <View className="px-8 pb-12 mt-auto">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
            disabled={!isStepValid()}
            className={`h-[60px] rounded-[24px] items-center justify-center shadow-lg ${
              isStepValid() ? "bg-[#00E0D0]" : "bg-[#002845] opacity-50"
            }`}
          >
            <Text className="text-[#001220] text-lg font-bold">{step === 3 ? "너울 시작하기" : "다음으로"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
