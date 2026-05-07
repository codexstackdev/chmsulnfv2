"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Fingerprint,
  Hash,
  Tag,
  Info,
  UserCheck,
  Link,
} from "lucide-react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { child, get, ref } from "firebase/database";
import { database } from "@/app/lib/firebase";
import { format } from "date-fns";

type User = {
  _id: string;
  fullName: string;
  email: string;
  profile: string;
  role: string;
  social: string;
  studentId: string;
  postedItems: string[];
};

type ItemProps = {
  id: string;
  title: string;
  description: string;
  itemType: "lost" | "found" | "approved" | "rejected";
  category: string;
  date: string;
  location: string;
  image: string;
  user: User;
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const ItemDetailPage = () => {
  const params = useParams();
  const itemId = params.itemId;

  const [itemData, setItemData] = useState<ItemProps | null>(null);

  const router = useRouter();

  useEffect(() => {
    try {
      const dbRef = ref(database);

      get(child(dbRef, `/items/${itemId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          setItemData(snapshot.val());
        } else {
          setItemData(null);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, [itemId]);

  if (!itemData) return <p>Loading</p>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(var(--primary)/0.08),transparent_35%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-size-[80px_80px] opacity-20" />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="group rounded-2xl border border-border bg-background px-4 hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </Button>

          <div className="rounded-full border border-border bg-muted/40 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Ref #{itemData?.id?.slice(0, 12)}
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45 }}
            className="space-y-6 lg:col-span-7"
          >
            <Card className="overflow-hidden rounded-[2rem] border-border bg-card/60 backdrop-blur-xl">
              <div className="relative aspect-square overflow-hidden md:aspect-4/3 lg:h-180 lg:aspect-auto">
                <div className="absolute inset-0 z-10 bg-linear-to-t from-background/70 via-background/10 to-transparent" />

                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                  src={itemData?.image}
                  alt={itemData?.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-5 top-5 z-20 md:left-7 md:top-7">
                  <Badge
                    className={`rounded-full border-none px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] ${
                      itemData?.itemType === "lost"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {itemData?.itemType}
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 z-20 w-full p-5 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full border border-border bg-background/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground backdrop-blur-xl">
                      <Tag className="mr-2 h-3.5 w-3.5 text-primary" />
                      {itemData?.category}
                    </Badge>

                    <Badge className="rounded-full border border-border bg-background/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground backdrop-blur-xl">
                      <MapPin className="mr-2 h-3.5 w-3.5 text-primary" />
                      {itemData?.location}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border-border bg-card/60 backdrop-blur-xl">
              <CardContent className="p-5 md:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar className="h-14 w-14 border border-border md:h-16 md:w-16">
                      <AvatarImage
                        src={itemData?.user.profile}
                        className="object-cover"
                      />

                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {itemData?.user.fullName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Posted By
                      </p>

                      <h3 className="truncate text-lg font-bold text-foreground md:text-2xl">
                        {itemData?.user.fullName}
                      </h3>

                      <p className="truncate text-sm text-muted-foreground">
                        #{itemData?.user.studentId} ·{" "}
                        {itemData?.user.role.slice(0, 1).toUpperCase() +
                          itemData?.user.role.slice(1)}
                      </p>

                      {itemData?.user.social && (
                        <a
                          href={itemData?.user.social}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          <span className="flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Social
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  <Badge className="h-11 rounded-2xl border border-border bg-secondary px-5 text-[10px] font-black uppercase tracking-[0.25em] text-secondary-foreground">
                    <UserCheck className="mr-2 h-4 w-4 text-primary" />
                    Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-8 lg:col-span-5"
          >
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                <Clock className="h-4 w-4" />
                Recorded {itemData?.date}
              </div>

              <h1 className="text-4xl font-black leading-none tracking-[-0.05em] text-foreground sm:text-5xl md:text-6xl">
                {itemData?.title}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {itemData?.description}
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-[1.8rem] border border-border bg-card/60 p-6 backdrop-blur-xl"
              >
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Incident Date
                </p>

                <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>

                  {format(new Date(itemData.date), "MMM dd, yyyy")}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-[1.8rem] border border-border bg-card/60 p-6 backdrop-blur-xl"
              >
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Reference ID
                </p>

                <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <div className="rounded-2xl bg-primary/10 p-3">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>

                  <span className="font-mono">
                    {itemData?.id?.slice(0, 12)}...
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-[2rem] border border-primary/10 bg-card/60 backdrop-blur-xl"
            >
              <CardContent className="space-y-8 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                      Ownership Protocol
                    </p>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      For security, specific identifying marks are withheld. You
                      must describe the secret identifier set by the finder to
                      initiate contact.
                    </p>
                  </div>
                </div>

                <Button className="h-14 w-full rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                  <Fingerprint className="mr-3 h-4 w-4" />
                  Initiate Claim Access
                </Button>
              </CardContent>
            </motion.div>

            <div className="rounded-[2rem] border border-border bg-card/60 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <Info className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.25em] text-foreground">
                    Additional Details
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Item verification information
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-4">
                  <span className="text-sm text-muted-foreground">Status</span>

                  <Badge
                    className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] ${
                      itemData?.itemType === "lost"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {itemData?.itemType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-4">
                  <span className="text-sm text-muted-foreground">
                    Category
                  </span>

                  <span className="text-sm font-semibold text-foreground">
                    {itemData?.category}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-4">
                  <span className="text-sm text-muted-foreground">
                    Location
                  </span>

                  <span className="text-right text-sm font-semibold text-foreground">
                    {itemData?.location}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetailPage;
