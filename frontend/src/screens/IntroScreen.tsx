import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from "react-native";
import WaveLogo from "../components/WaveLogo";

const { width } = Dimensions.get("window");

/**
 * @description 스푼(Spoon) 스타일의 감성적인 인트로 화면
 */
const IntroScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // 인트로 애니메이션 시퀀스
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // 3.5초 후 로그인 화면으로 이동
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative Glow */}
      <View style={styles.glow} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <WaveLogo size={60} color="#001220" />
        </View>
        <Text style={styles.brandName}>너울</Text>
        <Text style={styles.slogan}>진심이 파도처럼 밀려오는 곳</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>SWELL AUDIO SOCIAL</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001220",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: "rgba(0, 224, 208, 0.05)",
    top: -width * 0.5,
    right: -width * 0.5,
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#00E0D0",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#00E0D0",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0px 10px 20px rgba(0, 224, 208, 0.3)",
      },
    }),
  },
  logoText: {
    fontSize: 50,
    fontWeight: "900",
    color: "#001220",
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E0E0E0",
    letterSpacing: 8,
    marginBottom: 12,
  },
  slogan: {
    fontSize: 16,
    color: "#E0E0E0",
    opacity: 0.6,
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 60,
  },
  footerText: {
    fontSize: 12,
    color: "#E0E0E0",
    opacity: 0.3,
    letterSpacing: 4,
  },
});

export default IntroScreen;
