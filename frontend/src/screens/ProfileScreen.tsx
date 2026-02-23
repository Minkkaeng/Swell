import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Modal } from "react-native";
import { ArrowLeft, ChevronRight, ShieldCheck, MessageCircle, Waves, Heart, User, Award, X } from "lucide-react-native";
import { useUserStore } from "../store/userStore";
import { THEMES } from "../styles/theme";
import { api } from "../services/api";

/**
 * @description 프로필 및 계정 설정 화면
 */
const ProfileScreen = ({ navigation }: any) => {
  const {
    userId,
    nickname: storeNickname,
    setNickname: storeSetNickname,
    checkNicknameAvailability,
    following,
    toggleFollow,
    appTheme,
  } = useUserStore();
  const [inputNickname, setInputNickname] = useState(storeNickname);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<"posts" | "comments">("posts");
  const [nicknameFeedback, setNicknameFeedback] = useState<{ available: boolean; message: string }>({
    available: true,
    message: "",
  });

  // 진화형 뱃지 핵심 데이터
  const badgeCategories = [
    {
      id: "Commenter",
      label: "소통의 파도",
      levels: [
        {
          tier: "BRONZE",
          title: "초보 댓글러",
          icon: "💬",
          color: "#CD7F32",
          req: "댓글 5개",
          achieved: true,
          date: "2024.01.12",
        },
        {
          tier: "SILVER",
          title: "숙련 댓글러",
          icon: "🌊",
          color: "#C0C0C0",
          req: "댓글 20개",
          achieved: true,
          date: "2024.02.05",
        },
        {
          tier: "GOLD",
          title: "마스터 댓글러",
          icon: "👑",
          color: "#FFD700",
          req: "댓글 100개",
          achieved: false,
          date: "진행 중",
        },
      ],
    },
    {
      id: "Writer",
      label: "이야기의 너울",
      levels: [
        {
          tier: "BRONZE",
          title: "첫 기록자",
          icon: "📝",
          color: "#CD7F32",
          req: "첫 게시글",
          achieved: true,
          date: "2024.01.12",
        },
        {
          tier: "SILVER",
          title: "꾸준한 기록자",
          icon: "🌊",
          color: "#C0C0C0",
          req: "게시글 10개",
          achieved: false,
          date: "진행 중",
        },
        {
          tier: "GOLD",
          title: "이야기 장인",
          icon: "🐚",
          color: "#FFD700",
          req: "게시글 50개",
          achieved: false,
          date: "미달성",
        },
      ],
    },
    {
      id: "Like",
      label: "마음의 울림",
      levels: [
        {
          tier: "BRONZE",
          title: "공감의 시작",
          icon: "❤️",
          color: "#CD7F32",
          req: "좋아요 10회",
          achieved: true,
          date: "2024.02.14",
        },
        {
          tier: "SILVER",
          title: "깊은 울림",
          icon: "✨",
          color: "#C0C0C0",
          req: "좋아요 50회",
          achieved: false,
          date: "진행 중",
        },
        {
          tier: "GOLD",
          title: "진심의 아이콘",
          icon: "🔥",
          color: "#FFD700",
          req: "좋아요 200회",
          achieved: false,
          date: "미달성",
        },
      ],
    },
    {
      id: "Special",
      label: "스페셜 기록",
      levels: [
        {
          tier: "SPECIAL",
          title: "새벽의 기록가",
          icon: "🌙",
          color: "#A78BFA",
          req: "새벽 기록",
          achieved: true,
          date: "2024.02.20",
        },
        {
          tier: "VIP",
          title: "빛나는 진주",
          icon: "✨",
          color: "#00E0D0",
          req: "VIP 회원",
          achieved: false,
          date: "미가입",
        },
      ],
    },
  ];

  // 현재 표시할 가장 높은 등급의 뱃지 추출 로직
  const activeBadges = badgeCategories.map((cat) => {
    const achievedLevels = cat.levels.filter((l) => l.achieved);
    const currentLevel = achievedLevels.length > 0 ? achievedLevels[achievedLevels.length - 1] : cat.levels[0];
    const nextLevel = cat.levels[achievedLevels.length] || null;
    return { ...currentLevel, categoryLabel: cat.label, nextLevel };
  });

  const stats = [
    { icon: <Waves size={20} color={THEMES[appTheme].accent} />, label: "담은 파도", value: "12" },
    { icon: <Heart size={20} color="#FF6B6B" />, label: "받은 공감", value: "128" },
    { icon: <MessageCircle size={20} color={THEMES[appTheme].text} />, label: "나눈 대화", value: "45" },
  ];

  const handleNicknameChange = (text: string) => {
    setInputNickname(text);
    const result = checkNicknameAvailability(text);
    setNicknameFeedback(result);
  };

  const handleToggleFollow = async (targetId: string) => {
    try {
      await api.users.toggleFollow(userId || "anonymous", targetId);
      // nickname을 굳이 넘기지 않아도 filter 로직에서 id 기준으로 삭제되므로 정상 작동합니다.
      toggleFollow(targetId);
    } catch (error) {
      console.error("Toggle follow error:", error);
      Alert.alert("알림", "언팔로우 처리에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (inputNickname === storeNickname) {
      setIsSaving(false);
      Alert.alert("저장 완료", "프로필 설정이 저장되었습니다.");
      setIsEditing(false);
      return;
    }

    const { success, message } = storeSetNickname(inputNickname);
    setIsSaving(false);
    if (success) {
      Alert.alert("저장 완료", "프로필 설정이 저장되었습니다.");
      setNicknameFeedback({ available: true, message: "" });
      setIsEditing(false);
    } else {
      Alert.alert("저장 실패", message);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: THEMES[appTheme].bg }} className="flex-1">
      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color={THEMES[appTheme].text} />
        </TouchableOpacity>
        <Text style={{ color: THEMES[appTheme].text }} className="text-lg font-bold">
          프로필 설정
        </Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave} disabled={isSaving} className="px-4 py-2">
            <Text
              style={{ color: isSaving ? THEMES[appTheme].accent + "4D" : THEMES[appTheme].accent }}
              className="font-bold"
            >
              {isSaving ? "저장 중..." : "저장"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} className="px-4 py-2">
            <Text style={{ color: THEMES[appTheme].text }} className="font-bold">
              수정
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
        {/* Profile Identity Section */}
        <View
          style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
          className="items-center mt-6 mb-10 p-10 rounded-[40px] border border-white/5"
        >
          <View className="w-full items-center">
            <Text
              style={{ color: THEMES[appTheme].accent }}
              className="text-[10px] font-bold mb-6 tracking-[3px] uppercase"
            >
              Identity
            </Text>
            <View
              className={`w-full flex-row items-center px-6 py-5 rounded-2xl border`}
              style={{
                backgroundColor: isEditing ? THEMES[appTheme].bg : THEMES[appTheme].surface + "1A",
                borderColor: isEditing ? THEMES[appTheme].accent + "66" : "rgba(255,255,255,0.05)",
              }}
            >
              <User size={20} color={isEditing ? THEMES[appTheme].accent : THEMES[appTheme].text} opacity={0.5} />
              <TextInput
                style={{ color: isEditing ? THEMES[appTheme].text : THEMES[appTheme].text + "80" }}
                className="flex-1 text-xl font-bold ml-4"
                value={inputNickname}
                onChangeText={handleNicknameChange}
                placeholder="닉네임 입력"
                placeholderTextColor={THEMES[appTheme].text + "30"}
                maxLength={10}
                editable={isEditing}
              />
            </View>
            {nicknameFeedback.message ? (
              <Text
                className="text-[11px] mt-3 font-bold px-2"
                style={{ color: nicknameFeedback.available ? THEMES[appTheme].accent : "#FF6B6B" }}
              >
                {nicknameFeedback.message}
              </Text>
            ) : null}
            <View
              style={{ backgroundColor: THEMES[appTheme].text + "0D" }}
              className="px-4 py-2 rounded-full flex-row items-center mt-6"
            >
              <ShieldCheck size={14} color={THEMES[appTheme].accent} />
              <Text
                style={{ color: THEMES[appTheme].text }}
                className="opacity-60 text-[11px] font-bold ml-2 tracking-tighter"
              >
                본인인증 완료 회원
              </Text>
            </View>
            <Text
              style={{ color: THEMES[appTheme].text }}
              className="opacity-30 text-[10px] mt-4 text-center leading-4"
            >
              닉네임은 첫 등록 이후{"\n"}30일에 한 번만 수정이 가능합니다.
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between mb-10">
          {stats.map((stat, i) => (
            <View
              key={i}
              style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
              className="flex-1 mx-1.5 p-5 rounded-[30px] items-center border border-white/5"
            >
              <View className="mb-2">{stat.icon}</View>
              <Text style={{ color: THEMES[appTheme].text }} className="text-lg font-bold mb-1">
                {stat.value}
              </Text>
              <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-[10px] font-bold">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* My Activity Section */}
        <View className="mb-10">
          <Text
            style={{ color: THEMES[appTheme].text }}
            className="opacity-40 text-xs font-bold tracking-widest px-2 mb-6"
          >
            기록 관리
          </Text>

          <TouchableOpacity
            onPress={() => {
              setActivityType("posts");
              setShowActivityModal(true);
            }}
            style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
            className="flex-row items-center justify-between p-6 rounded-[35px] border border-white/5 mb-3"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: "rgba(255,107,107,0.1)" }}
                className="w-12 h-12 rounded-2xl items-center justify-center"
              >
                <Waves size={24} color="#FF6B6B" />
              </View>
              <View className="ml-4">
                <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-base">
                  내가 띄운 파도
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-[11px] mt-1">
                  작성한 글 모아보기
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={THEMES[appTheme].text} opacity={0.3} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActivityType("comments");
              setShowActivityModal(true);
            }}
            style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
            className="flex-row items-center justify-between p-6 rounded-[35px] border border-white/5"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: "rgba(0, 224, 208, 0.1)" }}
                className="w-12 h-12 rounded-2xl items-center justify-center"
              >
                <MessageCircle size={24} color="#00E0D0" />
              </View>
              <View className="ml-4">
                <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-base">
                  내가 남긴 자국
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-[11px] mt-1">
                  작성한 댓글 모아보기
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={THEMES[appTheme].text} opacity={0.3} />
          </TouchableOpacity>
        </View>

        {/* Social Connection Section */}
        <View className="mb-10">
          <Text
            style={{ color: THEMES[appTheme].text }}
            className="opacity-40 text-xs font-bold tracking-widest px-2 mb-6"
          >
            SOCIAL CONNECTIONS
          </Text>
          <TouchableOpacity
            onPress={() => setShowFollowingModal(true)}
            style={{ backgroundColor: THEMES[appTheme].surface + "33" }}
            className="flex-row items-center justify-between p-6 rounded-[35px] border border-white/5"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: THEMES[appTheme].accent + "1A" }}
                className="w-12 h-12 rounded-2xl items-center justify-center"
              >
                <User size={24} color={THEMES[appTheme].accent} />
              </View>
              <View className="ml-4">
                <Text style={{ color: THEMES[appTheme].text }} className="font-bold text-base">
                  팔로잉 관리
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-xs mt-1">
                  관심 있는 사용자 {following.length}명
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={THEMES[appTheme].text} opacity={0.3} />
          </TouchableOpacity>
        </View>

        {/* Badges Section */}
        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-6 px-2">
            <Text style={{ color: THEMES[appTheme].text }} className="opacity-40 text-xs font-bold tracking-widest">
              COLLECTED BADGES
            </Text>
            <TouchableOpacity onPress={() => setShowAllBadges(true)}>
              <Text style={{ color: THEMES[appTheme].accent }} className="text-xs font-bold">
                전체보기
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {activeBadges.map((badge, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: THEMES[appTheme].surface + "33",
                  borderColor: !badge.achieved ? "rgba(255,255,255,0.05)" : `${badge.color}66`,
                  shadowColor: badge.color,
                  shadowOpacity: badge.achieved ? 0.3 : 0,
                  shadowRadius: 10,
                }}
                className="p-5 rounded-[35px] items-center mr-4 border w-32 relative overflow-hidden"
              >
                {badge.tier === "GOLD" && (
                  <View className="absolute top-0 right-0 left-0 bottom-0 bg-[#FFD700]/5 animate-pulse" />
                )}
                <View className="px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: `${badge.color}22` }}>
                  <Text style={{ color: badge.color, fontSize: 8, fontWeight: "bold" }}>{badge.tier}</Text>
                </View>
                <Text className="text-4xl mb-3" style={{ opacity: badge.achieved ? 1 : 0.2 }}>
                  {badge.icon}
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="text-[11px] font-bold mb-1" numberOfLines={1}>
                  {badge.title}
                </Text>
                {badge.nextLevel && (
                  <View className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <View
                      style={{ backgroundColor: THEMES[appTheme].accent + "66", width: "60%" }}
                      className="h-full"
                    />
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={{ borderColor: THEMES[appTheme].text + "0D" }}
              className="w-28 h-[130px] rounded-[35px] border-2 border-dashed items-center justify-center"
            >
              <Award size={24} color={THEMES[appTheme].text} opacity={0.1} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Following List Modal */}
      <Modal visible={showFollowingModal} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-24">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center mb-4">
              <View>
                <Text
                  style={{ color: THEMES[appTheme].accent }}
                  className="text-[10px] font-bold tracking-[3px] mb-2 uppercase"
                >
                  SOCIAL
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                  팔로잉 목록
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFollowingModal(false)}
                style={{ backgroundColor: THEMES[appTheme].text + "1A" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
              {following.length === 0 ? (
                <View className="items-center justify-center py-20 opacity-20">
                  <User size={64} color={THEMES[appTheme].text} />
                  <Text style={{ color: THEMES[appTheme].text }} className="mt-4 font-bold">
                    팔로우 중인 사용자가 없습니다.
                  </Text>
                </View>
              ) : (
                <View className="space-y-4">
                  {following.map((person) => (
                    <View
                      key={person.id}
                      style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
                      className="flex-row items-center justify-between p-5 rounded-3xl border border-white/5 mb-4"
                    >
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: THEMES[appTheme].bg }}
                          className="w-12 h-12 rounded-2xl items-center justify-center border border-white/5"
                        >
                          <User size={24} color={THEMES[appTheme].text} opacity={0.3} />
                        </View>
                        <Text style={{ color: THEMES[appTheme].text }} className="ml-4 font-bold">
                          {person.nickname}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert("팔로우 취소", `${person.nickname}님을 팔로우 취소하시겠습니까?`, [
                            { text: "취소", style: "cancel" },
                            { text: "언팔로우", style: "destructive", onPress: () => handleToggleFollow(person.id) },
                          ]);
                        }}
                        style={{ backgroundColor: THEMES[appTheme].bg + "99" }}
                        className="px-4 py-2 rounded-full border border-white/10"
                      >
                        <Text style={{ color: THEMES[appTheme].text }} className="text-xs font-bold opacity-60">
                          언팔로우
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Badge Modal */}
      <Modal visible={showAllBadges} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-24">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center mb-6">
              <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                나의 뱃지 컬렉션
              </Text>
              <TouchableOpacity
                onPress={() => setShowAllBadges(false)}
                style={{ backgroundColor: THEMES[appTheme].text + "1A" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
              {badgeCategories.map((cat) => (
                <View key={cat.id} className="mb-12">
                  <View className="flex-row justify-between items-end mb-6 px-1">
                    <Text
                      style={{ color: THEMES[appTheme].accent }}
                      className="text-[10px] font-bold tracking-[3px] uppercase"
                    >
                      {cat.label}
                    </Text>
                    <Text style={{ color: THEMES[appTheme].text }} className="opacity-30 text-[10px]">
                      TOTAL 3 STEPS
                    </Text>
                  </View>
                  <View
                    style={{ backgroundColor: THEMES[appTheme].surface + "66" }}
                    className="rounded-[40px] border border-white/5 p-8"
                  >
                    <View className="flex-row items-center justify-between">
                      {cat.levels.map((lv, idx) => (
                        <React.Fragment key={lv.tier}>
                          <View className="items-center">
                            <View
                              className={`w-16 h-16 rounded-full items-center justify-center border-2 mb-3 ${lv.achieved ? "" : "opacity-20 border-dashed"}`}
                              style={{
                                borderColor: lv.achieved ? lv.color : "rgba(255,255,255,0.1)",
                                backgroundColor: lv.achieved ? `${lv.color}11` : "transparent",
                              }}
                            >
                              <Text className="text-2xl">{lv.icon}</Text>
                            </View>
                            <Text
                              style={{
                                color: lv.achieved ? lv.color : THEMES[appTheme].text + "33",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            >
                              {lv.tier}
                            </Text>
                          </View>
                          {idx < cat.levels.length - 1 && (
                            <View
                              style={{ backgroundColor: THEMES[appTheme].text + "0D" }}
                              className="h-[2px] flex-1 mx-2 -mt-4"
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Activity List Modal */}
      <Modal visible={showActivityModal} animationType="slide" transparent={true}>
        <View style={{ backgroundColor: THEMES[appTheme].bg + "F2" }} className="flex-1 pt-24">
          <View
            style={{ backgroundColor: THEMES[appTheme].surface }}
            className="flex-1 rounded-t-[40px] border-t border-white/10"
          >
            <View className="px-8 py-8 flex-row justify-between items-center mb-4">
              <View>
                <Text
                  style={{ color: THEMES[appTheme].accent }}
                  className="text-[10px] font-bold tracking-[3px] mb-2 uppercase"
                >
                  ACTIVITY
                </Text>
                <Text style={{ color: THEMES[appTheme].text }} className="text-2xl font-bold">
                  {activityType === "posts" ? "내가 띄운 파도" : "내가 남긴 자국"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowActivityModal(false)}
                style={{ backgroundColor: THEMES[appTheme].text + "1A" }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <X size={24} color={THEMES[appTheme].text} />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-8" showsVerticalScrollIndicator={false}>
              <View className="items-center justify-center py-20 opacity-20">
                <Waves size={64} color={THEMES[appTheme].text} />
                <Text style={{ color: THEMES[appTheme].text }} className="mt-4 font-bold text-center leading-6">
                  {activityType === "posts"
                    ? "아직 작성하신 글이 없습니다.\n마음을 띄워보세요."
                    : "아직 작성하신 댓글이 없습니다.\n따뜻한 마음을 나누어보세요."}
                </Text>
              </View>
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
