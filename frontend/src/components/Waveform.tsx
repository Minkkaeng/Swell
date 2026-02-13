import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../styles/theme";

const { width } = Dimensions.get("window");

/**
 * @description 음성 녹음 시 파동 애니메이션
 */
const Waveform = ({ isRecording }: { isRecording: boolean }) => {
  const animValues = useRef([...Array(15)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isRecording) {
      const animations = animValues.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + Math.random() * 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400 + Math.random() * 300,
              useNativeDriver: true,
            }),
          ]),
        );
      });
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {animValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: COLORS.midnightCalm.point,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 100],
              }),
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    width: "100%",
  },
  bar: {
    width: 6,
    marginHorizontal: 3,
    borderRadius: 3,
  },
});

export default Waveform;
