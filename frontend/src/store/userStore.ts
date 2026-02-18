import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserStatus = "GUEST" | "USER" | "VIP";

interface UserState {
  status: UserStatus;
  dailyFreeTokens: number; // 매일 초기화되는 무료 토큰
  totalTokens: number; // 유료로 구매하거나 적립한 전체 토큰
  lastUsedDate: string; // "YYYY-MM-DD"
  viewedPostsCount: number; // GUEST용 열람 횟수

  // Actions
  setStatus: (status: UserStatus) => void;
  useToken: () => boolean; // 토큰 사용 성공 여부 반환
  buyTokens: (amount: number) => void; // 토큰 구매
  addViewedPost: () => boolean; // GUEST 열람 횟수 추가 성공 여부 반환
  resetDaily: () => void;
  addTokenByAd: () => void;
  upgradeToVIP: () => void;
}

/**
 * @description 사용자 등급 및 가상 화폐(토큰) 관리를 위한 Zustand Store
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      status: "GUEST",
      dailyFreeTokens: 10,
      totalTokens: 0,
      lastUsedDate: new Date().toISOString().split("T")[0],
      viewedPostsCount: 0,

      setStatus: (status) => set({ status }),

      useToken: () => {
        const { status, dailyFreeTokens, totalTokens, resetDaily } = get();

        // 날짜 체크 및 초기화
        resetDaily();

        if (status === "VIP") return true;
        if (status === "GUEST") return false;

        // 1. 무료 토큰 먼저 소진
        if (get().dailyFreeTokens > 0) {
          set((state) => ({ dailyFreeTokens: state.dailyFreeTokens - 1 }));
          return true;
        }

        // 2. 유료 토큰 소진
        if (get().totalTokens > 0) {
          set((state) => ({ totalTokens: state.totalTokens - 1 }));
          return true;
        }

        return false;
      },

      buyTokens: (amount) => {
        set((state) => ({
          totalTokens: state.totalTokens + amount,
          status: state.status === "GUEST" ? "USER" : state.status,
        }));
      },

      upgradeToVIP: () => {
        set({ status: "VIP" });
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
        set((state) => ({ totalTokens: state.totalTokens + 1 }));
      },

      resetDaily: () => {
        const today = new Date().toISOString().split("T")[0];
        const { lastUsedDate } = get();

        if (lastUsedDate !== today) {
          set({
            lastUsedDate: today,
            dailyFreeTokens: 10,
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
