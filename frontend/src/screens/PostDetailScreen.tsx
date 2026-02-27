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
  Modal,
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
  Sparkles,
  Users,
  ChevronRight,
  UserPlus,
  UserMinus,
} from "lucide-react-native";
import { api } from "../services/api";
import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";
import Animated, { FadeInUp } from "react-native-reanimated";

export interface Comment {
  id: string;
  userId: string;
  user: string;
  content: string;
  time: string;
  parentId: string | null;
  isMine: boolean;
}

// export interface Comment 구조 유지

/**
 * @description 게시글 상세조회 및 댓글 작성 화면
 */
const PostDetailScreen = ({ route, navigation }: any) => {
  const { post } = route.params;

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  // 게시글 수정 상태
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState(post.content);

  // AI 요약 관련 상태
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAISummary] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // 작성자 상세 프로필 모달 관련 상태
  const [showAuthorProfile, setShowAuthorProfile] = useState(false);
  const [isAuthorLoading, setIsAuthorLoading] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 목록 확장 상태 추가

  // 신고 모달 관련 상태
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"post" | "user" | "comment">("post");
  const [reportReason, setReportReason] = useState("");
  const [isBlockChecked, setIsBlockChecked] = useState(false);
  const [targetIdToReport, setTargetIdToReport] = useState("");
  const [targetNicknameToReport, setTargetNicknameToReport] = useState("");

  const REPORT_REASONS = ["부적절한 내용", "비난 및 욕설", "스팸/홍보", "허위 사실", "기타"];

  const {
    status: userStatus,
    userId,
    nickname,
    following,
    toggleFollow,
    reportPost,
    reportUser,
    blockUser,
    appTheme,
  } = useUserStore();
  const isFollowingAuthor = authorProfile ? following.some((f) => f.id === authorProfile.id) : false;

  const fetchAuthorProfile = async () => {
    try {
      setIsAuthorLoading(true);
      setShowAuthorProfile(true);
      setIsExpanded(false); // 프로필 열 때 확장 상태 초기화
      const response = await api.users.getProfile(post.userId);
      if (response.success) {
        setAuthorProfile(response.data);
      }
    } catch (error) {
      console.error("Fetch Author Profile Error:", error);
    } finally {
      setIsAuthorLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!authorProfile) return;

    try {
      await api.users.toggleFollow(userId || "anonymous", authorProfile.id);
      toggleFollow(authorProfile.id, authorProfile.nickname);
    } catch (error) {
      Alert.alert("알림", "팔로우 처리에 실패했습니다.");
    }
  };

  const handleAISummary = async () => {
    if (userStatus !== "VIP") {
      Alert.alert("VIP 전용", "AI 요약 기능은 VIP 회원만 이용 가능합니다.");
      return;
    }

    try {
      setIsSummarizing(true);
      const data = await api.stt.summarize(post.content);

      if (data.success) {
        setAISummary(data.summary);
      } else {
        throw new Error("API failed");
      }
    } catch (error) {
      Alert.alert("오류", "AI 요약 서비스를 일시적으로 사용할 수 없습니다.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert("게시글 삭제", "정말로 이 게시글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await api.posts.delete(post.id);
            Alert.alert("알림", "게시글이 삭제되었습니다.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("알림", "삭제 처리에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleEditPost = async () => {
    try {
      await api.posts.update(post.id, { content: editedPostContent });
      post.content = editedPostContent; // UI 즉시 반영 (실제로는 부모에서 업데이트 필요)
      setIsEditingPost(false);
    } catch (error) {
      Alert.alert("알림", "게시글 수정에 실패했습니다.");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("댓글 삭제", "정말로 이 댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await api.comments.delete(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
          } catch (error) {
            Alert.alert("알림", "댓글 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      userId: "user_static_1",
      user: "파도타는자",
      content:
        "진짜 읽으면서 제 가슴이 다 답답해지네요.. 저도 비슷한 경험이 있어서 남일 같지 않아요. 오늘 정말 고생 많으셨어요.",
      time: "15분 전",
      parentId: null,
      isMine: false,
    },
    {
      id: "c2",
      userId: "user_static_2",
      user: "새벽너울",
      content: "그 사람들은 원래 그래요. 님 잘못 아니니까 너무 자책하지 마세요. 맛있는 거 먹고 푹 잤으면 좋겠네요.",
      time: "8분 전",
      parentId: null,
      isMine: false,
    },
    {
      id: "c3",
      userId: "user_static_3",
      user: "잔잔한위로",
      content: "맞아요.. 저도 어제 비슷한 일 겪었는데 여기서 글 보면서 위로받네요. 우리 같이 힘내요!",
      time: "3분 전",
      parentId: "c2",
      isMine: false,
    },
    {
      id: "c4",
      userId: "user_static_4",
      user: "서울의밤",
      content: "익명이라 하는 말이지만, 때로는 도망치는 것도 용기예요. 너무 버티려고만 하지 마세요.",
      time: "1분 전",
      parentId: null,
      isMine: false,
    },
  ]);

  const handleAddComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    const tempId = Date.now().toString();
    const newComment: Comment = {
      id: tempId,
      userId: userId || "anonymous",
      user: nickname || "익명의 너울",
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
        userId: userId || "anonymous",
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

  const handleReportMember = (id: string, targetNickname: string) => {
    Alert.alert("회원 신고", `${targetNickname}님을 신고하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "신고",
        style: "destructive",
        onPress: () => {
          // 신고 사유 선택 (데모용)
          Alert.alert("신고 사유", "사유를 선택해 주세요.", [
            {
              text: "욕설/비방",
              onPress: () => {
                const res = reportUser(id, "욕설/비방");
                Alert.alert(res.success ? "신고 완료" : "알림", res.message);
              },
            },
            {
              text: "부적절한 게시물",
              onPress: () => {
                const res = reportUser(id, "부적절한 게시물");
                Alert.alert(res.success ? "신고 완료" : "알림", res.message);
              },
            },
            {
              text: "기타",
              onPress: () => {
                const res = reportUser(id, "기타");
                Alert.alert(res.success ? "신고 완료" : "알림", res.message);
              },
            },
          ]);
        },
      },
    ]);
  };

  const handleReport = (type: "post" | "comment" | "member", id: string, targetNickname?: string) => {
    setTargetIdToReport(id);
    setTargetNicknameToReport(targetNickname || (type === "post" ? post.nickname : "익명의 너울"));
    setReportType(type === "member" ? "user" : type);
    setReportReason("");
    setIsBlockChecked(type !== "post" || id !== userId);
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!reportReason) {
      Alert.alert("알림", "신고 사유를 선택해 주세요.");
      return;
    }

    if (reportType === "post") {
      const res = reportPost(targetIdToReport);
      if (res.success && isBlockChecked) {
        blockUser(post.userId, post.nickname);
      }
    } else if (reportType === "user") {
      const res = reportUser(targetIdToReport, reportReason);
      if (res.success && isBlockChecked) {
        blockUser(targetIdToReport, targetNicknameToReport);
      }
    } else {
      // 댓글 신고 로직
      Alert.alert("신고 완료", "신고가 정상적으로 접수되었습니다.");
    }

    setShowReportModal(false);
    Alert.alert("신고 완료", "정상적으로 접수되었습니다.");
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

  const handleBlockUser = (targetId: string, targetNickname: string) => {
    Alert.alert("사용자 차단", `${targetNickname}님을 차단하고 모든 글과 댓글을 숨기시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => {
          blockUser(targetId, targetNickname);
          Alert.alert("차단 완료", "해당 사용자의 글이 더 이상 보이지 않습니다.");
          navigation.goBack(); // 상세페이지에서 차단 시 목록으로 이동
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {/* Header */}
        <View className="px-6 s24:px-8 py-6 s24:py-8 flex-row justify-between items-center border-b border-white/5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 s24:w-12 s24:h-12 items-center justify-center"
          >
            <ArrowLeft size={28} color={THEMES[appTheme].text} />
          </TouchableOpacity>
          <Text style={{ color: THEMES[appTheme].text }} className="text-lg s24:text-xl font-bold">
            파도 엿보기
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleShare} className="w-10 h-10 s24:w-12 s24:h-12 items-center justify-center">
              <Share2 size={24} color="#00E0D0" opacity={0.8} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View
            style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
            className="p-6 s24:p-8 rounded-[32px] mb-8 s24:mb-10 border border-white/5"
          >
            <TouchableOpacity activeOpacity={0.7} onPress={fetchAuthorProfile} className="mb-6 s24:mb-8 self-start">
              <View
                style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
                className="flex-row items-center px-4 py-2 rounded-xl"
              >
                <Text
                  style={{ color: THEMES[appTheme].accent }}
                  className="text-[10px] s24:text-[11px] font-bold tracking-[2px] uppercase"
                >
                  {post.nickname}
                </Text>
                <ChevronRight size={14} color={THEMES[appTheme].accent} style={{ marginLeft: 4, opacity: 0.6 }} />
              </View>
            </TouchableOpacity>
            <Text style={{ color: THEMES[appTheme].text }} className="text-xl s24:text-2xl font-bold mb-4 s24:mb-6">
              {post.title}
            </Text>
            <View className="h-[1px] w-full bg-white/5 mb-6 s24:mb-8" />
            <Text
              style={{ color: THEMES[appTheme].text }}
              className="text-[16.5px] s24:text-lg leading-7 s24:leading-8 font-light mb-7 s24:mb-10 opacity-70"
            >
              {post.content}
            </Text>

            {/* AI 요약 섹션 (VIP 전용) */}
            {aiSummary && (
              <Animated.View
                entering={FadeInUp}
                style={{ backgroundColor: THEMES[appTheme].accent + "0D" }}
                className="p-6 rounded-3xl mb-8 border border-[#00E0D0]/10"
              >
                <View className="flex-row items-center mb-3">
                  <Sparkles size={16} color={THEMES[appTheme].accent} />
                  <Text style={{ color: THEMES[appTheme].accent }} className="text-xs font-bold ml-2 tracking-widest">
                    AI SUMMARY
                  </Text>
                </View>
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-80 text-[14px] leading-6">
                  {aiSummary}
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-20 text-[10px] mt-4 font-bold italic">
                  * 본 요약은 LLM 서비스를 통해 생성되었습니다. 비식별화 처리가 완료된 본문만 전송됩니다.
                </Text>
              </Animated.View>
            )}

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-xs font-medium mr-4">
                  {post.time}
                </Text>
                {userStatus === "VIP" && !aiSummary && (
                  <TouchableOpacity
                    onPress={handleAISummary}
                    disabled={isSummarizing}
                    style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
                    className="flex-row items-center px-4 py-2 rounded-full"
                  >
                    {isSummarizing ? (
                      <ActivityIndicator size="small" color={THEMES[appTheme].accent} />
                    ) : (
                      <>
                        <Sparkles size={14} color={THEMES[appTheme].accent} />
                        <Text style={{ color: THEMES[appTheme].accent }} className="text-xs font-bold ml-2">
                          AI 요약하기
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsLiked(!isLiked)}
                  className="flex-row items-center px-4 py-2 bg-white/5 rounded-full mr-3"
                >
                  <Heart
                    size={16}
                    color={THEMES[appTheme].accent}
                    fill={isLiked ? THEMES[appTheme].accent : "transparent"}
                  />
                  <Text style={{ color: THEMES[appTheme].text }} className="opacity-60 text-xs font-bold ml-2">
                    {isLiked ? post.likes + 1 : post.likes}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{ backgroundColor: THEMES[appTheme].text + "0D" }}
                  className="flex-row items-center px-4 py-2 rounded-full mr-3"
                >
                  <MessageSquare size={16} color={THEMES[appTheme].text} opacity={0.3} />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{comments.length}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("신고하기", "신고 대상을 선택해 주세요.", [
                      { text: "취소", style: "cancel" },
                      { text: "게시글 신고", onPress: () => handleReport("post", post.id) },
                      { text: "회원 신고", onPress: () => handleReport("member", post.userId, post.nickname) },
                    ]);
                  }}
                  style={{ backgroundColor: "#E7433C1A" }}
                  className="px-5 py-2 rounded-full border border-[#E7433C26]"
                >
                  <Text className="text-[#E7433C] text-[11px] font-bold">신고</Text>
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
                  <View
                    style={{ backgroundColor: THEMES[appTheme].surface + "4D" }}
                    className="p-6 rounded-[30px] border border-white/5"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text
                        style={{ color: item.isMine ? THEMES[appTheme].accent : THEMES[appTheme].text }}
                        className={`text-xs font-bold ${item.isMine ? "" : "opacity-60"}`}
                      >
                        {item.user} {item.isMine && "(나)"}
                      </Text>
                      <View className="flex-row items-center">
                        <Text style={{ color: THEMES[appTheme].text }} className="opacity-20 text-[10px] mr-3">
                          {item.time}
                        </Text>

                        {item.userId === userId ? (
                          <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                              <Text className="text-[#E7433C] opacity-40 text-[10px] font-bold">삭제</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => handleReport("comment", item.id)} className="mr-3">
                              <Text className="text-[#E7433C] opacity-40 text-[10px] font-bold">신고</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleBlockUser(item.userId || "anonymous", item.user)}>
                              <Ban size={12} color="#E7433C" opacity={0.3} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={{ color: THEMES[appTheme].text }} className="opacity-70 text-[15px] leading-6 mb-4">
                      {item.content}
                    </Text>

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
                              <Text style={{ color: THEMES[appTheme].text }} className="opacity-20 text-[10px] mr-3">
                                {reply.time}
                              </Text>
                              {reply.userId === userId ? (
                                <View className="flex-row items-center">
                                  <TouchableOpacity onPress={() => handleDeleteComment(reply.id)}>
                                    <Text className="text-[#E7433C] opacity-40 text-[10px] font-bold">삭제</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View className="flex-row items-center">
                                  <TouchableOpacity onPress={() => handleReport("comment", reply.id)} className="mr-3">
                                    <Text className="text-[#E7433C] opacity-40 text-[10px] font-bold">신고</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleBlockUser(reply.userId || "anonymous", reply.user)}
                                  >
                                    <Ban size={12} color="#E7433C" opacity={0.3} />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>

                          <Text
                            style={{ color: THEMES[appTheme].text }}
                            className="opacity-70 text-[14px] leading-5 mb-2 mt-2"
                          >
                            {reply.content}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              ))}
          </View>
        </ScrollView>

        {/* Comment Input */}
        <View style={{ backgroundColor: THEMES[appTheme].bg }} className="px-6 py-4 pb-10 border-t border-white/5">
          {replyTo && (
            <View
              style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
              className="flex-row justify-between items-center px-4 py-2 rounded-t-xl mb-1 mt-[-16px]"
            >
              <Text style={{ color: THEMES[appTheme].accent }} className="text-[11px] font-bold">
                {replyTo.user}님에게 답글 남기는 중...
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <X size={14} color={THEMES[appTheme].accent} />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
            className="flex-row items-center rounded-2xl px-6 py-4 border border-white/10"
          >
            <TextInput
              placeholder="따뜻한 위로의 한마디를 남겨주세요"
              placeholderTextColor={THEMES[appTheme].text + "20"}
              className="flex-1 mr-4 no-scrollbar"
              style={{ color: THEMES[appTheme].text, paddingVertical: 0 }}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!comment.trim() || isSubmitting}
              className={`${!comment.trim() || isSubmitting ? "opacity-20" : ""}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color={THEMES[appTheme].accent} size="small" />
              ) : (
                <Send size={20} color={THEMES[appTheme].accent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Author Profile Modal */}
        <Modal visible={showAuthorProfile} animationType="slide" transparent={true}>
          <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-20">
            <View
              style={{ backgroundColor: THEMES[appTheme].surface }}
              className="flex-1 rounded-t-[50px] border-t border-white/10 shadow-2xl"
            >
              <View className="px-8 pt-8 pb-4 flex-row justify-between items-center">
                <View className="w-10 h-10" />
                <Text className="text-white text-[10px] font-bold tracking-[3px] opacity-30">AUTHOR PROFILE</Text>
                <TouchableOpacity
                  onPress={() => setShowAuthorProfile(false)}
                  className="w-10 h-10 bg-white/5 rounded-full items-center justify-center"
                >
                  <X size={20} color={THEMES[appTheme].text} />
                </TouchableOpacity>
              </View>

              {isAuthorLoading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator color={THEMES[appTheme].accent} />
                </View>
              ) : authorProfile ? (
                <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
                  {/* Author Header */}
                  <View
                    style={{ backgroundColor: THEMES[appTheme].surface + "4D" }}
                    className="items-center mt-6 mb-10 p-10 rounded-[40px] border border-white/5"
                  >
                    <View
                      style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
                      className="w-20 h-20 rounded-[28px] items-center justify-center mb-6"
                    >
                      <Users size={40} color={THEMES[appTheme].accent} />
                    </View>
                    <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold mb-2">
                      {authorProfile.nickname}
                    </Text>

                    {/* Follow Toggle Button */}
                    {authorProfile.id !== userId && (
                      <TouchableOpacity
                        onPress={handleToggleFollow}
                        style={{
                          backgroundColor: isFollowingAuthor ? "transparent" : THEMES[appTheme].accent,
                          borderColor: THEMES[appTheme].accent + (isFollowingAuthor ? "4D" : ""),
                        }}
                        className={`mt-4 px-10 py-4 rounded-[24px] flex-row items-center border shadow-sm`}
                      >
                        {isFollowingAuthor ? (
                          <>
                            <UserMinus size={18} color={THEMES[appTheme].accent} />
                            <Text style={{ color: THEMES[appTheme].accent }} className="font-bold ml-2 text-base">
                              언팔로우 하기
                            </Text>
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} color={THEMES[appTheme].bg} />
                            <Text style={{ color: THEMES[appTheme].bg }} className="font-bold ml-2 text-base">
                              이 회원 팔로우
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Report Member Button in Modal */}
                    {authorProfile.id !== userId && (
                      <TouchableOpacity
                        onPress={() => {
                          setShowAuthorProfile(false);
                          handleReport("member", authorProfile.id, authorProfile.nickname);
                        }}
                        className="mt-6 flex-row items-center opacity-70 bg-[#E7433C]/5 px-6 py-2 rounded-xl border border-[#E7433C]/10"
                      >
                        <AlertCircle size={14} color="#E7433C" />
                        <Text className="text-[#E7433C] text-[11px] font-bold ml-2">부적절한 회원 신고</Text>
                      </TouchableOpacity>
                    )}

                    {/* Block Button in Modal */}
                    {!isFollowingAuthor && authorProfile.id !== userId && (
                      <TouchableOpacity
                        onPress={() => {
                          setShowAuthorProfile(false);
                          handleBlockUser(authorProfile.id, authorProfile.nickname);
                        }}
                        className="mt-4 flex-row items-center opacity-40 px-4 py-2"
                      >
                        <Ban size={14} color="#E7433C" />
                        <Text className="text-[#E7433C] text-[11px] font-bold ml-2">이 사용자 차단하기</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Author Stats Row */}
                  <View className="flex-row justify-between mb-10">
                    {[
                      {
                        label: "팔로워",
                        value: isFollowingAuthor ? authorProfile.followers + 1 : authorProfile.followers,
                        icon: <Users size={14} color={THEMES[appTheme].accent} />,
                      },
                      { label: "공감", value: authorProfile.receivedLikes, icon: <Heart size={14} color="#FF6B6B" /> },
                      {
                        label: "게시글",
                        value: authorProfile.postCount,
                        icon: <MessageSquare size={14} color="#E0E0E0" />,
                      },
                    ].map((stat, i) => (
                      <View
                        key={i}
                        style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
                        className="flex-1 mx-1.5 p-5 rounded-[25px] items-center border border-white/5"
                      >
                        <Text className="text-white text-lg font-bold mb-1">{stat.value}</Text>
                        <View className="flex-row items-center opacity-40">
                          {stat.icon}
                          <Text className="text-[#E0E0E0] text-[10px] font-bold ml-1">{stat.label}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Author Posts List */}
                  <View className="mb-20">
                    <View className="flex-row justify-between items-center mb-6 px-2">
                      <Text className="text-[#E0E0E0]/40 text-xs font-bold tracking-widest uppercase">
                        {isExpanded ? "All Waves" : "Recent Waves"}
                      </Text>
                      <Text style={{ color: THEMES[appTheme].accent + "66" }} className="text-[10px] font-bold">
                        총 {authorProfile.postCount}개
                      </Text>
                    </View>

                    {(isExpanded ? authorProfile.posts : authorProfile.posts.slice(0, 3)).map((p: any) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          setShowAuthorProfile(false);
                          navigation.push("PostDetail", { post: { ...p, nickname: authorProfile.nickname } });
                        }}
                        style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
                        className="p-6 rounded-[30px] border border-white/5 mb-4"
                      >
                        <Text className="text-[#E0E0E0] text-base font-bold mb-2">{p.title}</Text>
                        <Text className="text-[#E0E0E0]/50 text-sm mb-4" numberOfLines={2}>
                          {p.content}
                        </Text>
                        <View className="flex-row justify-between items-center mt-2">
                          <Text className="text-[#E0E0E0]/20 text-[10px]">{p.time}</Text>
                          <View className="flex-row items-center">
                            <View className="flex-row items-center mr-4">
                              <Heart size={12} color={THEMES[appTheme].accent} opacity={0.5} />
                              <Text className="text-[#E0E0E0]/40 text-[10px] ml-1">{p.likes}</Text>
                            </View>
                            <View className="flex-row items-center">
                              <MessageSquare size={12} color="#E0E0E0" opacity={0.5} />
                              <Text className="text-[#E0E0E0]/40 text-[10px] ml-1">{p.comments}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {/* 확장 버튼 (게시글이 3개보다 많을 때만 노출) */}
                    {!isExpanded && authorProfile.posts.length > 3 && (
                      <TouchableOpacity
                        onPress={() => setIsExpanded(true)}
                        style={{ backgroundColor: THEMES[appTheme].surface + "1A" }}
                        className="py-6 items-center justify-center rounded-[30px] border border-dashed border-white/10 mt-2"
                      >
                        <View className="flex-row items-center">
                          <Text className="text-[#E0E0E0]/40 font-bold mr-2">이전 파도 더보기</Text>
                          <ChevronRight size={16} color="#E0E0E0" opacity={0.3} />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>
        {/* Report & Block Modal */}
        <Modal
          visible={showReportModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReportModal(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View
              style={{ backgroundColor: THEMES[appTheme].bg }}
              className="rounded-t-[50px] p-10 border-t border-white/10"
            >
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text className="text-[#E7433C] text-[10px] font-bold tracking-[2px] mb-2 uppercase">REPORT</Text>
                  <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                    신고 및 차단
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  style={{ backgroundColor: THEMES[appTheme].surface }}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                >
                  <X size={24} color={THEMES[appTheme].text} />
                </TouchableOpacity>
              </View>

              <Text style={{ color: THEMES[appTheme].text }} className="opacity-60 text-sm mb-6 leading-6">
                이 {reportType === "post" ? "게시글" : reportType === "comment" ? "댓글" : "사용자"}을(를) 신고하는
                사유를 선택해 주세요.{"\n"}부적절한 게시글은 검토 후 처리됩니다.
              </Text>

              {/* Reasons List */}
              <View className="space-y-3 mb-8">
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => setReportReason(reason)}
                    style={{
                      backgroundColor: reportReason === reason ? "#E7433C1A" : THEMES[appTheme].surface + "66",
                      borderColor: reportReason === reason ? "#E7433C66" : "rgba(255,255,255,0.05)",
                    }}
                    className={`flex-row items-center p-5 rounded-2xl border mb-3`}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${
                        reportReason === reason ? "border-[#E7433C]" : "border-white/20"
                      }`}
                    >
                      {reportReason === reason && <View className="w-2.5 h-2.5 rounded-full bg-[#E7433C]" />}
                    </View>
                    <Text
                      style={{ color: reportReason === reason ? THEMES[appTheme].text : THEMES[appTheme].text + "66" }}
                      className={`font-medium`}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Block Option */}
              <TouchableOpacity
                onPress={() => setIsBlockChecked(!isBlockChecked)}
                style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
                className="flex-row items-center p-6 rounded-3xl mb-10 border border-white/5"
              >
                <View
                  className={`w-6 h-6 rounded-lg items-center justify-center mr-4 border ${
                    isBlockChecked ? "bg-[#E7433C] border-[#E7433C]" : "border-white/20"
                  }`}
                >
                  {isBlockChecked && <View className="w-3 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-1" />}
                </View>
                <View>
                  <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-base">
                    이 {reportType === "user" ? "사용자" : "작성자"} 차단하기
                  </Text>
                  <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-xs mt-1">
                    이 사용자의 글이 더 이상 노출되지 않습니다.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitReport}
                className="bg-[#E7433C] py-6 rounded-[30px] items-center justify-center shadow-lg shadow-[#E7433C]/20"
              >
                <Text className="text-white font-black text-lg">신고 및 차단 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;
