import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import Waveform from "../components/Waveform";
import {
  Mic,
  Square,
  ArrowLeft,
  Menu,
  AlertTriangle,
  ShieldCheck,
  Send,
  ShieldAlert,
  Settings,
} from "lucide-react-native";
import { Modal } from "react-native";
import { api } from "../services/api";

/**
 * @description STT 입력 화면 (Midnight Calm 테마 적용)
 */
const STTScreen = ({ navigation }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("일상");
  const [showGuide, setShowGuide] = useState(true);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "undetermined">("undetermined");

  const CATEGORIES = ["고민", "일상", "위로", "감사", "질문"];

  const isAggressive = () => {
    const targets = ["너", "걔", "그 사람", "이 새끼", "저 사람", "당신"];
    return targets.some((target) => recognizedText.includes(target));
  };

  const [transcriptionTimer, setTranscriptionTimer] = useState<NodeJS.Timeout | null>(null);

  const toggleRecording = async () => {
    if (micPermission !== "granted") {
      Alert.alert("마이크 권한 필요", "음성 인식을 위해 마이크 권한이 필요합니다. 설정에서 권한을 허용해 주세요.", [
        { text: "취소", style: "cancel" },
        { text: "설정으로 이동", onPress: () => setMicPermission("granted") }, // 시뮬레이션: 승인 클릭 시 granted로 변경
      ]);
      if (micPermission === "undetermined") return;
    }

    if (isRecording) {
      setIsRecording(false);
      if (transcriptionTimer) clearInterval(transcriptionTimer);

      try {
        const result = await api.stt.recognize();
        const textResult =
          result.text ||
          recognizedText ||
          "오늘 하루는 정말 긴 파도 같았어요. 하지만 그 끝에는 고요함이 기다리고 있겠죠.";
        setRecognizedText(textResult);
        setIsReviewing(true);
      } catch (error) {
        console.error("STT Error:", error);
        if (!recognizedText) {
          setRecognizedText("오늘 하루는 정말 긴 파도 같았어요. 하지만 그 끝에는 고요함이 기다리고 있겠죠.");
        }
        setIsReviewing(true);
      }
    } else {
      setIsRecording(true);
      setIsReviewing(false);
      setRecognizedText("");
      // setShowGuide(false); // Removed as per instruction

      // 실시간 시각화 시뮬레이션
      const dummyTexts = [
        "지금",
        "지금 이",
        "지금 이 순간",
        "지금 이 순간의",
        "지금 이 순간의 파도가",
        "지금 이 순간의 파도가 정말",
        "고요하게",
        "고요하게 느껴지네요.",
        "마음이",
        "마음이 편안해집니다.",
      ];
      let index = 0;
      const timer = setInterval(() => {
        if (index < dummyTexts.length) {
          setRecognizedText((prev) => prev + (prev ? " " : "") + dummyTexts[index].split(" ").pop());
          // Or just update with partial matches
          setRecognizedText(dummyTexts[index]);
          index++;
        }
      }, 800);
      setTranscriptionTimer(timer);
    }
  };

  const handlePost = async () => {
    if (!recognizedText.trim() || isPosting) return;

    try {
      setIsPosting(true);
      await api.posts.create({
        content: recognizedText,
        // category: selectedCategory,
        userId: "test-user-id",
      });
      Alert.alert("성공", "이야기가 너울에 담겼습니다.");
      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "게시글 작성에 실패했습니다.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* Community Guidelines Modal */}
      <Modal visible={showGuide} transparent={true} animationType="fade" onRequestClose={() => setShowGuide(false)}>
        <View className="flex-1 bg-black/80 items-center justify-center p-8">
          <View className="bg-[#002845] p-10 rounded-[40px] border border-[#00E0D0]/20 w-full items-center">
            <View className="w-16 h-16 bg-[#00E0D0]/10 rounded-full items-center justify-center mb-6">
              <ShieldAlert size={32} color="#00E0D0" />
            </View>
            <Text className="text-[#E0E0E0] text-xl font-bold mb-4 text-center">커뮤니티 가이드라인</Text>
            <Text className="text-[#E0E0E0]/60 text-center leading-7 mb-8 text-sm">
              목소리로 담은 당신의 진심이{"\n"}상처가 되지 않도록 주의해 주세요.{"\n\n"}
              <Text className="text-[#00E0D0]">• 타인을 비방하거나 공격하는 언어 자제{"\n"}</Text>
              <Text className="text-[#00E0D0]">• 감정을 쏟아낸 후 내용을 가다듬어 보기</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowGuide(false)}
              className="bg-[#00E0D0] py-4 px-10 rounded-2xl w-full items-center"
            >
              <Text className="text-[#001220] font-bold">확인했습니다</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* I-Message Guide Modal removed as per user request for no filtering */}

      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color="#E0E0E0" />
        </TouchableOpacity>

        <Text className="text-[#E0E0E0] text-xl font-bold">{isReviewing ? "이야기 다듬기" : "목소리 담기"}</Text>

        <TouchableOpacity
          onPress={isReviewing ? handlePost : () => {}}
          disabled={(isReviewing && !recognizedText.trim()) || isPosting}
          className="w-10 h-10 items-center justify-center"
        >
          {isReviewing ? (
            isPosting ? (
              <ActivityIndicator color="#00E0D0" size="small" />
            ) : (
              <Send size={24} color="#00E0D0" />
            )
          ) : (
            <Menu size={28} color="#E0E0E0" />
          )}
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
              <Text className="text-2xl text-center leading-10 font-light px-4 text-[#E0E0E0]">
                {isRecording ? recognizedText || "말씀해 주세요..." : "오늘 당신의 감정은 어떤 이름을 가지고 있나요?"}
              </Text>

              {isRecording && (
                <View className="mt-8 flex-row items-center bg-[#00E0D0]/10 px-4 py-2 rounded-full">
                  <ActivityIndicator size="small" color="#00E0D0" />
                  <Text className="text-[#00E0D0] text-[10px] font-bold ml-2">목소리를 기록하고 있습니다...</Text>
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
                  isRecording
                    ? {}
                    : Platform.select({
                        ios: { shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20 },
                        android: { elevation: 12 },
                        web: { boxShadow: "0px 0px 20px rgba(0, 224, 208, 0.5)" },
                      })
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

            <TouchableOpacity onPress={() => setIsReviewing(false)} className="mt-8 self-center items-center">
              <Text className="text-[#00E0D0] text-sm font-bold border-b border-[#001220] mb-2">
                원하는 대로 내용을 직접 수정할 수 있습니다.
              </Text>
              <Text className="text-[#00E0D0] text-xs font-medium border-b border-[#00E0D0]">다시 녹음하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default STTScreen;
