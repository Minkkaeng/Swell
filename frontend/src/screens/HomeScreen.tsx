import React from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
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
} from "lucide-react-native";
import { Modal, Alert, Animated } from "react-native";

const CATEGORIES = ["전체", "고민", "일상", "위로", "감사", "질문"];

const MOCK_POSTS = [
  {
    id: "1",
    category: "고민",
    content: "오늘따라 파도가 거칠게 느껴지네요. 하지만 이 정적 속에 나만의 평온이 있습니다.",
    time: "10분 전",
    likes: 12,
    comments: 4,
  },
  {
    id: "2",
    category: "일상",
    content: "누구에게도 말하지 못한 이야기를 이곳에 쏟아내니 한결 가볍습니다. 고마워요 너울.",
    time: "32분 전",
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    category: "위로",
    content: "어른이 된다는 건 감정을 숨기는 법을 배우는 게 아니라, 감정을 마주하는 법을 배우는 것 같아요.",
    time: "1시간 전",
    likes: 42,
    comments: 15,
  },
  {
    id: "4",
    category: "질문",
    content: "다들 퇴근 후에는 어떤 파도에 몸을 맡기시나요? 저만의 휴식법을 찾고 싶어요.",
    time: "2시간 전",
    likes: 15,
    comments: 20,
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
  const [posts, setPosts] = React.useState(MOCK_POSTS);

  const filteredPosts = posts.filter((p) => selectedCategory === "전체" || p.category === selectedCategory);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert("파도가 정화되었습니다", "새로운 마음으로 이야기를 나눠보세요.");
    }, 1500);
  };

  React.useEffect(() => {
    // 시뮬레이션 로딩 (Skeleton UI 연출용)
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleReport = (id: string) => {
    Alert.alert("신고 접수", "해당 게시글이 신고되었습니다. 운영진이 검토 후 조치하겠습니다.");
  };

  const handleBlock = (id: string) => {
    Alert.alert("사용자 차단", "해당 사용자의 글을 더 이상 보지 않겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "차단",
        style: "destructive",
        onPress: () => {
          setPosts(posts.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const menuItems = [
    { icon: <User size={22} color="#E0E0E0" />, label: "프로필 계정", onPress: () => setShowMenu(false) },
    { icon: <Settings size={22} color="#E0E0E0" />, label: "환경 설정", onPress: () => setShowMenu(false) },
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
      {/* Header */}
      <View className="px-8 pt-8 pb-4 flex-row justify-between items-center">
        <View className="w-12" />

        <View className="items-center">
          <Text className="text-[#E0E0E0]/50 text-[10px] font-bold tracking-[3px] mb-1">FEBRUARY 14</Text>
          <Text className="text-[#E0E0E0] text-2xl font-bold tracking-tight">당신의 너울</Text>
        </View>

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
            <View key={i} className="bg-[#002845]/20 h-48 rounded-[40px] border border-white/5 animate-pulse" />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          renderItem={({ item }: { item: (typeof MOCK_POSTS)[0] }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate("PostDetail", { post: item })}
              className="bg-[#002845]/40 p-8 rounded-[40px] mb-6 border border-white/5 shadow-sm active:scale-95 transition-transform"
            >
              <View className="flex-row justify-between items-start mb-6">
                <Text className="text-[#E0E0E0] text-lg leading-8 flex-1 font-light">{item.content}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("컨텐츠 관리", "이 게시글에 대해 무엇을 하시겠습니까?", [
                      { text: "신고하기", onPress: () => handleReport(item.id) },
                      { text: "사용자 차단", onPress: () => handleBlock(item.id), style: "destructive" },
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
        style={{ shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}
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
              </View>

              <View className="mt-auto items-center pb-8 border-t border-white/5 pt-8">
                <Text className="text-[#E0E0E0]/20 text-[10px] tracking-[2px]">SWELL v1.0.0</Text>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;
