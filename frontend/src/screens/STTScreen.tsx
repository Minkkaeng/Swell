import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from "react-native";
import Waveform from "../components/Waveform";
import { Mic, Square, ArrowLeft, Menu, AlertTriangle, ShieldCheck, Send } from "lucide-react-native";

/**
 * @description STT 입력 화면 (Midnight Calm 테마 적용)
 */
const STTScreen = ({ navigation }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("일상");
  const [showGuide, setShowGuide] = useState(false);

  const CATEGORIES = ["고민", "일상", "위로", "감사", "질문"];

  const isAggressive = () => {
    const targets = ["너", "걔", "그 사람", "이 새끼", "저 사람", "당신"];
    return targets.some((target) => recognizedText.includes(target));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // 시뮬레이션: 녹음 종료 후 텍스트화된 결과 표시
      const dummyResult =
        recognizedText || "오늘 하루는 정말 긴 파도 같았어요. 하지만 그 끝에는 고요함이 기다리고 있겠죠.";
      setRecognizedText(dummyResult);

      if (isAggressive()) {
        setShowGuide(true);
      } else {
        setIsReviewing(true);
      }
    } else {
      setIsRecording(true);
      setIsReviewing(false);
      setRecognizedText("");
      setShowGuide(false);
    }
  };

  const handlePost = () => {
    console.log("Posting from Voice:", { category: selectedCategory, content: recognizedText });
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* I-Message Guide Modal */}
      {showGuide && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#001220]/90 z-50 items-center justify-center p-8 blur-sm">
          <View className="bg-[#002845] p-10 rounded-[50px] border border-[#00E0D0]/20 w-full items-center shadow-2xl">
            <View className="w-20 h-20 bg-[#00E0D0]/10 rounded-full items-center justify-center mb-8">
              <Text className="text-[#00E0D0] text-4xl">🌊</Text>
            </View>
            <Text className="text-[#E0E0E0] text-2xl font-bold mb-6 text-center">파도를 고르게 다듬어볼까요?</Text>
            <Text className="text-[#E0E0E0]/60 text-center leading-8 mb-10 text-[16px]">
              "그 사람"에 대한 미움보다,{"\n"}
              그로 인해 느낀 <Text className="text-[#00E0D0] font-bold">"나"의 아픔</Text>과 감정에{"\n"}더 집중해
              보세요.{"\n"}당신의 마음이 가장 소중하니까요.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowGuide(false);
                setIsReviewing(true);
              }}
              className="bg-[#00E0D0] py-5 px-12 rounded-[24px] shadow-lg w-full items-center"
            >
              <Text className="text-[#001220] font-bold text-lg">나의 감정에 집중하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color="#E0E0E0" />
        </TouchableOpacity>

        <Text className="text-[#E0E0E0] text-xl font-bold">{isReviewing ? "이야기 다듬기" : "목소리 담기"}</Text>

        <TouchableOpacity
          onPress={isReviewing ? handlePost : () => {}}
          disabled={isReviewing && !recognizedText.trim()}
          className="w-10 h-10 items-center justify-center"
        >
          {isReviewing ? <Send size={24} color="#00E0D0" /> : <Menu size={28} color="#E0E0E0" />}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {!isReviewing ? (
          <View className="flex-1 justify-between py-12">
            {/* Recording State UI */}
            <View className="px-10 items-center">
              <View className="bg-[#002845]/30 px-6 py-2 rounded-full border border-white/5 mb-8">
                <Text className="text-[#00E0D0] text-xs font-bold tracking-[2px]">
                  {isRecording ? "RECORDING..." : "VOICE ARCHIVE"}
                </Text>
              </View>
              <Text
                className={`text-2xl text-center leading-10 font-light px-4 ${
                  isAggressive() ? "text-[#E7433C]" : "text-[#E0E0E0]"
                }`}
              >
                {isRecording ? recognizedText || "말씀해 주세요..." : "오늘 당신의 감정은 어떤 이름을 가지고 있나요?"}
              </Text>

              {isRecording && isAggressive() && (
                <View className="mt-8 flex-row items-center bg-[#E7433C]/10 px-4 py-2 rounded-full">
                  <AlertTriangle size={14} color="#E7433C" />
                  <Text className="text-[#E7433C] text-[10px] font-bold ml-2">
                    타인보다는 '나'의 감정에 집중해보세요
                  </Text>
                </View>
              )}
            </View>

            <View className="h-48 justify-center">
              <Waveform isRecording={isRecording} />
            </View>

            <View className="items-center pb-12">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleRecording}
                className={`w-24 h-24 rounded-[40px] items-center justify-center shadow-2xl ${
                  isRecording ? "bg-[#E7433C]" : "bg-[#00E0D0]"
                }`}
                style={
                  isRecording ? {} : { shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 }
                }
              >
                {isRecording ? <Square size={36} color="white" fill="white" /> : <Mic size={36} color="#001220" />}
              </TouchableOpacity>
              <Text className="text-[#E0E0E0]/40 mt-6 font-bold tracking-[1px] text-xs">
                {isRecording ? "TAP TO FINISH" : "TAP TO RECORD"}
              </Text>

              {!isRecording && (
                <View className="flex-row items-center mt-12 opacity-30">
                  <ShieldCheck size={12} color="#E0E0E0" />
                  <Text className="text-[#E0E0E0] text-[10px] ml-2 font-medium">
                    이 파도는 24시간 후 모래사장으로 흩어집니다 (자동 삭제)
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="px-8 pt-4 pb-20">
            {/* Review State UI (Same as WriteScreen) */}
            <View className="mb-8">
              <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-4 tracking-widest">CATEGORY</Text>
              <View className="flex-row flex-wrap">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full mr-3 mb-3 border ${
                      selectedCategory === cat ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${selectedCategory === cat ? "text-[#001220]" : "text-[#E0E0E0]/60"}`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="bg-[#002845]/20 rounded-[40px] p-8 border border-white/5 min-h-[300px]">
              <TextInput
                multiline
                placeholder="목소리가 텍스트로 변환되었습니다. 내용을 다듬어보세요."
                placeholderTextColor="#E0E0E020"
                className="text-[#E0E0E0] text-lg leading-8"
                value={recognizedText}
                onChangeText={setRecognizedText}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity onPress={() => setIsReviewing(false)} className="mt-8 self-center">
              <Text className="text-[#00E0D0] text-sm font-bold border-b border-[#00E0D0]">다시 녹음하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default STTScreen;
