"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDatabase,
  onValue,
  ref,
  remove,
  update,
} from "firebase/database";
import { database } from "@/app/lib/firebase";
import { toast } from "sonner";
import {
  CalendarCheck,
  ShieldCheck,
  Trash2,
  Users,
  MapPin,
  UserCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getAllUser } from "@/app/hooks/actions";
import { useParams } from "next/navigation";

type ItemProps = {
  id: string;
  title: string;
  image: string;
  location: string;
  itemType: string;
  postedBy: string;
};

type UserProps = {
  id: string;
  fullName: string;
  role: string;
  email: string;
  studentId: string;
};

type MeetupProps = {
  id: string;
  itemId: string;
  requestId: string;
  meetupDate: string;
  meetupLocation: string;
  status: "pending" | "approved" | "rejected" | "verified";
  claimerName: string;
};

export default function AdminPage() {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [meetups, setMeetups] = useState<MeetupProps[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const itemsRef = ref(database, "items");
    const requestsRef = ref(database, "request");

    const unsubItems = onValue(itemsRef, (snap) => {
      const data = snap.val() || {};
      setItems(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
    });


    const unsubMeetups = onValue(requestsRef, (snap) => {
      const data = snap.val() || {};
      const list: MeetupProps[] = [];

      Object.entries(data).forEach(([itemId, requests]: any) => {
        Object.entries(requests || {}).forEach(([requestId, r]: any) => {
          if (r.meetupDate || r.meetupLocation) {
            list.push({
              id: requestId,
              itemId,
              requestId,
              meetupDate: r.meetupDate,
              meetupLocation: r.meetupLocation,
              status: r.status,
              claimerName: r.claimerName,
            });
          }
        });
      });

      setMeetups(list);
    });

    return () => {
      unsubItems();
      unsubMeetups();
    };
  }, []);

  useEffect(() => {
    const getUserData = async() => {
      const data = await getAllUser(id as string);
      if(data.success){
        setUsers(data.user);
      }
      else{
        toast.error(data.message);
      }
    }
    getUserData();
  }, []);

  const verifyCampusMeetup = async (itemId: string, requestId: string) => {
    await update(ref(database), {
      [`request/${itemId}/${requestId}/status`]: "verified",
    });

    toast.success("Meetup verified inside campus");
  };

  const rejectMeetup = async (itemId: string, requestId: string) => {
    await update(ref(database), {
      [`request/${itemId}/${requestId}/status`]: "rejected",
    });

    toast.error("Meetup rejected");
  };

  const deleteItem = async (itemId: string) => {
    try {
      await remove(ref(database, `items/${itemId}`));
      await remove(ref(database, `request/${itemId}`));

      toast.success("Item removed by admin");
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  };

  const stats = useMemo(() => {
    return {
      users: users.length,
      items: items.length,
      meetups: meetups.length,
      pending: meetups.filter((m) => m.status === "approved").length,
    };
  }, [users, items, meetups]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-10">

      <div>
        <h1 className="text-3xl font-black">Admin Control Center</h1>
        <p className="text-muted-foreground">
          Manage campus recovery system in real-time
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Users" value={stats.users} />
        <Stat icon={ShieldCheck} label="Items" value={stats.items} />
        <Stat icon={CalendarCheck} label="Meetups" value={stats.meetups} />
        <Stat icon={CheckCircle2} label="Pending Approval" value={stats.pending} />
      </div>

      {/* MEETUPS */}
      <Section title="Meetup Verification">

        {meetups.map((m) => (
          <div key={m.id} className="border rounded-xl p-4 space-y-2">

            <div className="flex justify-between">
              <p className="font-bold">{m.claimerName}</p>
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {m.status}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {m.meetupLocation}
            </p>

            <p className="text-sm">{m.meetupDate}</p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => verifyCampusMeetup(m.itemId, m.requestId)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Verify Campus
              </button>

              <button
                onClick={() => rejectMeetup(m.itemId, m.requestId)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>

          </div>
        ))}
      </Section>

      {/* USERS */}
      <Section title="Users & Roles">

        <div className="grid md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="border p-4 rounded-xl space-y-1">
              <p className="font-bold">{u.fullName}</p>
              <p className="text-sm">Role: {u.role}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
              <p className="text-xs">ID: {u.studentId}</p>
            </div>
          ))}
        </div>

      </Section>

      {/* ITEMS */}
      <Section title="Item Control">

        {items.map((i) => (
          <div key={i.id} className="border p-4 rounded-xl flex justify-between">

            <div>
              <p className="font-bold">{i.title}</p>
              <p className="text-sm text-muted-foreground">{i.location}</p>
            </div>

            {confirmDelete === i.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => deleteItem(i.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1 bg-muted rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(i.id)}
                className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}

          </div>
        ))}

      </Section>

    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="border rounded-xl p-4">
      <Icon className="h-5 w-5 mb-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}