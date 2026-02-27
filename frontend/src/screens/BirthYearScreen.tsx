import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { ArrowLeft, Calendar } from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";

/**
 * @description 생년월일 입력 화면
 */
const BirthYearScreen = ({ navigation }: any) => {
  const { appTheme, setBirthYear: saveBirthYear } = useUserStore();
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [gender, setGender] = useState("");

  const handleNext = () => {
    // Both are optional, so we can save them if entered, but proceed regardless
    if (birthYear && birthMonth) {
      saveBirthYear(birthYear);
    }
    navigation.navigate("Guide");
  };

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="px-8 py-10 flex-1">
          {/* Header */}
          <View className="flex-row items-center mb-12">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ backgroundColor: THEMES[appTheme].surface + "99", borderColor: THEMES[appTheme].text + "0D" }}
              className="w-12 h-12 rounded-2xl items-center justify-center border"
            >
              <ArrowLeft size={24} color={THEMES[appTheme].text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} className="ml-auto">
              <Text style={{ color: THEMES[appTheme].text }} className="opacity-40 font-bold">
                건너뛰기
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="mb-12">
            <Text style={{ color: THEMES[appTheme].text }} className="text-3xl font-bold leading-tight mb-4">
              당신을 더 잘{"\n"}이해하고 싶어요
            </Text>
            <Text style={{ color: THEMES[appTheme].text }} className="opacity-50 text-lg">
              연령과 성별에 맞는 공감 환경을{"\n"}추천해 드리기 위해 필요합니다. (선택)
            </Text>
          </View>

          {/* Input Section */}
          <View className="space-y-6">
            <View>
              <Text
                style={{ color: THEMES[appTheme].accent }}
                className="text-xs font-bold mb-3 ml-1 tracking-widest uppercase"
              >
                Birth Year
              </Text>
              <View className="flex-row space-x-4">
                <View
                  style={{
                    backgroundColor: THEMES[appTheme].surface + "66",
                    borderColor: THEMES[appTheme].text + "0D",
                  }}
                  className="flex-1 flex-row items-center h-[72px] rounded-[28px] px-6 border mr-4"
                >
                  <TextInput
                    placeholder="연도(예: 1995)"
                    placeholderTextColor={THEMES[appTheme].text + "33"}
                    className="flex-1 text-xl font-bold"
                    style={{ color: THEMES[appTheme].text }}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={birthYear}
                    onChangeText={setBirthYear}
                  />
                </View>
                <View
                  style={{
                    backgroundColor: THEMES[appTheme].surface + "66",
                    borderColor: THEMES[appTheme].text + "0D",
                  }}
                  className="flex-1 flex-row items-center h-[72px] rounded-[28px] px-6 border"
                >
                  <TextInput
                    placeholder="월(예: 5)"
                    placeholderTextColor={THEMES[appTheme].text + "33"}
                    className="flex-1 text-xl font-bold"
                    style={{ color: THEMES[appTheme].text }}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={birthMonth}
                    onChangeText={setBirthMonth}
                  />
                </View>
              </View>
            </View>

            <View className="mt-4">
              <Text
                style={{ color: THEMES[appTheme].accent }}
                className="text-xs font-bold mb-3 ml-1 tracking-widest uppercase"
              >
                Gender
              </Text>
              <View className="flex-row space-x-4">
                {["남성", "여성"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(gender === g ? "" : g)}
                    style={{
                      backgroundColor: gender === g ? THEMES[appTheme].accent : THEMES[appTheme].surface + "66",
                      borderColor: gender === g ? THEMES[appTheme].accent : THEMES[appTheme].text + "0D",
                    }}
                    className={`flex-1 h-[72px] rounded-[28px] items-center justify-center border ${g === "남성" ? "mr-4" : ""}`}
                  >
                    <Text
                      style={{ color: gender === g ? THEMES[appTheme].bg : THEMES[appTheme].text }}
                      className="font-bold text-xl"
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-auto">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={{ backgroundColor: THEMES[appTheme].accent }}
              className="h-[68px] rounded-[30px] items-center justify-center shadow-2xl"
            >
              <Text style={{ color: THEMES[appTheme].bg }} className="text-xl font-bold">
                확인
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BirthYearScreen;
