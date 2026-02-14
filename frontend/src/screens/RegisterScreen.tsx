import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from "react-native";
import { ArrowLeft, CheckCircle2, Menu } from "lucide-react-native";
import WaveLogo from "../components/WaveLogo";

/**
 * @description 회원가입 화면 (이름, 생년월일, 성별 등 정보 입력)
 */
const RegisterScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else {
      // 가입 완료 후 홈으로 이동 (데모용)
      navigation.navigate("Home");
    }
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

            <Text className="text-[#E0E0E0]/40 text-sm font-bold">회원가입 {step}/2</Text>

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
                  <TextInput
                    placeholder="예: 19950123"
                    placeholderTextColor="#E0E0E030"
                    keyboardType="numeric"
                    className="bg-[#002845]/40 h-16 rounded-2xl px-6 text-[#E0E0E0] border border-white/5"
                    value={formData.birthDate}
                    onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                  />
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
            disabled={step === 1 ? !formData.name || formData.birthDate.length < 8 : !formData.gender}
            className={`h-18 rounded-[24px] items-center justify-center shadow-lg ${
              (step === 1 ? formData.name && formData.birthDate.length === 8 : formData.gender)
                ? "bg-[#00E0D0]"
                : "bg-[#002845] opacity-50"
            }`}
          >
            <Text className="text-[#001220] text-lg font-bold">{step === 2 ? "가입 완료" : "다음으로"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
