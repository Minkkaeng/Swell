import React from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  AlertCircle,
  Ban,
  Mic,
  PenTool,
  ArrowLeft,
  HelpCircle,
  ShieldAlert,
  Coins,
  Gem,
  CheckCircle2,
  ChevronRight,
} from "lucide-react-native";
import { Modal, Alert, Animated, ActivityIndicator } from "react-native";
import { api } from "../services/api";
import { useUserStore } from "../store/userStore";

const StoreItem = ({ icon, title, price, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-5 bg-[#002845]/60 rounded-3xl border border-white/5 mb-3"
  >
    <View className="flex-row items-center">
      <View className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center">{icon}</View>
      <View className="ml-4">
        <Text className="text-white font-bold">{title}</Text>
        <Text className="text-[#00E0D0] text-[10px] mt-1">즉시 충전</Text>
      </View>
    </View>
    <View className="bg-[#00E0D0] px-4 py-2 rounded-xl">
      <Text className="text-[#001220] font-bold text-xs">{price}</Text>
    </View>
  </TouchableOpacity>
);

const CATEGORIES = ["전체", "고민", "일상", "위로", "감사", "질문"];

export interface Post {
  id: string;
  userId: string;
  category: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
}

const MOCK_POSTS = [
  {
    id: "1",
    userId: "user1",
    category: "고민",
    content: "오늘따라 파도가 거칠게 느껴지네요. 하지만 이 정적 속에 나만의 평온이 있습니다.",
    time: "10분 전",
    likes: 12,
    comments: 4,
  },
  {
    id: "2",
    userId: "user2",
    category: "일상",
    content: "누구에게도 말하지 못한 이야기를 이곳에 쏟아내니 한결 가볍습니다. 고마워요 너울.",
    time: "32분 전",
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    userId: "user3",
    category: "위로",
    content: "어른이 된다는 건 감정을 숨기는 법을 배우는 게 아니라, 감정을 마주하는 법을 배우는 것 같아요.",
    time: "1시간 전",
    likes: 42,
    comments: 15,
  },
  {
    id: "4",
    userId: "user4",
    category: "질문",
    content: "다들 퇴근 후에는 어떤 파도에 몸을 맡기시나요? 저만의 휴식법을 찾고 싶어요.",
    time: "2시간 전",
    likes: 15,
    comments: 20,
  },
  {
    id: "5",
    userId: "user5",
    category: "일상",
    content:
      "오늘은 유난히 긴 하루였습니다. 아침부터 쏟아지는 업무에 치이다가 점심도 거른 채 미팅을 이어갔죠. 창밖을 보니 비가 조금씩 내리고 있더라구요. 문득 예전에 비 오는 날 친구와 함께 갔던 그 작은 카페가 생각났어요. 거기서 마셨던 따뜻한 차 한 잔이 지금 이 순간 무엇보다 간절하네요. 여러분은 오늘 하루 어떠셨나요? 가끔은 앞만 보고 달리는 것보다 잠시 멈춰 서서 내리는 비를 바라보는 시간도 필요한 것 같습니다. 내일은 조금 더 따뜻한 햇살이 비치길 바라며, 오늘 하루도 모두 고생 많으셨습니다. 편안한 밤 되세요.",
    time: "5시간 전",
    likes: 56,
    comments: 24,
  },
];

/**
 * @description 익명 커뮤니티 홈 화면
 */
const HomeScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = React.useState("전체");
  const [showMenu, setShowMenu] = React.useState(false);
  const [showWriteOptions, setShowWriteOptions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [posts, setPosts] = React.useState<Post[]>(MOCK_POSTS);
  const [mutedUsers, setMutedUsers] = React.useState<string[]>([]);
  const [reportCounts, setReportCounts] = React.useState<Record<string, number>>({});
  const [hasError, setHasError] = React.useState(false);
  const [showMyPosts, setShowMyPosts] = React.useState(false); // 내 활동 필터 추가

  const { status, dailyFreeTokens, totalTokens, useToken, addViewedPost, addTokenByAd, buyTokens, upgradeToVIP } =
    useUserStore();
  const [showStore, setShowStore] = React.useState(false);

  const handlePostPress = (post: Post) => {
    if (status === "GUEST") {
      if (addViewedPost()) {
        navigation.navigate("PostDetail", { post });
      } else {
        Alert.alert("열람 제한", "비회원은 하루 3개까지만 열람 가능합니다. 더 많은 글을 보려면 로그인해 주세요.", [
          { text: "로그인하러 가기", onPress: () => navigation.replace("Login") },
          { text: "취소", style: "cancel" },
        ]);
      }
    } else if (status === "USER") {
      if (useToken()) {
        navigation.navigate("PostDetail", { post });
      } else {
        Alert.alert("토큰 부족", "오늘의 열람 토큰을 모두 사용했습니다. 상점에서 충전하시겠습니까?", [
          {
            text: "상점 가기",
            onPress: () => setShowStore(true),
          },
          {
            text: "광고로 1개 충전",
            onPress: () => {
              Alert.alert("알림", "광고 시청이 완료되었습니다. 토큰 1개가 충전되었습니다.");
              addTokenByAd();
            },
          },
          { text: "취소", style: "cancel" },
        ]);
      }
    } else {
      // VIP는 무제한
      navigation.navigate("PostDetail", { post });
    }
  };

  const filteredPosts = posts.filter((p) => {
    const isCategoryMatch = selectedCategory === "전체" || p.category === selectedCategory;
    const isNotMuted = !mutedUsers.includes(p.userId || "");
    const isNotSoftBanned = (reportCounts[p.id] || 0) < 5;
    const isMineMatch = !showMyPosts || p.userId === "test-user-id" || p.userId === "user1"; // 시뮬레이션: user1을 내 아이디로 가정
    return isCategoryMatch && isNotMuted && isNotSoftBanned && isMineMatch;
  });

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await api.posts.get();
      // API 응답 구조에 맞게 매핑 (기본적으로 posts 배열이 온다고 가정)
      const mappedPosts: Post[] = Array.isArray(data)
        ? data.map((post: any) => ({
            id: post.id?.toString() || post._id?.toString(),
            userId: post.userId || "anonymous",
            category: post.category || "일상",
            content: post.content,
            time: post.createdAt ? "방금 전" : "1시간 전",
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
          }))
        : [];
      setPosts(mappedPosts.length > 0 ? mappedPosts : MOCK_POSTS);
    } catch (error) {
      console.error("API Fetch Error:", error);
      // 서버 연결 실패 시 가짜 데이터(Mock)로 강제 전환하여 서비스 지속
      setPosts(MOCK_POSTS);
      // 사용자에게 서버 상태 알림 (선택 사항)
      // Alert.alert("연결 안내", "현재 실시간 서버가 불안정하여 준비된 데이터로 표시합니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const handleReport = (id: string) => {
    setReportCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    Alert.alert("신고 접수", "해당 게시글이 신고되었습니다. 신고가 누적되면 자동으로 숨김 처리됩니다.");
  };

  const handleBlock = (userId: string) => {
    if (!userId || userId === "anonymous") {
      Alert.alert("알림", "익명 사용자는 개별 차단이 어렵습니다. (데모용)");
      return;
    }
    Alert.alert("사용자 차단", "해당 사용자의 모든 글을 숨기시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => {
          setMutedUsers((prev) => [...prev, userId]);
          Alert.alert("차단 완료", "해당 사용자의 글이 더 이상 보이지 않습니다.");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: <User size={22} color="#E0E0E0" />,
      label: "프로필 계정",
      onPress: () => {
        setShowMenu(false);
        navigation.navigate("Profile");
      },
    },
    {
      icon: <MessageSquare size={22} color="#00E0D0" />,
      label: "내가 쓴 글",
      onPress: () => {
        setShowMyPosts(true);
        setShowMenu(false);
      },
    },
    {
      icon: <HelpCircle size={22} color="#E0E0E0" />,
      label: "고객센터",
      onPress: () => {
        setShowMenu(false);
        navigation.navigate("Support");
      },
    },
    {
      icon: <ShieldAlert size={22} color="#E0E0E0" />,
      label: "개인정보 정책",
      onPress: () => {
        setShowMenu(false);
        Alert.alert(
          "개인정보 처리방침",
          "너울은 사용자의 익명성을 최우선으로 보호하며, 수집된 정보는 서비스 제공 목적으로만 최소한으로 활용됩니다.",
        );
      },
    },
    {
      icon: <Settings size={22} color="#E0E0E0" />,
      label: "환경 설정",
      onPress: () => {
        setShowMenu(false);
        navigation.navigate("Settings");
      },
    },
    {
      icon: <LogOut size={22} color="#E7433C" />,
      label: "로그아웃",
      onPress: () => navigation.replace("Login"),
      isDanger: true,
    },
  ];

  const getBgTint = () => {
    switch (selectedCategory) {
      case "고민":
        return "bg-[#1A1A2E]";
      case "위로":
        return "bg-[#0D2B2D]";
      case "일상":
        return "bg-[#001220]";
      default:
        return "bg-[#001220]";
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${getBgTint()} transition-colors duration-500`}>
      <>
        {/* Header */}
        <View className="px-8 pt-8 pb-4 flex-row justify-between items-center">
          {/* Left Side: Back Arrow (only if viewing my posts) */}
          <View className="w-12 h-12">
            {showMyPosts && (
              <TouchableOpacity
                onPress={() => setShowMyPosts(false)}
                className="w-12 h-12 rounded-2xl bg-[#002845] items-center justify-center border border-white/5 shadow-lg"
              >
                <ArrowLeft size={24} color="#00E0D0" />
              </TouchableOpacity>
            )}
          </View>

          {/* Center: Title & Tokens */}
          <View className="items-center">
            <Text className="text-[#E0E0E0]/50 text-[10px] font-bold tracking-[3px] mb-1">
              {showMyPosts ? "MY ACTIVITY" : "FEBRUARY 14"}
            </Text>
            <TouchableOpacity onPress={() => setShowStore(true)} className="flex-row items-center">
              <Text className="text-[#E0E0E0] text-2xl font-bold tracking-tight">
                {showMyPosts ? "내가 담은 파도" : "당신의 너울"}
              </Text>
              {status !== "GUEST" && (
                <View className="ml-2 bg-[#00E0D0]/10 px-2 py-1 rounded-lg flex-row items-center border border-[#00E0D0]/20">
                  <Gem size={12} color="#00E0D0" />
                  <Text className="text-[#00E0D0] text-[10px] font-bold ml-1">
                    {status === "VIP" ? "VIP" : dailyFreeTokens + totalTokens}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Right Side: Menu Button */}
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            className="w-12 h-12 rounded-2xl bg-[#002845] items-center justify-center border border-white/5 shadow-lg"
          >
            <Menu size={24} color="#E0E0E0" />
          </TouchableOpacity>
        </View>

        {/* Categories Bar */}
        <View className="mb-6">
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
            renderItem={({ item }: { item: string }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                className={`px-3.5 py-1.5 rounded-full mx-1 border ${
                  selectedCategory === item ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
                }`}
              >
                <Text
                  className={`text-[12.5px] font-bold ${selectedCategory === item ? "text-[#001220]" : "text-[#E0E0E0]/60"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item: string) => item}
          />
        </View>

        {isLoading ? (
          <View className="px-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <View key={i} className="bg-[#002845]/20 p-8 rounded-[40px] border border-white/5 space-y-4">
                <View className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                <View className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                <View className="h-20" />
                <View className="flex-row justify-between items-center">
                  <View className="h-6 bg-white/5 rounded-full w-20 animate-pulse" />
                  <View className="flex-row space-x-2">
                    <View className="h-8 bg-white/5 rounded-full w-12 animate-pulse" />
                    <View className="h-8 bg-white/5 rounded-full w-12 animate-pulse" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            renderItem={({ item }: { item: Post }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePostPress(item)}
                className="bg-[#002845]/40 p-8 rounded-[40px] mb-6 border border-white/5 shadow-sm active:scale-95 transition-transform"
              >
                <View className="flex-row justify-between items-start mb-6">
                  <Text
                    className="text-[#E0E0E0] text-[15px] leading-7 flex-1 font-light"
                    numberOfLines={4}
                    ellipsizeMode="tail"
                  >
                    {item.content}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("컨텐츠 관리", "이 게시글에 대해 무엇을 하시겠습니까?", [
                        { text: "신고하기", onPress: () => handleReport(item.id) },
                        {
                          text: "사용자 차단",
                          onPress: () => handleBlock(item.userId || "anonymous"),
                          style: "destructive",
                        },
                        { text: "취소", style: "cancel" },
                      ]);
                    }}
                    className="ml-4 p-2"
                  >
                    <MoreHorizontal size={20} color="#E0E0E0" opacity={0.3} />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-[#E0E0E0]/30 text-xs font-medium">{item.time}</Text>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full mr-3">
                      <Heart size={16} color="#00E0D0" fill={item.likes > 20 ? "#00E0D0" : "transparent"} />
                      <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{item.likes}</Text>
                    </View>
                    <View className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full">
                      <MessageSquare size={16} color="#E0E0E0" />
                      <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{item.comments}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button for Recording */}
        <TouchableOpacity
          onPress={() => setShowWriteOptions(true)}
          activeOpacity={0.8}
          className="absolute bottom-12 right-8 w-20 h-20 bg-[#00E0D0] rounded-[30px] items-center justify-center shadow-2xl"
          style={Platform.select({
            ios: { shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20 },
            android: { elevation: 10 },
            web: { boxShadow: "0px 0px 20px rgba(0, 224, 208, 0.5)" },
          })}
        >
          <Plus size={36} color="#001220" />
        </TouchableOpacity>

        {/* Choice Modal for Write/Voice */}
        <Modal
          visible={showWriteOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWriteOptions(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowWriteOptions(false)}
            className="flex-1 bg-black/60 items-center justify-end pb-40"
          >
            <View className="flex-row space-x-8">
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => {
                    setShowWriteOptions(false);
                    navigation.navigate("STT");
                  }}
                  className="w-20 h-20 bg-[#00E0D0] rounded-[30px] items-center justify-center shadow-2xl mb-3"
                >
                  <Mic size={32} color="#001220" />
                </TouchableOpacity>
                <Text className="text-[#00E0D0] font-bold">음성으로</Text>
              </View>

              <View className="items-center">
                <TouchableOpacity
                  onPress={() => {
                    setShowWriteOptions(false);
                    navigation.navigate("Write");
                  }}
                  className="w-20 h-20 bg-white rounded-[30px] items-center justify-center shadow-2xl mb-3"
                >
                  <PenTool size={32} color="#001220" />
                </TouchableOpacity>
                <Text className="text-white font-bold">글자로</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowWriteOptions(false)}
              className="mt-12 w-14 h-14 bg-[#002845] rounded-full items-center justify-center border border-white/10"
            >
              <X size={24} color="#E0E0E0" opacity={0.5} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Side Menu Modal */}
        <Modal visible={showMenu} transparent={true} animationType="none" onRequestClose={() => setShowMenu(false)}>
          <View className="flex-1 flex-row">
            {/* Overlay */}
            <TouchableOpacity activeOpacity={1} onPress={() => setShowMenu(false)} className="flex-1 bg-black/60" />

            {/* Menu Content */}
            <View className="w-72 bg-[#001220] h-full shadow-2xl border-l border-white/5 p-8">
              <SafeAreaView className="flex-1">
                <View className="flex-row justify-between items-center mb-12">
                  <Text className="text-[#E0E0E0] text-xl font-bold">Menu</Text>
                  <TouchableOpacity onPress={() => setShowMenu(false)}>
                    <X size={24} color="#E0E0E0" opacity={0.5} />
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={item.onPress}
                      className="flex-row items-center p-5 bg-[#002845]/40 rounded-2xl border border-white/5 mb-4"
                    >
                      {item.icon}
                      <Text
                        className={`ml-4 text-[16px] font-medium ${item.isDanger ? "text-[#E7433C]" : "text-[#E0E0E0]"}`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {/* VIP 배너 */}
                  {status !== "VIP" && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowMenu(false);
                        setShowStore(true);
                      }}
                      className="mt-6 p-6 rounded-[32px] bg-gradient-to-br from-[#00E0D0] to-[#00A89C] items-center relative overflow-hidden"
                      style={{ backgroundColor: "#00E0D0" }}
                    >
                      <View className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full" />
                      <Gem size={32} color="#001220" />
                      <Text className="text-[#001220] font-bold text-lg mt-2">VIP 멤버십</Text>
                      <Text className="text-[#001220]/60 text-xs mt-1 text-center">
                        광고 제거 및{"\n"}무제한 파도 즐기기
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mt-auto items-center pb-8 border-t border-white/5 pt-8">
                  <Text className="text-[#E0E0E0]/20 text-[10px] tracking-[2px]">SWELL v1.0.0</Text>
                </View>
              </SafeAreaView>
            </View>
          </View>
        </Modal>

        {/* Token Store Modal */}
        <Modal visible={showStore} transparent={true} animationType="slide" onRequestClose={() => setShowStore(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#001220] rounded-t-[40px] p-8 border-t border-white/10" style={{ height: "80%" }}>
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text className="text-white text-2xl font-bold">너울 상점</Text>
                  <Text className="text-[#E0E0E0]/40 text-sm mt-1">파도를 더 깊이 탐험해 보세요</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStore(false)}
                  className="w-10 h-10 items-center justify-center bg-white/5 rounded-full"
                >
                  <X size={20} color="#E0E0E0" />
                </TouchableOpacity>
              </View>

              <View className="bg-[#002845]/40 p-6 rounded-3xl border border-[#00E0D0]/20 flex-row justify-between items-center mb-10">
                <View>
                  <Text className="text-[#E0E0E0]/50 text-xs font-bold mb-1">현재 내 토큰</Text>
                  <View className="flex-row items-center">
                    <Gem size={20} color="#00E0D0" />
                    <Text className="text-white text-2xl font-bold ml-2">
                      {status === "VIP" ? "무제한" : dailyFreeTokens + totalTokens}
                    </Text>
                  </View>
                </View>
                {status !== "VIP" && (
                  <View className="items-end">
                    <Text className="text-[#E0E0E0]/30 text-[10px]">일일 무료 10개 포함</Text>
                    <Text className="text-[#00E0D0] text-xs font-bold mt-1">충전 시 광고 제거 (예정)</Text>
                  </View>
                )}
              </View>

              <View className="space-y-4 mb-8">
                <Text className="text-[#E0E0E0]/60 font-bold ml-1 mb-2">토큰 충전</Text>
                <StoreItem
                  icon={<Coins size={24} color="#FFD700" />}
                  title="토큰 30개"
                  price="₩1,100"
                  onPress={() => {
                    buyTokens(30);
                    Alert.alert("구매 완료", "토큰 30개가 충전되었습니다.");
                  }}
                />
                <StoreItem
                  icon={<Gem size={24} color="#00E0D0" />}
                  title="토큰 100개"
                  price="₩3,300"
                  onPress={() => {
                    buyTokens(100);
                    Alert.alert("구매 완료", "토큰 100개가 충전되었습니다.");
                  }}
                />
                <StoreItem
                  icon={<CheckCircle2 size={24} color="#A78BFA" />}
                  title="월 정기 VIP (무제한)"
                  price="₩5,500 / 월"
                  onPress={() => {
                    upgradeToVIP();
                    Alert.alert("승급 완료", "VIP 멤버십이 활성화되었습니다!");
                    setShowStore(false);
                  }}
                />
                <Text className="text-[#E0E0E0]/30 text-[10px] px-4 leading-4">
                  * VIP 사용자는 게시글 무제한 열람 및 전용 AI 요약 기능을 이용할 수 있습니다.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  addTokenByAd();
                  Alert.alert("알림", "광고 시청 후 1개 토큰이 충전되었습니다.");
                }}
                disabled={status === "VIP"}
                className={`flex-row items-center justify-center p-5 rounded-2xl border border-white/5 ${status === "VIP" ? "opacity-20" : "bg-white/5"}`}
              >
                <Text className="text-[#E0E0E0]/50 font-bold">광고 보고 1개 충전하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    </SafeAreaView>
  );
};

export default HomeScreen;
