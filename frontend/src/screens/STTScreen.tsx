import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { COLORS } from "../styles/theme";
import Waveform from "../components/Waveform";

/**
 * @description STT 입력 화면 (Midnight Calm 테마)
 */
const STTScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 실게 STT 로직 (react-native-voice 등) 연동 지점
    if (!isRecording) {
      setRecognizedText("감정을 쏟아내는 중...");
    } else {
      setRecognizedText("방금 하신 말씀이 기록되었습니다. (No LLM 적용)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>너울 (Swell)</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.prompt}>
            {isRecording ? "속에 담아둔 마음을 쏟아내세요" : "파도에 감정을 실어 보내세요"}
          </Text>
          <Text style={styles.resultText}>{recognizedText}</Text>
        </View>

        <View style={styles.waveContainer}>
          <Waveform isRecording={isRecording} />
        </View>

        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: isRecording ? "#555" : COLORS.midnightCalm.point }]}
          onPress={toggleRecording}
        >
          <Text style={styles.buttonText}>{isRecording ? "멈추기" : "말하기 시작"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightCalm.background,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    color: COLORS.midnightCalm.text,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  textContainer: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  prompt: {
    color: COLORS.midnightCalm.text,
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 20,
  },
  resultText: {
    color: COLORS.midnightCalm.text,
    fontSize: 20,
    textAlign: "center",
    lineHeight: 30,
  },
  waveContainer: {
    height: 150,
    justifyContent: "center",
  },
  recordButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default STTScreen;
