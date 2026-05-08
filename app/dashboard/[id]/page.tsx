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

const postedItems = [
  {
    id: "1",
    title: "Black Jansport Backpack",
    category: "Bag",
    location: "Main Library",
    date: "May 8, 2026",
    status: "active",
    type: "found",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    requests: 4,
  },
  {
    id: "2",
    title: "Student ID Card",
    category: "ID",
    location: "Engineering Building",
    date: "May 7, 2026",
    status: "pending",
    type: "lost",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    requests: 2,
  },
  {
    id: "3",
    title: "White AirPods Case",
    category: "Electronics",
    location: "Campus Cafeteria",
    date: "May 5, 2026",
    status: "approved",
    type: "found",
    image:
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=1200&auto=format&fit=crop",
    requests: 1,
  },
];

const activities = [
  {
    id: 1,
    type: "claim",
    title: "New ownership claim submitted",
    description:
      "A student submitted proof for your found backpack listing.",
    time: "2 mins ago",
  },
  {
    id: 2,
    type: "ping",
    title: "Someone clicked 'I found this'",
    description:
      "A finder responded to your lost Student ID report.",
    time: "15 mins ago",
  },
  {
    id: 3,
    type: "approved",
    title: "Meetup approved by admin",
    description:
      "Your meetup request at the Main Lobby was approved.",
    time: "1 hour ago",
  },
];

const page = () => {
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

                <h3 className="text-2xl font-black">12</h3>
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

                <h3 className="text-2xl font-black">7</h3>
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

                <h3 className="text-2xl font-black">3</h3>
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

                <h3 className="text-2xl font-black">5</h3>
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

              <Button
                variant="outline"
                className="h-11 rounded-2xl border-border bg-card/60 px-5 text-[10px] font-black uppercase tracking-[0.25em] sm:h-12"
              >
                View Archive
              </Button>
            </motion.div>

            <div className="space-y-4">
              {postedItems.map((item, index) => {
                const isLost = item.type === "lost";

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
                              className="h-full w-full object-cover"
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

                              <Badge
                                variant="outline"
                                className="rounded-full border-border bg-background/80 text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-xl"
                              >
                                {item.status}
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
                                      {item.requests}{" "}
                                      {isLost
                                        ? "Ping Requests"
                                        : "Claims"}
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
                              <Button className="h-11 p-4 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] sm:h-12">
                                <Eye className="mr-2 h-4 w-4" />
                                Open Listing
                              </Button>

                              <Button
                                variant="outline"
                                className="h-11 rounded-2xl border-border bg-background/70 px-5 text-[10px] font-black uppercase tracking-[0.25em] sm:h-12"
                              >
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                View Requests
                              </Button>

                              <Button
                                variant="outline"
                                className="h-11 rounded-2xl border-destructive/20 bg-destructive/5 px-5 text-[10px] font-black uppercase tracking-[0.25em] text-destructive hover:bg-destructive hover:text-destructive-foreground sm:h-12"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
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

            <Card className="rounded-[1.75rem] border-border bg-card/60 backdrop-blur-xl lg:rounded-[2rem]">
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
            </Card>

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