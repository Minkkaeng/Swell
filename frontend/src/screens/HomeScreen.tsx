import React from "react";
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { MessageSquare, Heart, Share2, Plus, Menu, X, User, Settings, LogOut } from "lucide-react-native";
import { Modal } from "react-native";

const CATEGORIES = ["전체", "고민", "일상", "위로", "감사", "질문"];

const MOCK_POSTS = [
  {
    id: "1",
    content: "오늘따라 파도가 거칠게 느껴지네요. 하지만 이 정적 속에 나만의 평온이 있습니다.",
    time: "10분 전",
    likes: 12,
    comments: 4,
  },
  {
    id: "2",
    content: "누구에게도 말하지 못한 이야기를 이곳에 쏟아내니 한결 가볍습니다. 고마워요 너울.",
    time: "32분 전",
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    content: "어른이 된다는 건 감정을 숨기는 법을 배우는 게 아니라, 감정을 마주하는 법을 배우는 것 같아요.",
    time: "1시간 전",
    likes: 42,
    comments: 15,
  },
];

/**
 * @description 익명 커뮤니티 홈 화면
 */
const HomeScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = React.useState("전체");
  const [showMenu, setShowMenu] = React.useState(false);

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

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}
          renderItem={({ item }: { item: string }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              className={`px-6 py-2.5 rounded-full mr-3 border ${
                selectedCategory === item ? "bg-[#00E0D0] border-[#00E0D0]" : "bg-[#002845]/40 border-white/5"
              }`}
            >
              <Text
                className={`text-sm font-bold ${selectedCategory === item ? "text-[#001220]" : "text-[#E0E0E0]/60"}`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item: string) => item}
        />
      </View>

      <FlatList
        data={MOCK_POSTS}
        renderItem={({ item }: { item: (typeof MOCK_POSTS)[0] }) => (
          <View className="bg-[#002845]/40 p-8 rounded-[40px] mb-6 border border-white/5 shadow-sm">
            <Text className="text-[#E0E0E0] text-lg leading-8 mb-6 font-light">{item.content}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-[#E0E0E0]/30 text-xs font-medium">{item.time}</Text>
              <View className="flex-row items-center">
                <TouchableOpacity className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full mr-3">
                  <Heart size={16} color="#00E0D0" fill={item.likes > 20 ? "#00E0D0" : "transparent"} />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center px-4 py-2 bg-[#001220]/40 rounded-full">
                  <MessageSquare size={16} color="#E0E0E0" />
                  <Text className="text-[#E0E0E0]/60 text-xs font-bold ml-2">{item.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button for Recording */}
      <TouchableOpacity
        onPress={() => navigation.navigate("STT")}
        activeOpacity={0.8}
        className="absolute bottom-12 right-8 w-20 h-20 bg-[#00E0D0] rounded-[30px] items-center justify-center shadow-2xl"
        style={{ shadowColor: "#00E0D0", shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}
      >
        <Plus size={36} color="#001220" />
      </TouchableOpacity>

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
