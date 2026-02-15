import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from "react-native";
import {
  ArrowLeft,
  Bell,
  EyeOff,
  Database,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Trash2,
  Volume2,
} from "lucide-react-native";

/**
 * @description 환경 설정 화면
 */
const SettingsScreen = ({ navigation }: any) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const [isVoiceModEnabled, setIsVoiceModEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", onPress: () => navigation.replace("Login"), style: "destructive" },
    ]);
  };

  const SettingItem = ({ icon, label, rightElement, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between p-6 border-b border-white/5"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center mr-4">{icon}</View>
        <Text className="text-[#E0E0E0] font-medium">{label}</Text>
      </View>
      {rightElement ? rightElement : <ChevronRight size={20} color="#E0E0E0" opacity={0.3} />}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-[#E0E0E0]/40 text-xs font-bold tracking-widest mt-10 mb-4 px-2 uppercase">{title}</Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#001220]">
      {/* Header */}
      <View className="px-8 py-8 flex-row justify-between items-center border-b border-white/5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={28} color="#E0E0E0" />
        </TouchableOpacity>
        <Text className="text-[#E0E0E0] text-lg font-bold">환경 설정</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-8 pb-20" showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <SectionHeader title="알림" />
        <View className="bg-[#002845]/40 rounded-[35px] border border-white/5 overflow-hidden">
          <SettingItem
            icon={<Bell size={20} color="#00E0D0" />}
            label="푸시 알림"
            rightElement={
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#001220", true: "#00E0D0" }}
                thumbColor="#E0E0E0"
              />
            }
          />
        </View>

        {/* Audio & Playback Section */}
        <SectionHeader title="재생 및 음성" />
        <View className="bg-[#002845]/40 rounded-[35px] border border-white/5 overflow-hidden">
          <SettingItem
            icon={<Volume2 size={20} color="#E0E0E0" />}
            label="오디오 자동 재생"
            rightElement={
              <Switch
                value={isAutoPlayEnabled}
                onValueChange={setIsAutoPlayEnabled}
                trackColor={{ false: "#001220", true: "#00E0D0" }}
                thumbColor="#E0E0E0"
              />
            }
          />
          <SettingItem
            icon={<Shield size={20} color="#00E0D0" />}
            label="음성 변조(익명성 강화)"
            rightElement={
              <Switch
                value={isVoiceModEnabled}
                onValueChange={setIsVoiceModEnabled}
                trackColor={{ false: "#001220", true: "#00E0D0" }}
                thumbColor="#E0E0E0"
              />
            }
          />
        </View>

        {/* Privacy Section */}
        <SectionHeader title="개인정보 및 보안" />
        <View className="bg-[#002845]/40 rounded-[35px] border border-white/5 overflow-hidden">
          <SettingItem icon={<EyeOff size={20} color="#E0E0E0" />} label="차단된 사용자 관리" onPress={() => {}} />
          <SettingItem
            icon={<Trash2 size={20} color="#E7433C" />}
            label="활동 기록 삭제"
            onPress={() => Alert.alert("삭제 완료", "모든 활동 기록이 안전하게 삭제되었습니다.")}
          />
        </View>

        {/* Support & Others */}
        <SectionHeader title="지원 및 정보" />
        <View className="bg-[#002845]/40 rounded-[35px] border border-white/5 overflow-hidden">
          <SettingItem
            icon={<Info size={20} color="#E0E0E0" />}
            label="앱 버전"
            rightElement={<Text className="text-[#E0E0E0]/30 text-xs">v1.0.0</Text>}
          />
          <SettingItem icon={<Database size={20} color="#E0E0E0" />} label="오픈소스 라이선스" onPress={() => {}} />
        </View>

        {/* Account Management */}
        <View className="mt-12 mb-20 px-2 space-y-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full py-6 rounded-[30px] border border-[#E7433C]/30 items-center justify-center"
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#E7433C" />
              <Text className="text-[#E7433C] font-bold ml-2">로그아웃</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
