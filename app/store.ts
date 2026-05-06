import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type User = {
  _id:string;
  fullName: string;
  email: string;
  profile: string;
  role: string;
  social: string;
  studentId: string;
  postedItem: string[];
};

type UserData = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUser = create<UserData>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
