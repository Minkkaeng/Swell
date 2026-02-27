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
    reportComment,
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

  const getMockComments = (postId: string, authorId: string, authorName: string): Comment[] => {
    switch (postId) {
      case "1":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "파도타는자",
            content: "하루하루가 생지옥이겠다 진짜.. 똥 밟았다고 생각하고 빨리 이직 자리 알아보는 게 답임 ㅠㅠ",
            time: "15분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: authorId,
            user: authorName,
            content: "하 이력서 쓸 기력도 없는데 주말에 억지로라도 카페 가야겠다..",
            time: "12분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "분노조절중",
            content: "와 기획서 던지는 건 진짜 짐승 새끼네. 노동부에 직장 내 괴롭힘으로 찌르고 퇴사해라.",
            time: "8분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2-r1",
            userId: "user_static_3",
            user: "밤바다",
            content: "모욕죄로 고소 안 되나ㅋㅋㅋ 회사에 미친 인간들 너무 많음 진짜로",
            time: "3분 전",
            parentId: "c2",
            isMine: false,
          },
        ];
      case "2":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "알바요정",
            content: "헐 첫날부터 진상이라니.. 사장 새끼가 내 편 안 들어주고 빌라고 하면 당장 추노하는 게 맞음.",
            time: "10분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: "user_static_3",
            user: "소금쟁이",
            content: "ㅇㅈ 사장 마인드부터가 글러먹었음. 나였으면 앞치마 던졌다.",
            time: "8분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "현실조언러",
            content: "진짜 서비스직 하다 보면 인류애 수직 하락함. 어딜 가나 또라이 질량 보존의 법칙이다 진짜 ㅋㅋㅋ",
            time: "5분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2-r1",
            userId: authorId,
            user: authorName,
            content: "진짜 진상 아저씨보다 빌라고 한 사장이 더 밉다 ㅋㅋㅋ 낼 알바 가기 싫어",
            time: "2분 전",
            parentId: "c2",
            isMine: false,
          },
        ];
      case "3":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "동그라미",
            content:
              "한숨 쉬는 거 진짜 사람 피말리게 하는 가스라이팅임. 원래 신입 땐 다 모르는 건데 지가 올챙이 시절 기억 못하는 거.",
            time: "18분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "지나가는바람",
            content: "나도 저런 거 겪어봤는데 멘탈 개박살 남.. 그냥 영혼 없이 '네 알겠습니다' 봇이 되는 수밖에 없음.",
            time: "10분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2-r1",
            userId: authorId,
            user: authorName,
            content: "맞아 지금 딱 영혼 가출 상태임ㅋㅋㅋㅋ 뭘 물어보기가 무섭다",
            time: "8분 전",
            parentId: "c2",
            isMine: false,
          },
          {
            id: "c3",
            userId: "user_static_3",
            user: "선배마음",
            content: "사수 인성 꼬라지 보소.. 걍 지 기분 안 좋다고 너한테 화풀이하는 거임 너무 마음에 담아두지 마.",
            time: "2분 전",
            parentId: null,
            isMine: false,
          },
        ];
      case "4":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "퇴근마렵다",
            content: "지는 연차 쓰면서 퇴근 직전에 일 던지는 거 진짜 사이코패스 아님? 완전 이기주의 끝판왕이네.",
            time: "30분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: authorId,
            user: authorName,
            content: "진짜 죽이고 싶다 ㅋㅋㅋ 짐 샀다가 다시 푸는데 자괴감 개오졌음",
            time: "25분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "야근요정",
            content: "저런 건 처음부터 확실하게 거절해야 됨. 한 번 받아주면 계속 호구 취급하면서 지 일 떠넘김.",
            time: "12분 전",
            parentId: null,
            isMine: false,
          },
        ];
      case "5":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "조용한물결",
            content: "나도 가끔 환승할 때 이유 없이 눈물 고임.. 이 팍팍한 세상에 마음 안 병든 사람 없는 듯.",
            time: "1시간 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "토닥토닥",
            content: "부모님한테 걱정 끼치기 싫어서 애써 밝은 척 할 때가 제일 비참하지 ㅠㅠ 오늘 진짜 고생 많았다.",
            time: "45분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2-r1",
            userId: authorId,
            user: authorName,
            content: "진짜 부모님 목소리 들으니까 눈물 참느라 입술 깨물었다.. 다들 이렇게 버티는구나 위로 고마워",
            time: "30분 전",
            parentId: "c2",
            isMine: false,
          },
          {
            id: "c3",
            userId: "user_static_3",
            user: "잔잔한위로",
            content: "다들 이렇게 꾸역꾸역 버티면서 사는구나 싶네.. 오늘은 집 가서 치킨 시켜먹고 다 잊어버려!",
            time: "10분 전",
            parentId: "c2",
            isMine: false,
          },
        ];
      case "6":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "단호박",
            content:
              "50 받고 5는 진짜 선 존나 세게 넘은 거임. 10년지기라고? 그냥 10년 동안 호구 잡힌 거니까 당장 손절 쳐.",
            time: "12분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: authorId,
            user: authorName,
            content: "호구된 기분이 이거구나 싶음.. 남편 보기도 진짜 창피해서 말이 안 나온다",
            time: "10분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "현실조언러",
            content: "이건 속 좁은 게 아니라 네가 보살인 거임 ㅋㅋㅋ 내가 너였으면 축의금 봉투 얼굴에 던졌다.",
            time: "8분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c3",
            userId: "user_static_3",
            user: "공감요정",
            content: "어떻게 남편 보기 민망하게 남의 체면을 그렇게 깎아내리냐.. 개빡칠만 하네 진짜 어이없었겠다.",
            time: "3분 전",
            parentId: "c2",
            isMine: false,
          },
        ];
      case "7":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "분노버튼",
            content: "와 잠수+환승 콜라보 미쳤네 ㅋㅋㅋ 쓰레기 분리수거 제대로 했네 걍 부계정으로도 보지 마 더러움.",
            time: "15분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: authorId,
            user: authorName,
            content: "어디 쳐박혀서 뒤졌으면 좋겠다 진짜 손 떨려서 일도 안 잡혀",
            time: "12분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "토닥토닥",
            content: "잠수타는 새끼들이 젤 찌질함. 감정 낭비 말고 똥 밟았다 치고 네 인생 멋지게 사는 게 최고의 복수임.",
            time: "5분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c2-r1",
            userId: "user_static_3",
            user: "공감공감",
            content: "ㄹㅇ 그런 폐급 찌질이는 버리는 게 이득임 더 좋은 사람 만날 거임 ㅠㅠ",
            time: "1분 전",
            parentId: "c2",
            isMine: false,
          },
        ];
      case "8":
        return [
          {
            id: "c1",
            userId: "user_static_1",
            user: "마이웨이",
            content:
              "진짜 동호회 가면 저런 파벌 만드는 정치질 오지는 애들 꼭 있음. 더러워서 피하는 게 정신건강에 이로워.",
            time: "10분 전",
            parentId: null,
            isMine: false,
          },
          {
            id: "c1-r1",
            userId: authorId,
            user: authorName,
            content: "진짜 나이 쳐먹고 뭐하는 짓인지 모르겠음 ㅋㅋㅋ 걍 단톡방 나가기 눌러버릴까 고민 중이다",
            time: "8분 전",
            parentId: "c1",
            isMine: false,
          },
          {
            id: "c2",
            userId: "user_static_2",
            user: "경험자",
            content:
              "나이 먹고 끼리끼리 몰려다니면서 뒤에서 딴 방 파는 거 ㅈㄴ 유치함ㅋㅋㅋ 그냥 깔끔하게 탈퇴 버튼 눌러라.",
            time: "2분 전",
            parentId: null,
            isMine: false,
          },
        ];
      default:
        return [
          {
            id: "c1",
            userId: "user_default",
            user: "지나가는바람",
            content: "오늘 하루도 진짜 고생 많았다. 푹 쉬고 내일 또 털어내자 화이팅!",
            time: "방금 전",
            parentId: null,
            isMine: false,
          },
        ];
    }
  };

  const [comments, setComments] = useState<Comment[]>(getMockComments(post.id, post.userId, post.nickname));

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
      const res = reportPost(targetIdToReport, reportReason);
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
      const res = reportComment(targetIdToReport, reportReason);
      if (res.success && isBlockChecked) {
        blockUser(targetIdToReport, targetNicknameToReport);
      }
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
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color={THEMES[appTheme].text} />
          </TouchableOpacity>
          <Text style={{ color: THEMES[appTheme].text }} className="text-base font-bold">
            파도 엿보기
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleShare} className="w-10 h-10 items-center justify-center">
              <Share2 size={20} color="#00E0D0" opacity={0.8} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View
            style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
            className="p-5 rounded-[28px] mb-6 border border-white/5"
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
            <Text style={{ color: THEMES[appTheme].text }} className="text-lg font-bold mb-4">
              {post.title}
            </Text>
            <View className="h-[1px] w-full bg-white/5 mb-6 s24:mb-8" />
            <Text style={{ color: THEMES[appTheme].text }} className="text-[15px] leading-6 font-light mb-6 opacity-70">
              {post.content}
            </Text>

            {/* AI 요약 섹션 */}
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
                {!aiSummary && (
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
                    className="p-5 rounded-[24px] border border-white/5"
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
