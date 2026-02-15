import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Send, Hash } from "lucide-react-native";
import { api } from "../services/api";

const CATEGORIES = ["고민", "일상", "위로", "감사", "질문"];

/**
 * @description 텍스트 게시글 작성 화면
 */
const WriteScreen = ({ navigation }: any) => {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("일상");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      setIsPosting(true);
      await api.posts.create({
        content,
        // category: selectedCategory, // API 스펙에 있다면 추가
        userId: "test-user-id", // 임시 유저 ID
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {/* Header */}
        <View className="px-8 py-8 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={28} color="#E0E0E0" />
          </TouchableOpacity>

          <Text className="text-[#E0E0E0] text-xl font-bold">이야기 담기</Text>

          <TouchableOpacity
            onPress={handlePost}
            disabled={!content.trim() || isPosting}
            className={`w-10 h-10 items-center justify-center ${!content.trim() || isPosting ? "opacity-30" : ""}`}
          >
            {isPosting ? <ActivityIndicator color="#00E0D0" size="small" /> : <Send size={24} color="#00E0D0" />}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
          {/* Category Selector */}
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

          {/* Text Input Area */}
          <View className="bg-[#002845]/20 rounded-[40px] p-8 border border-white/5 min-h-[300px]">
            <TextInput
              multiline
              placeholder="지금 당신의 마음속에 어떤 파도가 일고 있나요?"
              placeholderTextColor="#E0E0E020"
              className="text-[#E0E0E0] text-lg leading-8"
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {/* Tips/Notice */}
          <View className="mt-8 flex-row items-start px-4 opacity-40">
            <Hash size={14} color="#E0E0E0" style={{ marginTop: 4 }} />
            <Text className="text-[#E0E0E0] text-xs leading-5 ml-2 flex-1">
              익명으로 작성되며, 정성껏 작성된 파도는 누군가에게 따뜻한 위로가 됩니다. 부적절한 언어 사용 시 서비스
              이용이 제한될 수 있습니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WriteScreen;
