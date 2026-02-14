import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import Waveform from "../components/Waveform";
import { Mic, Square, ArrowLeft, Menu } from "lucide-react-native";

/**
 * @description STT 입력 화면 (Midnight Calm 테마 적용)
 */
const STTScreen = ({ navigation }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      // 녹음 중지 시 텍스트 검사 시뮬레이션 (타인 비난 패턴 감지)
      if (recognizedText.includes("너") || recognizedText.includes("걔") || recognizedText.includes("그 사람")) {
        setShowGuide(true);
      }
      setIsRecording(false);
      setRecognizedText("방금 하신 말씀이 너울에 담겼습니다.");
    } else {
      setIsRecording(true);
      setRecognizedText("오늘 '나'의 하루는 어땠나요? (상대방 비난보다는 나의 감정에 집중해보세요)");
      setShowGuide(false);
    }
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
              onPress={() => setShowGuide(false)}
              className="bg-[#00E0D0] py-5 px-12 rounded-[24px] shadow-lg w-full items-center"
            >
              <Text className="text-[#001220] font-bold text-lg">나의 감정에 집중하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View className="px-8 py-10 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color="#E0E0E0" />
        </TouchableOpacity>

        <Text className="text-[#E0E0E0] text-2xl font-bold tracking-[4px]">SWELL</Text>

        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Menu size={28} color="#E0E0E0" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 justify-between py-12">
        {/* Text Area */}
        <View className="px-10 items-center">
          <View className="bg-[#002845]/30 px-6 py-2 rounded-full border border-white/5 mb-8">
            <Text className="text-[#00E0D0] text-xs font-bold tracking-[2px]">
              {isRecording ? "RECORDING..." : "VOICE ARCHIVE"}
            </Text>
          </View>
          <Text className="text-[#E0E0E0] text-2xl text-center leading-10 font-light px-4">
            {recognizedText || "오늘 당신의 감정은 어떤 이름을 가지고 있나요?"}
          </Text>
        </View>

        {/* Waveform Visualization */}
        <View className="h-48 justify-center">
          <Waveform isRecording={isRecording} />
        </View>

        {/* Action Button */}
        <View className="items-center pb-12">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleRecording}
            className={`w-24 h-24 rounded-[40px] items-center justify-center shadow-2xl ${
              isRecording ? "bg-[#E7433C]" : "bg-[#00E0D0]"
            }`}
            style={isRecording ? {} : { shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 }}
          >
            {isRecording ? <Square size={36} color="white" fill="white" /> : <Mic size={36} color="#001220" />}
          </TouchableOpacity>
          <Text className="text-[#E0E0E0]/40 mt-6 font-bold tracking-[1px] text-xs">
            {isRecording ? "TAP TO FINISH" : "TAP TO RECORD"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default STTScreen;
