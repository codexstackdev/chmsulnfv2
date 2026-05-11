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
} from "lucide-react";

import { motion } from "framer-motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { equalTo, onValue, orderByChild, query, ref } from "firebase/database";
import { database } from "@/app/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ItemProps = {
  id: string;
  title: string;
  description: string;
  itemType: "lost" | "found" | "pending" | "approved" | "rejected";
  category: string;
  date: string;
  location: string;
  image: string;
  createdAt: string;
};

const page = () => {
  const param = useParams();
  const id = param.id;
  const router = useRouter();
  const [postedItems, setPostedItems] = useState<ItemProps[]>([]);
  const [totalItem, setTotalItem] = useState(0);
  const [selectedItemRequests, setSelectedItemRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
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
      }
    });

    return () => unsubscribe();
  }, [id]);

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
            <Card className="rounded-2xl border-border bg-background/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <PackageSearch className="h-5 w-5 text-primary" />

                  <span className="text-xs font-bold text-muted-foreground">
                    Total
                  </span>
                </div>

                <h3 className="text-2xl font-black">{totalItem}</h3>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-background/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <BellRing className="h-5 w-5 text-primary" />

                  <span className="text-xs font-bold text-muted-foreground">
                    Requests
                  </span>
                </div>

                <h3 className="text-2xl font-black">0</h3>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-background/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Clock3 className="h-5 w-5 text-primary" />

                  <span className="text-xs font-bold text-muted-foreground">
                    Pending
                  </span>
                </div>

                <h3 className="text-2xl font-black">0</h3>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-background/70">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <CheckCircle2 className="h-5 w-5 text-primary" />

                  <span className="text-xs font-bold text-muted-foreground">
                    Closed
                  </span>
                </div>

                <h3 className="text-2xl font-black">0</h3>
              </CardContent>
            </Card>
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
              {postedItems.map((item, index) => {
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
                                      Posted on {item.date}
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      fetchRequestsForItem(item.id)
                                    }
                                    className="h-11 rounded-2xl border-border bg-background/70 px-5 text-[10px] font-black uppercase tracking-[0.25em] sm:h-12"
                                  >
                                    <ArrowUpRight className="mr-2 h-4 w-4" />
                                    View Requests
                                  </Button>
                                </DialogTrigger>

                                <DialogContent className="rounded-[2rem] border-border bg-background sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
                                          className="rounded-[1.5rem] border border-border bg-card/60 p-5"
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
                                                  ID: {request.claimerStudentId}
                                                </p>
                                              </div>
                                            </div>
                                            <Badge className="bg-primary/20 text-primary border-none capitalize">
                                              {request.status}
                                            </Badge>
                                          </div>

                                          <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                                            <div>
                                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                Message
                                              </p>
                                              <p className="text-sm text-foreground mt-1 italic">
                                                "{request.identifyingDetail}"
                                              </p>
                                              <Separator/>
                                              {request.additionalInfo && (
                                                <p className="text-sm text-foreground mt-1 italic">
                                                Additional Information: "{request.additionalInfo}"
                                              </p>
                                              )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                  {item.itemType === "lost" ? "Location Found" : "Location Lost"}
                                                </p>
                                                <p className="text-sm font-medium">
                                                  {request.eventLocation}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                                  {item.itemType === "lost" ? "Date Found" : "Date Lost"}
                                                </p>
                                                <p className="text-sm font-medium">
                                                  {request.eventDate}
                                                </p>
                                              </div>
                                            </div>

                                            {request.proofImage && (
                                              <div className="mt-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                                                  Proof Image
                                                </p>
                                                <img
                                                  src={request.proofImage}
                                                  className="rounded-xl w-full max-h-40 object-cover border border-border"
                                                  alt="Proof"
                                                />
                                              </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                              <Button className="flex-1 rounded-xl bg-primary text-[10px] font-black uppercase">
                                                Accept
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl text-[10px] font-black uppercase"
                                              >
                                                Reject
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-10 border-2 border-dashed border-border rounded-[1.5rem]">
                                        <p className="text-muted-foreground">
                                          No claims received yet for this item.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
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
                                      This modal should handle permanent
                                      deletion and cleanup.
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
                                        <p>• Create archive transaction log</p>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                      <Button
                                        variant="outline"
                                        className="h-11 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em]"
                                      >
                                        Cancel
                                      </Button>

                                      <Button className="h-11 flex-1 rounded-2xl bg-destructive text-[10px] font-black uppercase tracking-[0.25em] text-destructive-foreground hover:bg-destructive/90">
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
                Live Activity
              </h2>

              <p className="text-sm text-muted-foreground">
                Realtime claim and ping updates
              </p>
            </motion.div>

            {/* <Card className="rounded-[1.75rem] border-border bg-card/60 backdrop-blur-xl lg:rounded-[2rem]">
              <CardContent className="space-y-4 p-4 sm:p-5 md:p-6">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        {activity.type === "claim" && (
                          <Fingerprint className="h-5 w-5 text-primary" />
                        )}

                        {activity.type === "ping" && (
                          <BellRing className="h-5 w-5 text-primary" />
                        )}

                        {activity.type === "approved" && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-sm font-bold leading-relaxed">
                            {activity.title}
                          </h3>

                          <span className="text-xs text-muted-foreground">
                            {activity.time}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    {index !== activities.length - 1 && (
                      <Separator className="mt-5" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card> */}

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
                    Once a claim is accepted, meetup details stay hidden until
                    approved by campus administrators.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-background/70 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src="https://github.com/shadcn.png" />

                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-bold">
                        Admin Verification Enabled
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Campus-safe recovery workflow
                      </p>
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Pending Meetups
                      </span>

                      <span className="text-sm font-bold">2</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        Approved Claims
                      </span>

                      <span className="text-sm font-bold">5</span>
                    </div>
                  </div>
                </div>

                <Button className="h-11 w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] sm:h-12">
                  View Admin Queue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;
