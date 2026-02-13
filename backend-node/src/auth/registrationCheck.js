/**
 * @description 탈퇴 후 90일 이내 재가입 여부를 확인하는 유틸리티
 */
const checkRejoinEligibility = async (db, ciDiValue) => {
  try {
    // DB의 deleted_users 테이블에서 CI/DI 값을 기준으로 조회
    // 실제 운영 환경에서는 PASS 연동 등으로 얻은 CI/DI를 사용합니다.
    const query = "SELECT deleted_at FROM deleted_users WHERE user_identifier = $1 ORDER BY deleted_at DESC LIMIT 1";
    const result = await db.query(query, [ciDiValue]);

    if (result.rows.length > 0) {
      const deletedAt = new Date(result.rows[0].deleted_at);
      const now = new Date();

      // 날짜 차이 계산 (밀리초 -> 일)
      const diffTime = now - deletedAt;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 90) {
        return {
          eligible: false,
          remainingDays: 90 - diffDays,
          message: `탈퇴 후 90일이 지나지 않았습니다. ${90 - diffDays}일 후에 가입이 가능합니다.`,
        };
      }
    }

    return { eligible: true };
  } catch (error) {
    console.error("재가입 검증 오류:", error);
    throw new Error("재가입 검증 서버 오류");
  }
};

module.exports = { checkRejoinEligibility };
