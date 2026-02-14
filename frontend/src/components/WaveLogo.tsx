import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface WaveLogoProps {
  size?: number;
  color?: string;
}

/**
 * @description '너울'의 정체성을 담은 파도 형상 로고 (SVG)
 */
const WaveLogo: React.FC<WaveLogoProps> = ({ size = 100, color = "#00E0D0" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="waveGradient" x1="0" y1="0" x2="100" y2="100">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="100%" stopColor="#00AFA3" />
        </LinearGradient>
      </Defs>
      {/* Wave Shape 1 */}
      <Path
        d="M20 50C20 50 35 30 50 50C65 70 80 50 80 50"
        stroke="url(#waveGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wave Shape 2 - Below */}
      <Path
        d="M20 70C20 70 35 50 50 70C65 90 80 70 80 70"
        stroke="url(#waveGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Abstract Wave Peak */}
      <Path d="M40 30C40 30 50 15 60 30" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </Svg>
  );
};

export default WaveLogo;
