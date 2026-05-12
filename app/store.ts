import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ref, onValue, off } from "firebase/database";
import { database as db } from "@/app/lib/firebase";

type User = {
  _id: string;
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
  requestCount: number;
  pendingCount: number;
  closedCount: number;
  setUser: (user: User) => void;
  updateUserPostedItem: (newPostedItems: string[]) => void;
  clearUser: () => void;
  subscribeToRequests: () => void;
  unsubscribeFromRequests: () => void;
};

export const useUser = create<UserData>()(
  persist(
    (set, get) => ({
      user: null,
      requestCount: 0,
      pendingCount: 0,
      closedCount: 0,

      setUser: (user) => set({ user }),

      updateUserPostedItem: (newPostedItems) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, postedItem: newPostedItems }
            : null,
        })),

      clearUser: () => {
        get().unsubscribeFromRequests();
        set({ user: null, requestCount: 0, pendingCount: 0, closedCount: 0 });
        sessionStorage.removeItem("user-session");
      },

      subscribeToRequests: () => {
        const requestsRef = ref(db, "request");

        onValue(requestsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const requestsArray = Object.values(data) as any[];
            
            const total = requestsArray.length;
            const pending = requestsArray.filter(req => req.status === "pending").length;
            const closed = requestsArray.filter(req => req.status === "closed" || req.status === "rejected").length;

            set({ 
              requestCount: total,
              pendingCount: pending,
              closedCount: closed
            });
          } else {
            set({ requestCount: 0, pendingCount: 0, closedCount: 0 });
          }
        });
      },

      unsubscribeFromRequests: () => {
        const requestsRef = ref(db, "request");
        off(requestsRef);
      },
    }),
    {
      name: "user-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);