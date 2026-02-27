/**
 * @description Swell API 서비스 유틸리티 (Actual Backend Integration)
 */

import { useUserStore } from "../store/userStore";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? "http://10.0.2.2:3000" : "https://swell-backend.onrender.com");
const BASE_URL_FASTAPI = process.env.EXPO_PUBLIC_FASTAPI_URL || "http://localhost:8000";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getHeaders = (isMultipart = false) => {
  const token = useUserStore.getState().token;
  const headers: any = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // 게시글 관련
  posts: {
    // 목록 조회
    get: async (page = 1, limit = 20, filter = "all") => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts?page=${page}&limit=${limit}&filter=${filter}`, {
          headers: getHeaders(),
        });
        const data = await response.json();
        return data.success ? data.posts || data.data || [] : [];
      } catch (error) {
        console.error("API Get Posts Error:", error);
        return [];
      }
    },
    // 작성
    create: async (data: {
      content: string;
      title?: string;
      category?: string;
      nickname?: string;
      hasVote?: boolean;
      userId: string;
    }) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "작성에 실패했습니다.");
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
    // 삭제
    delete: async (id: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 수정
    update: async (id: string, data: { title?: string; content: string }) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 반응 (좋아요/싫어요)
    react: async (id: string, type: "like" | "dislike", userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts/${id}/reaction`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ type, userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 투표 (찬성/반대)
    vote: async (id: string, voteType: "agree" | "disagree", userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts/${id}/vote`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ voteType, userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 콘텐츠 필터링 (FASTAPI 연동 - 기존 유지)
    filter: async (text: string) => {
      try {
        const response = await fetch(`${BASE_URL_FASTAPI}/api/filter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        return await response.json();
      } catch (error) {
        return { is_blocked: false, action: "pass", message: "Filter service unavailable" };
      }
    },
  },

  // 댓글 관련
  comments: {
    // 작성
    create: async (postId: string, data: { content: string; userId: string; parentId?: number | string }) => {
      try {
        const response = await fetch(`${BASE_URL}/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 삭제
    delete: async (commentId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/comments/${commentId}`, { method: "DELETE" });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 댓글 좋아요
    like: async (commentId: string, userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/comments/${commentId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },

  // 알람 관련
  notifications: {
    get: async (userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications?userId=${userId}`);
        const data = await response.json();
        return data.success ? data.notifications || data.data || [] : [];
      } catch (error) {
        return [];
      }
    },
  },

  // AI/STT 관련
  stt: {
    recognize: async (audioUri: string) => {
      try {
        const formData = new FormData();
        formData.append("audio", {
          uri: audioUri,
          type: "audio/m4a", // expo-av 기본 포맷에 맞춤
          name: "audio.m4a",
        } as any);

        const response = await fetch(`${BASE_URL}/api/stt`, {
          method: "POST",
          headers: getHeaders(true),
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "STT 처리 실패");
        }
        return result;
      } catch (error) {
        console.error("STT Recognize Error:", error);
        throw error;
      }
    },
    summarize: async (text: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/stt/summarize`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ text }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "요약 처리 실패");
        }
        return result;
      } catch (error) {
        console.error("STT Summarize Error:", error);
        throw error;
      }
    },
  },

  // 인증 관련
  auth: {
    socialLogin: async (provider: string, accessToken: string, redirectUri: string, codeVerifier?: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, accessToken, redirectUri, codeVerifier }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    register: async (data: {
      email?: string;
      nickname: string;
      gender: string;
      platform: string;
      birthYear: string;
      birthMonth: string;
      socialId?: string;
    }) => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    verifyAdult: async (birthDate: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/verify-adult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthDate }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  },

  // 사용자/팔로우 관련
  users: {
    // 상대방 프로필 정보 조회
    getProfile: async (userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/profile/${userId}`, {
          headers: getHeaders(),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 팔로우 토글 (Swagger: /api/users/follow 엔드포인트 하나로 팔로우/언팔로우 처리)
    toggleFollow: async (followerId: string, followingId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId, followingId }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 푸시 토큰 업데이트
    updatePushToken: async (userId: string, pushToken: string, notificationsEnabled: boolean = true) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/push-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, pushToken, notificationsEnabled }),
        });
        return await response.json();
      } catch (error) {
        console.error("Update Push Token Error:", error);
        return { success: false };
      }
    },
    follow: (followerId: string, followingId: string) => api.users.toggleFollow(followerId, followingId),
    unfollow: (followerId: string, followingId: string) => api.users.toggleFollow(followerId, followingId),
    syncProfile: async (userId: string, nickname: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, nickname }),
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 활동 기록 삭제
    deleteHistory: async (userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/${userId}/history`, {
          method: "DELETE",
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 탈퇴
    withdraw: async (userId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
          method: "DELETE",
        });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    // 차단 (사용자 차단)
    block: async (userId: string, targetId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, targetId }),
        });
        return await response.json();
      } catch (error) {
        console.error("Block User Error:", error);
        throw error;
      }
    },
    // 차단 해제
    unblock: async (userId: string, targetId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/users/block`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, targetId }),
        });
        return await response.json();
      } catch (error) {
        console.error("Unblock User Error:", error);
        throw error;
      }
    },
  },

  // 신고 관련 (추후 백엔드 API 연동용)
  reports: {
    submit: async (data: {
      type: "post" | "comment" | "user";
      targetId: string;
      reason: string;
      reporterId: string;
    }) => {
      try {
        // 백엔드 신고 API가 준비되면 아래 주석을 해제하고 사용합니다.
        /*
        const response = await fetch(`${BASE_URL}/api/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return await response.json();
        */

        // 현재는 콘솔 출력 및 성공 목업 응답으로 대체
        console.log("🚀 [API 통신 규격] Report Submitted:", data);
        await sleep(300); // 네트워크 딜레이 시뮬레이션
        return { success: true, message: "신고가 접수되었습니다." };
      } catch (error) {
        console.error("Report Submit Error:", error);
        throw error;
      }
    },
  },
};
