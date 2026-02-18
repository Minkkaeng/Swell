import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Switch, Alert, Image } from "react-native";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  ShieldCheck,
  Bell,
  Lock,
  MessageCircle,
  Award,
  Waves,
  Heart,
  User,
  Gem,
  Coins,
} from "lucide-react-native";
import { useUserStore } from "../store/userStore";

/**
 * @description 프로필 및 계정 설정 화면
 */
const ProfileScreen = ({ navigation }: any) => {
  const { status, dailyTokens } = useUserStore();
  const [nickname, setNickname] = useState("푸른파도");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // 샘플 프로필 이미지 리스트 (데모용)
  const SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  ];

  const handlePickImage = () => {
    Alert.alert("프로필 이미지 설정", "어떤 방식으로 이미지를 설정할까요?", [
      { text: "기존 이미지 제거", onPress: () => setProfileImage(null), style: "destructive" },
      {
        text: "새 이미지 선택 (데모)",
        onPress: () => {
          const randomImg = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
          setProfileImage(randomImg);
        },
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  const stats = [
    { icon: <Waves size={20} color="#00E0D0" />, label: "담은 파도", value: "12" },
    { icon: <Heart size={20} color="#FF6B6B" />, label: "받은 공감", value: "128" },
    { icon: <MessageCircle size={20} color="#E0E0E0" />, label: "나눈 대화", value: "45" },
  ];

  const badges = [
    { title: "첫 물결", icon: "🌊", date: "2024.01.12" },
    { title: "깊은 경청", icon: "💎", date: "2024.02.05" },
    { title: "따뜻한 햇살", icon: "🌞", date: "2024.02.14" },
  ];

  const handleSave = () => {
    Alert.alert("변경 완료", "프로필 정보가 안전하게 저장되었습니다.");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <Text className="text-[#E0E0E0] text-lg font-bold">프로필 설정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-[#00E0D0] font-bold">저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        {/* Profile Identity Section */}
        <View className="items-center mt-10 mb-8">
          <View className="relative">
            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={0.9}
              className="w-28 h-28 rounded-[45px] bg-[#002845] border-2 border-[#00E0D0]/30 items-center justify-center shadow-2xl overflow-hidden"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <User size={60} color="#00E0D0" opacity={0.5} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickImage}
              className="absolute bottom-0 right-[-10px] w-10 h-10 bg-[#00E0D0] rounded-2xl items-center justify-center border-4 border-[#001220]"
            >
              <Camera size={20} color="#001220" />
            </TouchableOpacity>
          </View>

          <View className="mt-8 w-full items-center">
            <TextInput
              className="text-[#E0E0E0] text-2xl font-bold text-center w-full"
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임 입력"
              placeholderTextColor="#E0E0E030"
            />
            <View className="bg-[#00E0D0]/10 px-3 py-1 rounded-full flex-row items-center mt-3">
              <ShieldCheck size={12} color="#00E0D0" />
              <Text className="text-[#00E0D0] text-[10px] font-bold ml-1.5 tracking-tighter">본인인증 완료</Text>
            </View>
          </View>
        </View>

        {/* Assets Dashboard */}
        <View className="bg-[#002845]/60 p-6 rounded-[35px] border border-[#00E0D0]/20 mb-10 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-[#00E0D0]/10 rounded-2xl items-center justify-center">
              <Gem size={24} color="#00E0D0" />
            </View>
            <View className="ml-4">
              <Text className="text-[#E0E0E0]/40 text-[10px] font-bold mb-1">토큰 잔액</Text>
              <Text className="text-white text-xl font-bold">{status === "VIP" ? "무제한" : dailyTokens}</Text>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-[#E0E0E0]/40 text-[10px] font-bold mb-1">멤버십 등급</Text>
            <View
              className={`px-3 py-1 rounded-full border ${
                status === "VIP" ? "bg-[#A78BFA]/10 border-[#A78BFA]/30" : "bg-white/5 border-white/10"
              }`}
            >
              <Text className={`text-[11px] font-bold ${status === "VIP" ? "text-[#A78BFA]" : "text-[#E0E0E0]/60"}`}>
                {status === "VIP" ? "PREMIUM VIP" : "STANDARD"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between mb-10">
          {stats.map((stat, i) => (
            <View
              key={i}
              className="bg-[#002845]/40 flex-1 mx-1.5 p-5 rounded-[30px] items-center border border-white/5"
            >
              <View className="mb-2">{stat.icon}</View>
              <Text className="text-[#E0E0E0] text-lg font-bold mb-1">{stat.value}</Text>
              <Text className="text-[#E0E0E0]/30 text-[10px] font-bold">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-6 px-2">
            <Text className="text-[#E0E0E0]/40 text-xs font-bold tracking-widest">COLLECTED BADGES</Text>
            <TouchableOpacity>
              <Text className="text-[#00E0D0] text-xs font-bold">전체보기</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {badges.map((badge, i) => (
              <View key={i} className="bg-[#002845]/20 p-5 rounded-[35px] items-center mr-4 border border-white/5 w-28">
                <Text className="text-3xl mb-3">{badge.icon}</Text>
                <Text className="text-[#E0E0E0] text-[11px] font-bold mb-1">{badge.title}</Text>
                <Text className="text-[#E0E0E0]/20 text-[9px]">{badge.date}</Text>
              </View>
            ))}
            <TouchableOpacity className="w-28 h-[130px] rounded-[35px] border-2 border-dashed border-white/5 items-center justify-center">
              <Award size={24} color="#E0E0E0" opacity={0.1} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Note: Settings moved to Environment Settings screen */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
