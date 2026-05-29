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
        const user = get().user;

        if (!user?._id) return;

        const requestsRef = ref(db, "request");
        const itemsRef = ref(db, "items");

        onValue(itemsRef, (itemsSnapshot) => {
          const itemsData = itemsSnapshot.val() || {};

          const myItemIds = Object.entries(itemsData)
            .filter(([_, item]: any) => item.postedBy === user._id)
            .map(([itemId]) => itemId);

          onValue(requestsRef, (snapshot) => {
            const requestsData = snapshot.val() || {};

            let total = 0;
            let pending = 0;
            let closed = 0;

            myItemIds.forEach((itemId) => {
              const itemRequests = requestsData[itemId];

              if (!itemRequests) return;

              Object.values(itemRequests).forEach((req: any) => {
                total++;

                if (req.status === "pending") {
                  pending++;
                }

                if (
                  req.status === "approved" ||
                  req.status === "verified" ||
                  req.status === "rejected"
                ) {
                  closed++;
                }
              });
            });

            set({
              requestCount: total,
              pendingCount: pending,
              closedCount: closed,
            });
          });
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
    },
  ),
);
