"use client"

import {create} from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// 사용자 정보를 저장하는 인터페이스
export interface User {
  id: number
  email: string
  nickname: string
  username?: string
  githubLink?: string
  bio?: string
  phone?: string
  profileUrl?: string
  isInstructor: number
  instructorId?: number | null
}

// Zustand에서 사용할 사용자 상태 인터페이스
 interface UserStore {
  user: User | null
  accessToken: string | null
  setUser: (userData: any) => void
  setAccessToken: (newToken: string) => void; // 강사 전환 시 호출
  updateUser: (updatedFields: Partial<User>) => void; // 프로필 수정 시 호출
  clearUser: () => void
  fetchUser: () => Promise<void>
  restoreFromStorage: () => void
  isHydrated: boolean
  setHydrated: (state: boolean) => void
}

function base64UrlToBase64(base64Url: string): string {
  // Base64URL 형식인 `-`를 `+`, `_`를 `/`로 변환
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // Base64 인코딩은 4의 배수로 길이가 맞아야 하므로 패딩 추가
  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }
  return base64;
}

// 클라이언트 사이드에서만 사용할 수 있는 스토리지
const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }));

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),

      // 로그인 후 사용자 정보와 accessToken 저장
      setUser: (userData) => {
        console.log("👉 setUser 들어온 userData:", userData);
        const token = userData.accessToken || userData.access_token;
        if (!token) {
          console.error('No token provided in userData');
          return;
        }

        try {
          const payloadBase64Url = token.split('.')[1];
          const payloadBase64 = base64UrlToBase64(payloadBase64Url);
          const payload = JSON.parse(atob(payloadBase64));

          // Check token expiration
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          if (Date.now() >= expirationTime) {
            console.error('Token has expired');
            set({ user: null, accessToken: null });
            return;
          }

          const isInstructor = payload.instructorId ? 1 : (payload.isInstructor ?? 0);


        // User 객체 구성
        const user: User = {
          id: payload.id,
          email: userData.email,
          nickname: userData.nickname,
          username: userData.username,
          githubLink: userData.githubLink,
          bio: userData.bio,
          phone: userData.phone,
          profileUrl: userData.profileUrl,
          isInstructor: isInstructor,
          instructorId: payload.instructorId ?? null
        };

          set({ user, accessToken: token });
        } catch (error) {
          console.error('Error processing token:', error);
          set({ user: null, accessToken: null });
        }
      },

      // ✅ 추가된 메서드: accessToken만 갱신 + user.isInstructor 상태도 갱신
      setAccessToken: (newToken: string) => {
        if (!newToken) {
          console.error("No new token provided");
          return;
        }

        try {
          const payloadBase64Url = newToken.split(".")[1];
          const payloadBase64 = base64UrlToBase64(payloadBase64Url);
          const payload = JSON.parse(atob(payloadBase64));

          const isInstructor = payload.instructorId ? 1 : (payload.isInstructor ?? 0);

          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  isInstructor: isInstructor,
                  instructorId: payload.instructorId ?? null,
                }
              : null,
            accessToken: newToken,
          }));
        } catch (error) {
          console.error("Error processing new token:", error);
        }
      },

      // 프로필 수정용 메서드 (user 일부 필드만 업데이트)
      updateUser: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        }));
      },

      // 로그아웃 시 상태 초기화
      clearUser: () => {
        set({ user: null, accessToken: null });
      },

      // localStorage에서 유저 정보 불러오기 (초기 마운트 등에서 사용)
      fetchUser: async () => {
        // 이 함수는 더 이상 필요하지 않음 (persist 미들웨어가 처리)
      },

      // 상태 복원 (SSR 고려 없이 client-only hydration에 유용)
      restoreFromStorage: () => {
        // 이 함수는 더 이상 필요하지 않음 (persist 미들웨어가 처리)
      },
    }),
    {
      name: 'user-storage', // localStorage에 저장될 키 이름
      storage, // 클라이언트 사이드에서만 사용할 수 있는 스토리지
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }), // 저장할 상태 부분
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check token expiration on rehydration
          const token = state.accessToken;
          if (token) {
            try {
              const payloadBase64Url = token.split('.')[1];
              const payloadBase64 = base64UrlToBase64(payloadBase64Url);
              const payload = JSON.parse(atob(payloadBase64));

              if (Date.now() >= payload.exp * 1000) {
                state.clearUser();
              }
            } catch (error) {
              console.error('Error checking token on rehydration:', error);
              state.clearUser();
            }
          }
          state.setHydrated(true);
        }
      },
    }
  )
)

export default useUserStore
