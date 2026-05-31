"use client";

import {
  BellRing,
  CheckCircle2,
  Clock3,
  Eye,
  Fingerprint,
  MapPin,
  PackageSearch,
  ShieldCheck,
  Trash2,
  UserCheck,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import { motion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  equalTo,
  getDatabase,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  update,
} from "firebase/database";
import { database } from "@/app/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/app/store";
import { toast } from "sonner";
import { deleteImage } from "@/app/hooks/actions";

type ItemProps = {
  id: string;
  title: string;
  description: string;
  itemType:
    | "lost"
    | "found"
    | "pending"
    | "approved"
    | "rejected"
    | "resolved"
    | "recovered";
  category: string;
  date: string;
  location: string;
  image: string;
  imageId: string;
  createdAt: string;
};

type RequestProps = {
  id: string;
  additionalInfo: string;
  claimerName: string;
  claimerProfile: string;
  claimerStudentId: number;
  contactNumber: number;
  createdAt: number;
  eventLocation: string;
  eventDate: string;
  identifyingDetail: string;
  requestedBy: string;
  status: "approved" | "pending" | "rejected" | "verified";
  proof?: string;
  meetupDate?: string;
  meetupLocation?: string;
};

const page = () => {
  const param = useParams();
  const id = param.id;
  const router = useRouter();
  const [postedItems, setPostedItems] = useState<ItemProps[]>([]);
  const [totalItem, setTotalItem] = useState(0);
  const [selectedItemRequests, setSelectedItemRequests] = useState<
    RequestProps[]
  >([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const requestCount = useUser((s) => s.requestCount);
  const pendingCount = useUser((s) => s.pendingCount);
  const closedCount = useUser((s) => s.closedCount);

  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);
  const [requestsOpenId, setRequestsOpenId] = useState<string | null>(null);
  const [meetupOpen, setMeetupOpen] = useState<{
    itemId: string;
    requestId: string;
  } | null>(null);
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupLoading, setMeetupLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(true);
  const [fullscreenImage, setFullscreenProof] = useState<string | null>(null);
  const [itemHasRequests, setItemHasRequests] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const subscribe = useUser.getState().subscribeToRequests;
    const unsubscribe = useUser.getState().unsubscribeFromRequests;
    subscribe();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;
    const itemRef = ref(database, "items");
    const userItems = query(
      itemRef,
      orderByChild("postedBy"),
      equalTo(id as string),
    );
    const unsubscribe = onValue(userItems, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as any),
        }));
        setPostedItems(itemList);
        setTotalItem(itemList.length);
      } else {
        setPostedItems([]);
        setTotalItem(0);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const requestsRef = ref(database, "request");

    const unsubscribe = onValue(requestsRef, async (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMyRequests([]);
        setLoadingMyRequests(false);
        return;
      }

      const allRequests: any[] = [];

      for (const itemId in data) {
        const itemRequests = data[itemId];

        for (const requestId in itemRequests) {
          const request = itemRequests[requestId];

          if (request.requestedBy === id) {
            allRequests.push({
              id: requestId,
              itemId,
              ...request,
            });
          }
        }
      }

      const itemsSnapshot = await new Promise<any>((resolve) => {
        onValue(ref(database, "items"), (snap) => resolve(snap.val()), {
          onlyOnce: true,
        });
      });

      const mergedRequests = allRequests.map((request) => {
        const item = itemsSnapshot?.[request.itemId];

        return {
          ...request,
          itemData: item || null,
          posterData: {
            name: item?.user?.fullName || "Unknown User",
            profile: item?.user.profile || "",
            id: item?.user.studentId || "",
            social: item?.user.social,
          },
        };
      });

      setMyRequests(mergedRequests);
      setLoadingMyRequests(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const requestsRef = ref(database, "request");

    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setItemHasRequests({});
        return;
      }

      const flags: Record<string, boolean> = {};

      for (const itemId in data) {
        const itemRequests = data[itemId];

        const hasPending = Object.values(itemRequests).some(
          (req: any) => req.status === "pending",
        );

        if (hasPending) {
          flags[itemId] = true;
        }
      }

      setItemHasRequests(flags);
    });

    return () => unsubscribe();
  }, []);

  const fetchRequestsForItem = (itemId: string) => {
    setLoadingRequests(true);
    const requestsRef = ref(database, `request/${itemId}`);
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...(value as any),
        }));
        setSelectedItemRequests(requestsList);
      } else {
        setSelectedItemRequests([]);
      }
      setLoadingRequests(false);
    });
  };

  const handleAcceptRequest = async (itemId: string, requestId: string) => {
    try {
      await update(ref(database), {
        [`request/${itemId}/${requestId}/status`]: "approved",
      });

      toast.success("Request approved! Now awaiting admin/meetup process.");
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to approve request.");
    }
  };

  const handleRejectRequest = async (itemId: string, requestId: string) => {
    try {
      await update(ref(database), {
        [`request/${itemId}/${requestId}/status`]: "rejected",
      });
      toast.success("Request rejected.");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request.");
    }
  };

  const handleScheduleMeetup = async () => {
    if (!meetupOpen) return;

    if (!meetupDate.trim() || !meetupLocation.trim()) {
      toast.error("Please fill in both meetup date and location.");
      return;
    }

    setMeetupLoading(true);

    try {
      const updates: any = {};
      updates[
        `request/${meetupOpen.itemId}/${meetupOpen.requestId}/meetupDate`
      ] = meetupDate;

      updates[
        `request/${meetupOpen.itemId}/${meetupOpen.requestId}/meetupLocation`
      ] = meetupLocation;

      await update(ref(database), updates);

      toast.success("Meetup scheduled successfully!");

      setMeetupOpen(null);
      setMeetupDate("");
      setMeetupLocation("");
    } catch (error) {
      console.error("Error scheduling meetup:", error);
      toast.error("Failed to schedule meetup.");
    } finally {
      setMeetupLoading(false);
    }
  };

  const handleDeleteItem = async (imageId: string, itemId: string) => {
    try {
      const imgRes = await deleteImage(id as string, imageId);
      if (imgRes.success) {
        const db = getDatabase();
        const itemRef = ref(db, `/items/${itemId}`);
        const requestsRef = ref(db, `/requests/${itemId}`);
        await Promise.all([remove(itemRef), remove(requestsRef)]);
        toast.success("Item and associated requests deleted successfully");
        setDeleteOpenId(null);
      } else {
        toast.error(imgRes.message);
      }
    } catch (error) {
      toast.error("Unable to delete item or requests");
      console.error("Delete Error:", error);
    }
  };

  const openProof = (url: string) => {
    if (!url) return;
    setFullscreenProof(url);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Waiting for poster approval";

      case "approved":
        return "Awaiting admin approval";

      case "verified":
        return "Verified & completed";

      case "rejected":
        return "Rejected";

      default:
        return status;
    }
  };

  const formatDateTime = (input: string) => {
  const date = new Date(input);

  const formatted = date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formatted.replace(",", "");
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(var(--primary)/0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-size-[80px_80px] opacity-20" />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:gap-8 lg:px-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-5 rounded-[1.75rem] border border-border bg-card/60 p-4 backdrop-blur-xl sm:p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between lg:rounded-[2rem] lg:p-8"
        >
          <div className="space-y-3">
            <Badge className="rounded-full border-border bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Campus Recovery Dashboard
            </Badge>
            <div className="space-y-2">
              <h1 className="text-2xl font-black leading-[0.95] tracking-[-0.05em] sm:text-3xl md:text-4xl lg:text-5xl">
                Your Active Listings
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Track claims, ping requests, verification updates, and meetup
                approvals for all your posted items in real time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {[
              { icon: PackageSearch, label: "Total", value: totalItem },
              { icon: BellRing, label: "Requests", value: requestCount },
              { icon: Clock3, label: "Pending", value: pendingCount },
              { icon: CheckCircle2, label: "Closed", value: closedCount },
            ].map(({ icon: Icon, label, value }) => (
              <Card
                key={label}
                className="rounded-2xl border-border bg-background/70"
              >
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">
                      {label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black">{value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
          <div className="space-y-5 xl:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-black tracking-[-0.03em] sm:text-xl">
                  Posted Items
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage all your lost and found listings
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {postedItems
                .sort((a, b) => {
                  if (b.createdAt > a.createdAt) return 1;
                  if (b.createdAt < a.createdAt) return -1;
                  return 0;
                })
                .map((item, index) => {
                  const isLost = item.itemType === "lost";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Card className="overflow-hidden rounded-[1.75rem] border-border bg-card/60 backdrop-blur-xl transition-all duration-300 hover:bg-card lg:rounded-[2rem]">
                        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                          <div className="flex flex-col gap-5 lg:flex-row">
                            <div className="relative h-48 w-full overflow-hidden rounded-[1.25rem] border border-border sm:h-56 lg:h-auto lg:w-60 xl:w-65">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover pointer-events-none"
                              />
                              <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                                <Badge
                                  className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] ${
                                    isLost
                                      ? "bg-destructive text-destructive-foreground"
                                      : "bg-primary text-primary-foreground"
                                  }`}
                                >
                                  {isLost ? "Lost" : "Found"}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-between gap-5">
                              <div className="space-y-5">
                                <div className="flex flex-col gap-4">
                                  <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="rounded-full border-border bg-muted/40 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em]"
                                      >
                                        {item.category}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="rounded-full border-border bg-muted/40 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em]"
                                      >
                                        <MapPin className="mr-2 h-3 w-3" />
                                        {item.location}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <h3 className="text-xl font-black leading-tight tracking-[-0.03em] sm:text-2xl">
                                        {item.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        Posted on {formatDateTime(item.date)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-3 sm:w-fit">
                                    <BellRing className="h-4 w-4 text-primary" />
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                        Activity
                                      </p>
                                      <p className="text-sm font-semibold">
                                        {item.itemType}{" "}
                                        {isLost ? "Ping Requests" : "Claims"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <ShieldCheck className="h-4 w-4 text-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                                        Verification
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                      {isLost
                                        ? "Waiting for a finder to submit proof."
                                        : "Ownership verification enabled."}
                                    </p>
                                  </div>

                                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <Fingerprint className="h-4 w-4 text-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                                        Security
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                      Hidden identifying details protected.
                                    </p>
                                  </div>

                                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <UserCheck className="h-4 w-4 text-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                                        Admin
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                      Campus meetup approval required.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                  onClick={() =>
                                    router.push(`/browse/${id}/${item.id}`)
                                  }
                                  className="h-11 p-4 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] sm:h-12"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Open Listing
                                </Button>

                                <Dialog
                                  open={requestsOpenId === item.id}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setRequestsOpenId(item.id);
                                      fetchRequestsForItem(item.id);
                                    } else {
                                      setRequestsOpenId(null);
                                      setSelectedItemRequests([]);
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <div className="relative">
                                      <Button
                                        variant="outline"
                                        className="h-11 rounded-2xl border-border bg-background/70 px-5 text-[10px] font-black uppercase tracking-[0.25em] sm:h-12"
                                      >
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        View Requests
                                      </Button>

                                      {itemHasRequests[item.id] && (
                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                      )}
                                    </div>
                                  </DialogTrigger>

                                  <DialogContent className="rounded-[2rem] customScroll border-border bg-background sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader className="space-y-3 text-left">
                                      <DialogTitle className="text-2xl font-black tracking-[-0.04em]">
                                        Claims for "{item.title}"
                                      </DialogTitle>
                                      <DialogDescription>
                                        Review the details provided by students
                                        claiming this item.
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 mt-4">
                                      {loadingRequests ? (
                                        <p className="text-center py-10 text-muted-foreground">
                                          Loading claims...
                                        </p>
                                      ) : selectedItemRequests.length > 0 ? (
                                        selectedItemRequests.map((request) => (
                                          <div
                                            key={request.id}
                                            className={`rounded-[1.5rem] border bg-card/60 p-5 ${
                                              request.status === "approved"
                                                ? "border-green-500/30 bg-green-500/5"
                                                : request.status === "rejected"
                                                  ? "border-destructive/20 bg-destructive/5"
                                                  : "border-border"
                                            }`}
                                          >
                                            <div className="mb-4 flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                  <AvatarImage
                                                    src={request.claimerProfile}
                                                  />
                                                  <AvatarFallback>
                                                    {request.claimerName?.charAt(
                                                      0,
                                                    )}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <p className="text-sm font-bold">
                                                    {request.claimerName}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    ID:{" "}
                                                    {request.claimerStudentId}
                                                  </p>
                                                  {request.contactNumber && (
                                                    <p className="text-xs text-muted-foreground">
                                                      📞 {request.contactNumber}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <Badge
                                                className={`border-none capitalize ${
                                                  request.status === "approved"
                                                    ? "bg-green-500/20 text-green-600"
                                                    : request.status ===
                                                        "rejected"
                                                      ? "bg-destructive/20 text-destructive"
                                                      : "bg-primary/20 text-primary"
                                                }`}
                                              >
                                                {getStatusLabel(request.status)}
                                              </Badge>
                                            </div>

                                            {request.status === "approved" ||
                                            request.status === "verified" ? (
                                              <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                  <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                      Claim Details
                                                    </p>
                                                    <p className="text-sm text-foreground italic">
                                                      "
                                                      {
                                                        request.identifyingDetail
                                                      }
                                                      "
                                                    </p>
                                                    {request.additionalInfo && (
                                                      <>
                                                        <Separator />
                                                        <p className="text-sm text-foreground italic">
                                                          "
                                                          {
                                                            request.additionalInfo
                                                          }
                                                          "
                                                        </p>
                                                      </>
                                                    )}
                                                    <div className="pt-1 space-y-2">
                                                      <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                          {item.itemType ===
                                                          "lost"
                                                            ? "Location Found"
                                                            : "Location Lost"}
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                          {
                                                            request.eventLocation
                                                          }
                                                        </p>
                                                      </div>
                                                      <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                          {item.itemType ===
                                                          "lost"
                                                            ? "Date Found"
                                                            : "Date Lost"}
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                          {request.eventDate}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 space-y-3 flex flex-col justify-between">
                                                    <div className="space-y-2">
                                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                                                        ✅ Meetup Details
                                                      </p>
                                                      {request.meetupLocation ? (
                                                        <>
                                                          <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                                              Location
                                                            </p>
                                                            <p className="text-sm font-bold">
                                                              📍{" "}
                                                              {
                                                                request.meetupLocation
                                                              }
                                                            </p>
                                                          </div>
                                                          <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                                              Date & Time
                                                            </p>
                                                            <p className="text-sm font-bold">
                                                              📅{" "}
                                                              {
                                                                formatDateTime(request.meetupDate as string)
                                                              }
                                                            </p>
                                                          </div>
                                                        </>
                                                      ) : (
                                                        <p className="text-sm text-muted-foreground italic">
                                                          No meetup scheduled
                                                          yet. Set one below.
                                                        </p>
                                                      )}
                                                    </div>
                                                    {request.status ===
                                                      "approved" && (
                                                      <Button
                                                        onClick={() => {
                                                          setMeetupOpen({
                                                            itemId: item.id,
                                                            requestId:
                                                              request.id,
                                                          });
                                                          setMeetupDate(
                                                            request.meetupDate ||
                                                              "",
                                                          );
                                                          setMeetupLocation(
                                                            request.meetupLocation ||
                                                              "",
                                                          );
                                                        }}
                                                        className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase mt-2"
                                                      >
                                                        <CalendarDays className="mr-2 h-3.5 w-3.5" />
                                                        {request.meetupDate
                                                          ? "Update Meetup"
                                                          : "Schedule Meetup"}
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>

                                                {request.proof && (
                                                  <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                                      Proof Image
                                                    </p>
                                                    <img
                                                      src={request.proof}
                                                      onClick={() =>
                                                        openProof(
                                                          request.proof!,
                                                        )
                                                      }
                                                      className="rounded-xl w-full max-h-40 object-cover border border-border cursor-pointer select-none"
                                                      draggable={false}
                                                      alt="Proof"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                                                <div>
                                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                    Message
                                                  </p>
                                                  <p className="text-sm text-foreground mt-1 italic">
                                                    "{request.identifyingDetail}
                                                    "
                                                  </p>
                                                  <Separator className="my-2" />
                                                  {request.additionalInfo && (
                                                    <p className="text-sm text-foreground mt-1 italic">
                                                      Additional Information: "
                                                      {request.additionalInfo}"
                                                    </p>
                                                  )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                      {item.itemType === "lost"
                                                        ? "Location Found"
                                                        : "Location Lost"}
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                      {request.eventLocation}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                      {item.itemType === "lost"
                                                        ? "Date Found"
                                                        : "Date Lost"}
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                      {request.eventDate}
                                                    </p>
                                                  </div>
                                                </div>

                                                {request.proof && (
                                                  <div className="mt-2">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                                      Proof Image
                                                    </p>
                                                    <img
                                                      src={request.proof}
                                                      onClick={() =>
                                                        openProof(
                                                          request.proof!,
                                                        )
                                                      }
                                                      className="rounded-xl w-full max-h-40 object-cover border border-border cursor-pointer select-none"
                                                      draggable={false}
                                                      alt="Proof"
                                                    />
                                                  </div>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                  {request.status ===
                                                  "rejected" ? (
                                                    <p className="text-xs text-muted-foreground italic w-full text-center py-1">
                                                      This request has been
                                                      rejected.
                                                    </p>
                                                  ) : (
                                                    <>
                                                      <Button
                                                        onClick={() =>
                                                          handleAcceptRequest(
                                                            item.id,
                                                            request.id,
                                                          )
                                                        }
                                                        className="flex-1 rounded-xl bg-primary text-[10px] font-black uppercase"
                                                      >
                                                        Accept
                                                      </Button>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                          handleRejectRequest(
                                                            item.id,
                                                            request.id,
                                                          )
                                                        }
                                                        className="flex-1 rounded-xl text-[10px] font-black uppercase border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                      >
                                                        Reject
                                                      </Button>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-center py-10 border-2 border-dashed border-border rounded-[1.5rem]">
                                          <p className="text-muted-foreground">
                                            No claims received yet for this
                                            item.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog
                                  open={deleteOpenId === item.id}
                                  onOpenChange={(open) =>
                                    setDeleteOpenId(open ? item.id : null)
                                  }
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="h-11 rounded-2xl border-destructive/20 bg-destructive/5 px-5 text-[10px] font-black uppercase tracking-[0.25em] text-destructive hover:bg-destructive hover:text-destructive-foreground sm:h-12"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </Button>
                                  </DialogTrigger>

                                  <DialogContent className="rounded-[2rem] border-border bg-background sm:max-w-md">
                                    <DialogHeader className="space-y-3 text-left">
                                      <DialogTitle className="text-2xl font-black tracking-[-0.04em]">
                                        Delete Listing
                                      </DialogTitle>
                                      <DialogDescription className="leading-relaxed text-muted-foreground">
                                        This action is permanent and cannot be
                                        undone.
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                      <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-4">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-destructive">
                                          Cleanup Flow
                                        </p>
                                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                          <p>• Delete live item listing</p>
                                          <p>• Remove active claims & pings</p>
                                          <p>• Remove storage assets</p>
                                          <p>
                                            • Create archive transaction log
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                          variant="outline"
                                          onClick={() => setDeleteOpenId(null)}
                                          className="h-11 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleDeleteItem(
                                              item.imageId,
                                              item.id,
                                            )
                                          }
                                          className="h-11 flex-1 rounded-2xl bg-destructive text-[10px] font-black uppercase tracking-[0.25em] text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Confirm Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          <div className="space-y-5 xl:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-1"
            >
              <h2 className="text-lg font-black tracking-[-0.03em] sm:text-xl">
                Your Requests
              </h2>

              <p className="text-sm text-muted-foreground">
                Track your submitted claims and meetup schedules
              </p>
            </motion.div>

            {loadingMyRequests ? (
              <Card className="rounded-[2rem] border-border bg-card/60 backdrop-blur-xl">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Loading your requests...
                  </p>
                </CardContent>
              </Card>
            ) : myRequests.length > 0 ? (
              myRequests
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="overflow-hidden rounded-[1.75rem] border-border bg-card/60 backdrop-blur-xl">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`capitalize ${
                              request.status === "approved"
                                ? "bg-green-500/20 text-green-600"
                                : request.status === "rejected"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-primary/20 text-primary"
                            }`}
                          >
                            {getStatusLabel(request.status)}
                          </Badge>

                          <p className="text-xs text-muted-foreground">
                            {request.eventDate}
                          </p>
                        </div>

                        {request.itemData && (
                          <div className="flex gap-3">
                            <img
                              src={request.itemData.image}
                              alt={request.itemData.title}
                              className="h-20 w-20 rounded-2xl pointer-events-none object-cover border border-border"
                            />

                            <div className="flex-1">
                              <h3 className="text-sm font-black leading-tight">
                                {request.itemData.title}
                              </h3>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {request.itemData.location}
                              </p>

                              <Badge
                                variant="outline"
                                className="mt-2 rounded-full"
                              >
                                {request.itemData.category}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                              Your Message
                            </p>

                            <p className="mt-1 text-sm italic text-foreground">
                              "{request.identifyingDetail}"
                            </p>
                          </div>

                          {request.additionalInfo && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Additional Info
                              </p>

                              <p className="mt-1 text-sm italic text-foreground">
                                "{request.additionalInfo}"
                              </p>
                            </div>
                          )}
                        </div>

                        {(request.status === "approved" ||
                          request.status === "verified") && (
                          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-green-600" />

                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                                Meetup Details
                              </p>
                            </div>

                            {request.meetupLocation ? (
                              <>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Location
                                  </p>

                                  <p className="text-sm font-bold">
                                    📍 {request.meetupLocation}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Date & Time
                                  </p>

                                  <p className="text-sm font-bold">
                                    📅 {formatDateTime(request.meetupDate)}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-border bg-background/60 p-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                    Meeting With
                                  </p>

                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border border-border">
                                      <AvatarImage
                                        src={request.posterData?.profile}
                                      />
                                      <AvatarFallback>
                                        {request.posterData?.name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>

                                    <div>
                                      <p className="text-sm font-bold">
                                        {request.posterData?.name}
                                      </p>

                                      <p className="text-xs text-muted-foreground">
                                        Poster ID: {request.posterData?.id}
                                      </p>

                                      <p className="text-xs text-muted-foreground">
                                        Social:{" "}
                                        <a
                                          className="text-blue-500"
                                          href={request.posterData?.social}
                                          target="_blank"
                                        >
                                          Click Me
                                        </a>
                                      </p>

                                      {(request.status === "approved" ||
                                        request.status === "verified") && (
                                        <p className="text-xs text-green-600 font-medium mt-1">
                                          ✅ Meetup approved with this user
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Waiting for the poster to schedule the meetup.
                              </p>
                            )}
                          </div>
                        )}

                        {request.status === "rejected" && (
                          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                            <p className="text-sm text-destructive font-medium">
                              Your request was rejected by the poster.
                            </p>
                          </div>
                        )}

                        {request.status === "pending" && (
                          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <p className="text-sm text-primary font-medium">
                              Waiting for the poster to review your request.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
            ) : (
              <Card className="rounded-[2rem] border-border bg-card/60 backdrop-blur-xl">
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground">
                    You haven't submitted any requests yet.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden rounded-[1.75rem] border-primary/10 bg-card/60 backdrop-blur-xl lg:rounded-[2rem]">
              <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
                <div className="space-y-3">
                  <Badge className="rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                    Safety Protocol
                  </Badge>

                  <h3 className="text-xl font-black leading-tight tracking-[-0.04em] sm:text-2xl">
                    Secure Campus Meetup
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Both the poster and requester can track approved meetup
                    schedules in realtime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog
        open={!!meetupOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMeetupOpen(null);
            setMeetupDate("");
            setMeetupLocation("");
          }
        }}
      >
        <DialogContent className="rounded-[2rem] border-border bg-background sm:max-w-md">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-2xl font-black tracking-[-0.04em]">
              Schedule Meetup
            </DialogTitle>
            <DialogDescription className="leading-relaxed text-muted-foreground">
              Set a campus meetup date and location for the item handover.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Meetup Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={meetupDate}
                onChange={(e) => setMeetupDate(e.target.value)}
                className="rounded-2xl border-border bg-background/70 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Meetup Location
              </Label>
              <Input
                type="text"
                placeholder="e.g. Library Lobby, Building A Entrance"
                value={meetupLocation}
                onChange={(e) => setMeetupLocation(e.target.value)}
                className="rounded-2xl border-border bg-background/70 h-11"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMeetupOpen(null);
                  setMeetupDate("");
                  setMeetupLocation("");
                }}
                className="h-11 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleMeetup}
                disabled={meetupLoading}
                className="h-11 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {meetupLoading ? "Saving..." : "Confirm Meetup"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreenProof(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenProof(null);
            }}
            className="absolute right-4 top-4 z-10000 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            ✕
          </button>

          <img
            src={fullscreenImage}
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            alt="Fullscreen proof"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default page;
