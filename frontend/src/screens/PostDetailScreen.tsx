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
  Share,
} from "react-native";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Send,
  MoreHorizontal,
  X,
  AlertCircle,
  Share2,
  Ban,
} from "lucide-react-native";
import { api } from "../services/api";

export interface Comment {
  id: string;
  userId: string;
  user: string;
  content: string;
  time: string;
  parentId: string | null;
  isMine: boolean;
}

const CURRENT_USER = "푸른파도";

/**
 * @description 게시글 상세조회 및 댓글 작성 화면
 */
const PostDetailScreen = ({ route, navigation }: any) => {
  const { post } = route.params;
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null); // 대댓글 대상 저장
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      userId: "user_static_1",
      user: "고독한파도",
      content: "정말 공감되는 글이에요. 힘내세요!",
      time: "5분 전",
      parentId: null,
      isMine: false,
    },
    {
      id: "c2",
      userId: "user_static_2",
      user: "바다의꿈",
      content: "저도 비슷한 경험이 있는데, 시간이 해결해주더라고요.",
      time: "2분 전",
      parentId: null,
      isMine: false,
    },
    {
      id: "c3",
      userId: "user_static_3",
      user: "잔잔한울림",
      content: "어떤 경험인지 여쭤봐도 될까요?",
      time: "1분 전",
      parentId: "c2",
      isMine: false,
    },
  ]);

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    const tempId = Date.now().toString();
    const newComment: Comment = {
      id: tempId,
      userId: "test-user-id",
      user: CURRENT_USER,
      content: comment,
      time: "방금 전",
      parentId: replyTo ? replyTo.id : null,
      isMine: true,
    };

    // 1. 먼저 UI에 즉시 반영 (낙관적 업데이트)
    setComments([...comments, newComment]);
    const currentComment = comment; // 백업
    setComment("");
    const currentReplyTo = replyTo; // 백업
    setReplyTo(null);

    try {
      setIsSubmitting(true);
      // 서버 전송 시도
      await api.comments.create(post.id, {
        content: currentComment,
        userId: "test-user-id",
        parentId: currentReplyTo ? currentReplyTo.id : undefined,
      });
      console.log("댓글 서버 저장 완료");
    } catch (error) {
      console.error("서버 저장 실패 (오프라인 모드 작동):", error);
      // 서버 저장에 실패해도 이미 UI에는 추가되어 있으므로 사용자 경험을 유지합니다.
      // 실제 서비스라면 여기서 에러 메시지를 보여주거나 재시도 버튼을 띄울 수 있습니다.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = (type: "post" | "comment", id: string) => {
    Alert.alert("신고하기", `이 ${type === "post" ? "게시글" : "댓글"}을 신고하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "신고",
        style: "destructive",
        onPress: () => {
          Alert.alert("알림", "신고가 접수되었습니다. 운영진이 검토하겠습니다.");
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[너울] 익명으로 전하는 따뜻한 파도 🌊\n\n"${post.content}"\n\n지금 너울에서 더 많은 이야기를 만나보세요.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlockUser = (userId: string) => {
    Alert.alert("사용자 차단", "해당 사용자의 모든 글과 댓글을 숨기시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => {
          Alert.alert("알림", "차단이 완료되었습니다. (데모에서는 현재 화면에서만 유효합니다)");
          // 실제로는 전역 상태나 서버에 저장
        },
      },
    ]);
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
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleShare} className="w-10 h-10 items-center justify-center">
              <Share2 size={24} color="#00E0D0" opacity={0.8} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View className="bg-[#002845]/40 p-8 rounded-[40px] border border-white/5 mb-10">
            <View className="mb-4">
              <Text className="text-[#00E0D0] text-sm font-bold opacity-60">익명의 너울</Text>
            </View>
            <Text className="text-[#E0E0E0] text-lg leading-8 font-light mb-8">{post.content}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-[#E0E0E0]/30 text-xs font-medium">{post.time}</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full mr-3">
                  <Heart size={16} color="#00E0D0" fill={post.likes > 20 ? "#00E0D0" : "transparent"} />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{post.likes}</Text>
                </View>
                <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full mr-3">
                  <MessageSquare size={16} color="#E0E0E0" />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{comments.length}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleReport("post", post.id)}
                  className="bg-[#E7433C]/10 px-3 py-2 rounded-full"
                >
                  <Text className="text-[#E7433C] text-[10px] font-bold">신고</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View className="mb-20">
            <Text className="text-[#E0E0E0]/40 text-xs font-bold mb-6 tracking-widest pl-2">COMMENTS</Text>
            {comments
              .filter((c: Comment) => !c.parentId) // 1단계 댓글 먼저 렌더링
              .map((item: Comment) => (
                <View key={item.id} className="mb-4">
                  {/* 메인 댓글 */}
                  <View className="bg-[#002845]/20 p-6 rounded-[30px] border border-white/5">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className={`text-xs font-bold ${item.isMine ? "text-[#FFD700]" : "text-[#00E0D0]"}`}>
                        {item.user} {item.isMine && "(나)"}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-[#E0E0E0]/20 text-[10px] mr-3">{item.time}</Text>
                        <TouchableOpacity onPress={() => handleReport("comment", item.id)} className="mr-3">
                          <Text className="text-[#E7433C]/40 text-[10px] font-bold">신고</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleBlockUser(item.userId || "anonymous")}>
                          <Ban size={12} color="#E7433C" opacity={0.3} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text className="text-[#E0E0E0]/70 text-[15px] leading-6 mb-4">{item.content}</Text>
                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity onPress={() => setReplyTo(item)}>
                        <Text className="text-[#00E0D0]/50 text-xs font-bold">답글 달기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 해당 댓글의 대댓글 (Indented) */}
                  {comments
                    .filter((reply: Comment) => reply.parentId === item.id)
                    .map((reply: Comment) => (
                      <View key={reply.id} className="ml-10 mt-3 flex-row">
                        <View className="w-1 h-full bg-[#00E0D0]/10 mr-4 rounded-full" />
                        <View className="flex-1 bg-[#002845]/10 p-5 rounded-[25px] border border-white/5">
                          <View className="flex-row justify-between items-center mb-2">
                            <Text
                              className={`text-[11px] font-bold ${reply.isMine ? "text-[#FFD700]" : "text-[#00E0D0]"}`}
                            >
                              {reply.user} {reply.isMine && "(나)"}
                            </Text>
                            <View className="flex-row items-center">
                              <Text className="text-[#E0E0E0]/20 text-[9px] mr-3">{reply.time}</Text>
                              <TouchableOpacity onPress={() => handleReport("comment", reply.id)}>
                                <Text className="text-[#E7433C]/30 text-[9px] font-bold">신고</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="mt-3">
                            <Text className="text-[#E0E0E0]/60 text-sm leading-6">{reply.content}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              ))}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View className="px-6 py-4 pb-10 bg-[#001220] border-t border-white/5">
          {replyTo && (
            <View className="flex-row justify-between items-center px-4 py-2 bg-[#00E0D0]/10 rounded-t-xl mb-1 mt-[-16px]">
              <Text className="text-[#00E0D0] text-[11px] font-bold">{replyTo.user}님에게 답글 남기는 중...</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <X size={14} color="#00E0D0" />
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row items-center bg-[#002845]/40 rounded-2xl px-6 py-4 border border-white/10">
            <TextInput
              placeholder="따뜻한 위로의 한마디를 남겨주세요"
              placeholderTextColor="#E0E0E020"
              className="flex-1 text-[#E0E0E0] mr-4 no-scrollbar"
              value={comment}
              onChangeText={setComment}
              multiline
              style={{ paddingVertical: 0 }}
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
