import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from "react-native";
import {
  ArrowLeft,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Smartphone,
  Shield,
} from "lucide-react-native";
import WaveLogo from "../components/WaveLogo";

/**
 * @description 회원가입 화면 (이름, 생년월일, 성별 등 정보 입력)
 */
const RegisterScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1); // 1: Terms, 2: Verification, 3: Name/Birth, 4: Gender
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    agreeTerms: false,
    agreePrivacy: false,
    carrier: "",
    verificationMethod: "", // "PASS" or "SMS"
    isVerified: false,
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
    if (step < 4) setStep(step + 1);
    else {
      navigation.navigate("Home");
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.agreeTerms && formData.agreePrivacy;
    if (step === 2) return formData.carrier !== "" && formData.verificationMethod !== "" && formData.isVerified;
    if (step === 3) return formData.name && isAdult(formData.birthDate);
    if (step === 4) return formData.gender !== "";
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-8 py-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-12">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
              <ArrowLeft size={28} color="#E0E0E0" />
            </TouchableOpacity>

            <Text className="text-[#E0E0E0]/40 text-sm font-bold">회원가입 {step}/4</Text>

            <TouchableOpacity className="w-10 h-10 items-center justify-center">
              <Menu size={28} color="#E0E0E0" />
            </TouchableOpacity>
          </View>

          {/* Branding */}
          <View className="items-center mb-12">
            <WaveLogo size={40} color="#00E0D0" />
            <Text className="text-[#E0E0E0] text-xl font-bold mt-4 tracking-widest">새로운 파도의 시작</Text>
          </View>

          {step === 1 ? (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">
                안전한 너울을 위한{"\n"}약관에 동의해 주세요.
              </Text>

              <View className="bg-[#E7433C]/10 self-start px-3 py-1.5 rounded-full flex-row items-center mb-6">
                <Shield size={12} color="#E7433C" />
                <Text className="text-[#E7433C] text-[10px] font-bold ml-1.5 tracking-tighter">19+ 성인인증 필수</Text>
              </View>

              <View className="bg-[#002845]/40 p-6 rounded-3xl border border-white/5 mb-8">
                <Text className="text-[#E0E0E0]/60 text-xs leading-5">
                  너울은 성인 전용 익명 커뮤니티입니다.{"\n"}본인인증을 통해 만 19세 이상임을 확인합니다.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setStep(2)}
                className="bg-[#002845] h-20 rounded-3xl flex-row items-center p-6 border border-[#00E0D0]/30 mb-8 shadow-2xl"
              >
                <View className="w-10 h-10 bg-[#00E0D0] rounded-xl items-center justify-center mr-4">
                  <Shield size={20} color="#001220" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#E0E0E0] font-bold text-base">PASS 본인인증으로 시작</Text>
                  <Text className="text-[#E0E0E0]/40 text-xs mt-1">성인인증 및 정보 자동 입력</Text>
                </View>
                <CheckCircle2 size={20} color="#00E0D0" opacity={0.5} />
              </TouchableOpacity>

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
                    className={`flex-row items-center p-6 rounded-2xl border ${
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
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation(); /* 약관 팝업 등 */
                      }}
                    >
                      <Text className="text-[#E0E0E0]/30 text-xs border-b border-white/10">보기</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : step === 2 ? (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">
                본인인증을 위해{"\n"}통신사를 선택해 주세요.
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {["SKT", "KT", "LG U+", "알뜰폰"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setFormData({ ...formData, carrier: c })}
                    className={`w-[48%] h-16 rounded-2xl items-center justify-center mb-4 border ${
                      formData.carrier === c ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                    }`}
                  >
                    <Text
                      className={`font-bold text-base ${formData.carrier === c ? "text-[#001220]" : "text-[#E0E0E0]"}`}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.carrier !== "" && (
                <View className="mt-4 space-y-4">
                  <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-2 ml-1">인증 방식 선택</Text>

                  {/* PASS Option */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setFormData({ ...formData, verificationMethod: "PASS", isVerified: true })}
                    className={`p-6 rounded-3xl flex-row items-center border ${
                      formData.verificationMethod === "PASS"
                        ? "bg-[#00E0D0]/10 border-[#00E0D0]"
                        : "bg-[#002845]/60 border-white/10"
                    }`}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${formData.verificationMethod === "PASS" ? "bg-[#00E0D0]" : "bg-white/5"}`}
                    >
                      <Shield size={24} color={formData.verificationMethod === "PASS" ? "#001220" : "#E0E0E0"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#E0E0E0] font-bold">PASS 앱으로 인증</Text>
                      <Text className="text-[#E0E0E0]/40 text-xs mt-1">간편하고 빠르게 앱에서 확인</Text>
                    </View>
                    {formData.verificationMethod === "PASS" && <CheckCircle2 size={24} color="#00E0D0" />}
                  </TouchableOpacity>

                  {/* SMS Option */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setFormData({ ...formData, verificationMethod: "SMS", isVerified: true })}
                    className={`p-6 rounded-3xl flex-row items-center border ${
                      formData.verificationMethod === "SMS"
                        ? "bg-[#00E0D0]/10 border-[#00E0D0]"
                        : "bg-[#002845]/60 border-white/10"
                    }`}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${formData.verificationMethod === "SMS" ? "bg-[#00E0D0]" : "bg-white/5"}`}
                    >
                      <Smartphone size={24} color={formData.verificationMethod === "SMS" ? "#001220" : "#E0E0E0"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#E0E0E0] font-bold">휴대폰 본인인증 (SMS)</Text>
                      <Text className="text-[#E0E0E0]/40 text-xs mt-1">문자로 발송된 인증번호 입력</Text>
                    </View>
                    {formData.verificationMethod === "SMS" && <CheckCircle2 size={24} color="#00E0D0" />}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : step === 3 ? (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">성함과 생년월일을{"\n"}입력해 주세요.</Text>

              <View className="space-y-6">
                <View>
                  <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-2 ml-1">NAME</Text>
                  <TextInput
                    placeholder="실명을 입력해 주세요"
                    placeholderTextColor="#E0E0E030"
                    className="bg-[#002845]/40 h-16 rounded-2xl px-6 text-[#E0E0E0] border border-white/5"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>

                <View>
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
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-[#E0E0E0] text-2xl font-bold mb-8">성별을{"\n"}선택해 주세요.</Text>
              <View className="flex-row space-x-4">
                {["남성", "여성"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 h-20 rounded-2xl items-center justify-center border ${
                      formData.gender === g ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                    }`}
                  >
                    <Text
                      className={`font-bold text-lg ${formData.gender === g ? "text-[#001220]" : "text-[#E0E0E0]"}`}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
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
            className={`h-18 rounded-[24px] items-center justify-center shadow-lg ${
              isStepValid() ? "bg-[#00E0D0]" : "bg-[#002845] opacity-50"
            }`}
          >
            <Text className="text-[#001220] text-lg font-bold">{step === 4 ? "가입 완료" : "다음으로"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
