const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { checkRejoinEligibility } = require("./auth/registrationCheck");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 가상 DB 객체 (실제 DB 연동 전 예시)
const mockDb = {
  query: async (text, params) => {
    // 테스트용 데이터: 'banned_user_ci'는 10일 전에 탈퇴함
    if (params[0] === "banned_user_ci") {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      return { rows: [{ deleted_at: tenDaysAgo }] };
    }
    return { rows: [] };
  },
};

/**
 * @description 회원가입 시도 API
 */
app.post("/api/auth/register", async (req, res) => {
  const { ciDiValue, name, age } = req.body;

  // 1. 성인 인증 확인 (19세 미만 차단)
  if (age < 19) {
    return res.status(403).json({
      success: false,
      message: "너울(Swell)은 19세 이상만 이용 가능한 성인 전용 서비스입니다.",
    });
  }

  // 2. 90일 재가입 제한 확인
  try {
    const eligibility = await checkRejoinEligibility(mockDb, ciDiValue);

    if (!eligibility.eligible) {
      return res.status(403).json({
        success: false,
        message: eligibility.message,
        remainingDays: eligibility.remainingDays,
      });
    }

    // 3. 가입 로직 진행 (생략)
    res.status(200).json({
      success: true,
      message: "회원가입이 가능합니다.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`너울(Swell) 메인 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
