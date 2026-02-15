import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Send, AlertTriangle, UserX, Bug, MessageCircle } from "lucide-react-native";
import { api } from "../services/api";

/**
 * @description 고객센터 및 문의/신고 화면
 */
const SupportScreen = ({ navigation }: any) => {
  const [type, setType] = useState<"bug" | "report" | "general">("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 모두 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      // api.ts에 추가할 로직 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("접수 완료", "소중한 의견이 전달되었습니다. 빠른 시일 내에 검토하겠습니다.", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("오류", "전송에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {/* Header */}
        <View className="px-8 py-8 flex-row justify-between items-center border-b border-white/5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={28} color="#E0E0E0" />
          </TouchableOpacity>
          <Text className="text-[#E0E0E0] text-lg font-bold">고객센터</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
          {/* Inquiry Type Selection */}
          <View className="mb-10">
            <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-6 tracking-widest px-2">INQUIRY TYPE</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setType("general")}
                className={`flex-1 p-5 rounded-[25px] border items-center justify-center ${
                  type === "general" ? "bg-[#00E0D0]/10 border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                }`}
              >
                <MessageCircle
                  size={20}
                  color={type === "general" ? "#00E0D0" : "#E0E0E0"}
                  opacity={type === "general" ? 1 : 0.4}
                />
                <Text
                  className={`mt-2 text-xs font-bold ${type === "general" ? "text-[#00E0D0]" : "text-[#E0E0E0]/40"}`}
                >
                  일반 문의
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("bug")}
                className={`flex-1 p-5 rounded-[25px] border items-center justify-center ${
                  type === "bug" ? "bg-[#00E0D0]/10 border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                }`}
              >
                <Bug size={20} color={type === "bug" ? "#00E0D0" : "#E0E0E0"} opacity={type === "bug" ? 1 : 0.4} />
                <Text className={`mt-2 text-xs font-bold ${type === "bug" ? "text-[#00E0D0]" : "text-[#E0E0E0]/40"}`}>
                  오류 제보
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("report")}
                className={`flex-1 p-5 rounded-[25px] border items-center justify-center ${
                  type === "report" ? "bg-[#E7433C]/10 border-[#E7433C]" : "bg-[#002845]/40 border-white/5"
                }`}
              >
                <UserX
                  size={20}
                  color={type === "report" ? "#E7433C" : "#E0E0E0"}
                  opacity={type === "report" ? 1 : 0.4}
                />
                <Text
                  className={`mt-2 text-xs font-bold ${type === "report" ? "text-[#E7433C]" : "text-[#E0E0E0]/40"}`}
                >
                  사용자 신고
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-4 tracking-widest px-2">TITLE</Text>
              <View className="bg-[#002845]/40 rounded-[25px] border border-white/5 px-6 py-5">
                <TextInput
                  placeholder="제목을 입력해 주세요"
                  placeholderTextColor="#E0E0E020"
                  className="text-[#E0E0E0] text-[16px]"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View>
              <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-4 tracking-widest px-2">DESCRIPTION</Text>
              <View className="bg-[#002845]/40 rounded-[35px] border border-white/5 px-6 py-6 min-h-[200px]">
                <TextInput
                  multiline
                  placeholder={
                    type === "general"
                      ? "서비스 이용 관련 궁금한 점을 자유롭게 남겨주세요."
                      : type === "bug"
                        ? "오류가 발생한 상황을 자세히 적어주시면 큰 도움이 됩니다."
                        : "신고하실 사용자의 닉네임과 구체적인 사유를 적어주세요."
                  }
                  placeholderTextColor="#E0E0E020"
                  className="text-[#E0E0E0] text-[16px] leading-7"
                  textAlignVertical="top"
                  value={content}
                  onChangeText={setContent}
                />
              </View>
            </View>
          </View>

          {/* Guidelines */}
          <View className="mt-8 mb-10 bg-[#002845]/20 p-6 rounded-[30px] border border-white/5 flex-row items-start">
            <AlertTriangle size={18} color="#FFB800" style={{ marginTop: 2 }} />
            <Text className="text-[#E0E0E0]/40 text-xs leading-5 ml-3 flex-1">
              허위 신고나 욕설이 포함된 문의는 처리가 제한될 수 있습니다. 쾌적한 너울을 위해 협조해 주세요.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-6 rounded-[30px] items-center justify-center mb-20 ${
              isSubmitting ? "bg-white/10" : "bg-[#00E0D0]"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#001220" />
            ) : (
              <View className="flex-row items-center">
                <Send size={20} color="#001220" />
                <Text className="text-[#001220] font-bold text-lg ml-2">문의하기</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SupportScreen;
