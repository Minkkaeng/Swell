/**
 * @description Swell API 서비스 유틸리티 (Frontend-Only Mock Mode)
 * 백엔드 연결 없이 프론트엔드 단독 확인을 위해 모든 요청을 모의(Mock) 처리합니다.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // 게시글 관련
  posts: {
    // 목록 조회
    get: async (page = 1, limit = 20) => {
      await sleep(800); // 네트워크 지연 시뮬레이션
      return []; // 빈 배열을 반환하면 각 화면에서 MOCK_POSTS를 사용하도록 설계됨
    },
    // 작성
    create: async (data: { content: string; hasVote?: boolean; userId?: string }) => {
      await sleep(1000);
      return { success: true, message: "게시글이 성공적으로 저장되었습니다." };
    },
    // 반응 (좋아요 등)
    react: async (id: string, type: "like" | "dislike", userId: string) => {
      await sleep(300);
      return { success: true };
    },
  },

  // 댓글 관련
  comments: {
    // 작성
    create: async (postId: string, data: { content: string; userId: string; parentId?: number | string }) => {
      await sleep(500);
      return { success: true, message: "댓글이 등록되었습니다." };
    },
  },

  // 알람 관련
  notifications: {
    get: async (userId: string) => {
      await sleep(500);
      return [];
    },
  },

  // AI/STT 관련
  stt: {
    // 음성 인식 Mock API
    recognize: async () => {
      await sleep(1500);
      return {
        text: "오늘 하루는 정말 긴 파도 같았어요. 하지만 그 끝에는 고요함이 기다리고 있겠죠.",
      };
    },
  },
};
