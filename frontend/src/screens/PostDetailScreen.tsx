import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Heart, MessageSquare, Send, MoreHorizontal } from "lucide-react-native";
import { api } from "../services/api";

/**
 * @description 게시글 상세조회 및 댓글 작성 화면
 */
const PostDetailScreen = ({ route, navigation }: any) => {
  const { post } = route.params;
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([
    { id: "c1", user: "익명1", content: "정말 공감되는 글이에요. 힘내세요!", time: "5분 전" },
    { id: "c2", user: "익명2", content: "저도 비슷한 경험이 있는데, 시간이 해결해주더라고요.", time: "2분 전" },
  ]);

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await api.comments.create(post.id, {
        content: comment,
        userId: "test-user-id",
      });

      const newComment = {
        id: result.id?.toString() || Date.now().toString(),
        user: "나",
        content: comment,
        time: "방금 전",
      };
      setComments([...comments, newComment]);
      setComment("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "댓글 작성에 실패했습니다.");
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
          <Text className="text-[#E0E0E0] text-lg font-bold">파도 엿보기</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <MoreHorizontal size={24} color="#E0E0E0" opacity={0.5} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View className="bg-[#002845]/40 p-8 rounded-[40px] border border-white/5 mb-10">
            <Text className="text-[#E0E0E0] text-xl leading-9 font-light mb-8">{post.content}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-[#E0E0E0]/30 text-xs font-medium">{post.time}</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full mr-3">
                  <Heart size={16} color="#00E0D0" fill={post.likes > 20 ? "#00E0D0" : "transparent"} />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{post.likes}</Text>
                </View>
                <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full">
                  <MessageSquare size={16} color="#E0E0E0" />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{comments.length}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View className="mb-20">
            <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-6 tracking-widest pl-2">COMMENTS</Text>
            {comments.map((item) => (
              <View key={item.id} className="mb-6 bg-[#002845]/20 p-6 rounded-[30px] border border-white/5">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[#00E0D0] text-xs font-bold">{item.user}</Text>
                  <Text className="text-[#E0E0E0]/20 text-[10px]">{item.time}</Text>
                </View>
                <Text className="text-[#E0E0E0]/70 text-[15px] leading-6">{item.content}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View className="px-6 py-6 pb-10 bg-[#001220] border-t border-white/5">
          <View className="flex-row items-center bg-[#002845]/40 rounded-2xl px-6 py-4 border border-white/10">
            <TextInput
              placeholder="따뜻한 위로의 한마디를 남겨주세요"
              placeholderTextColor="#E0E0E020"
              className="flex-1 text-[#E0E0E0] mr-4"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!comment.trim() || isSubmitting}
              className={`${!comment.trim() || isSubmitting ? "opacity-20" : ""}`}
            >
              {isSubmitting ? <ActivityIndicator color="#00E0D0" size="small" /> : <Send size={20} color="#00E0D0" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;
