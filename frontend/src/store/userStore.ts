import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserStatus = "GUEST" | "USER" | "VIP";

interface UserState {
  status: UserStatus;
  tokensToday: number;
  lastUsedDate: string; // "YYYY-MM-DD"
  viewedPostsCount: number; // GUEST용 열람 횟수

  // Actions
  setStatus: (status: UserStatus) => void;
  useToken: () => boolean; // 토큰 사용 성공 여부 반환
  addViewedPost: () => boolean; // GUEST 열람 횟수 추가 성공 여부 반환
  resetDaily: () => void;
  addTokenByAd: () => void;
}

/**
 * @description 사용자 등급 및 게시글 열람 권한 관리를 위한 Zustand Store
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      status: "GUEST",
      tokensToday: 10,
      lastUsedDate: new Date().toISOString().split("T")[0],
      viewedPostsCount: 0,

      setStatus: (status) => set({ status }),

      useToken: () => {
        const { status, tokensToday, resetDaily } = get();

        // 날짜 체크 및 초기화
        resetDaily();

        if (status === "VIP") return true;
        if (status === "GUEST") return false;

        if (tokensToday > 0) {
          set((state) => ({ tokensToday: state.tokensToday - 1 }));
          return true;
        }
        return false;
      },

      addViewedPost: () => {
        const { status, viewedPostsCount } = get();
        if (status !== "GUEST") return true;

        if (viewedPostsCount < 3) {
          set((state) => ({ viewedPostsCount: state.viewedPostsCount + 1 }));
          return true;
        }
        return false;
      },

      addTokenByAd: () => {
        set((state) => ({ tokensToday: state.tokensToday + 1 }));
      },

      resetDaily: () => {
        const today = new Date().toISOString().split("T")[0];
        const { lastUsedDate } = get();

        if (lastUsedDate !== today) {
          set({
            lastUsedDate: today,
            tokensToday: 10,
            viewedPostsCount: 0,
          });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
