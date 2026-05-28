"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  Package,
  Laptop,
  Wallet,
  FileText,
  Shirt,
  MoreHorizontal,
  Settings,
  LogOut,
  User,
  Info,
  Menu,
  LucideProps,
  Check,
  Monitor,
  Moon,
  Sun,
  PlusCircle,
  LayoutDashboard,
  Loader2,
  LockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { getUser, logout } from "@/app/hooks/actions";
import { useUser } from "@/app/store";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import ItemCard from "@/app/components/Item";
import { onValue, ref } from "firebase/database";
import { database } from "@/app/lib/firebase";

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

const UserProfile = ({ user }: { user: User | null }) => {
  const { theme, setTheme } = useTheme();
  const clearUser = useUser((s) => s.clearUser);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data.message);
        router.replace("/");
        clearUser();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full pl-1 pr-3 h-9 transition-all hover:border-primary/50"
        >
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={user?.profile}
                className="object-cover pointer-events-none"
              />
              <AvatarFallback>
                {user?.fullName?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-black leading-none uppercase tracking-tighter">
              {user?.fullName || "Guest User"}
            </p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
              {user?.studentId || "0000-0000"}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-xl mt-2 border-border/60 p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
            Account
          </p>
          <p className="text-xs font-bold truncate">
            {user?.email || "user@example.com"}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => router.push(`/addItem/${user?._id}`)}
          className="md:hidden gap-2 py-2.5 cursor-pointer rounded-lg focus:bg-primary focus:text-primary-foreground mb-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="text-sm font-bold">Report Item</span>
        </DropdownMenuItem>

        {user?.role === "admin" && (
          <DropdownMenuItem onClick={() => router.push(`/admin/${user?._id}`)} className="gap-2 py-2.5 cursor-pointer focus:bg-accent rounded-lg">
            <LockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Admin</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem onClick={() => router.push(`/dashboard/${user?._id}`)} className="gap-2 py-2.5 cursor-pointer focus:bg-accent rounded-lg">
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 py-2.5 cursor-pointer rounded-lg focus:bg-accent">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-xl border-border/60 p-1.5 min-w-32 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-2 py-1.5">
                Appearance
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="gap-2 py-2 cursor-pointer rounded-md justify-between"
                onClick={() => setTheme("light")}
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5" /> Light
                </div>
                {theme === "light" && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 cursor-pointer rounded-md justify-between"
                onClick={() => setTheme("dark")}
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5" /> Dark
                </div>
                {theme === "dark" && <Check className="h-3 w-3 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 py-2 cursor-pointer rounded-md justify-between"
                onClick={() => setTheme("system")}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5" /> System
                </div>
                {theme === "system" && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-bold">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SidebarFilters = ({
  categories,
  activeCategory,
  setActiveCategory,
  items
}: {
  categories: CategoryProps[];
  activeCategory: string;
  setActiveCategory: any;
  items: ItemProps[]
}) => (
  <div className="flex flex-col gap-8 h-full">
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Filter className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Category Portal
        </span>
      </div>
      <nav className="space-y-1">
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant={activeCategory === cat.name ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 rounded-xl transition-all ${
              activeCategory === cat.name
                ? "shadow-lg shadow-primary/20"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveCategory(cat.name)}
          >
            <cat.icon className="h-4 w-4" />
            <span className="font-bold text-sm">
              {cat.name.slice(0, 1).toUpperCase() + cat.name.slice(1)}
            </span>
          </Button>
        ))}
      </nav>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          High Traffic
        </span>
      </div>
      <div className="flex flex-wrap gap-2 px-2">
        {items.map((loc) => (
          <Badge
            key={loc.id}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {loc.location}
          </Badge>
        ))}
      </div>
    </div>

    <div className="mt-auto bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Info className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-wider">
          Help Desk
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
        Found something? Drop it off at Office of Student Affairs (OSA). Items
        are held for exactly 90 days.
      </p>
    </div>
  </div>
);

type ItemProps = {
  id: number;
  title: string;
  description: string;
  itemType: "lost" | "found" | "pending" | "approved" | "rejected";
  category: string;
  date: string;
  location: string;
  image: string;
  createdAt: string;
};

type CategoryProps = {
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

const page = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<ItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const setUser = useUser((s) => s.setUser);
  const user = useUser((s) => s.user);
  const router = useRouter();
  const { id } = useParams();

  const categories: CategoryProps[] = [
    { name: "all", icon: Package },
    { name: "electronics", icon: Laptop },
    { name: "accessories", icon: Wallet },
    { name: "documents", icon: FileText },
    { name: "clothing", icon: Shirt },
    { name: "other", icon: MoreHorizontal },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser(id as string);
      if (userData.success) {
        setUser(userData.user);
      } else {
        router.replace("/");
      }
    };
    fetchUser();

    const itemsRef = ref(database, "items");
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedItems: ItemProps[] = data
        ? Object.keys(data).map((key) => ({
            id: parseInt(key),
            ...data[key],
          }))
        : [];
      setItems(loadedItems);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, router]);

  const filteredItems = items.filter(
    (item) =>
      (activeCategory === "all" || item.category === activeCategory) &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex">
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card p-4 lg:flex">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Lost & Found
              </span>
            </div>
          </div>
          <ScrollArea className="flex-1 py-4">
            <SidebarFilters
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              items={items}
            />
          </ScrollArea>
        </aside>

        <main className="flex flex-1 flex-col lg:ml-64">
          <nav className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6 lg:px-8">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-card">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <Search className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                      Lost & Found
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 py-4">
                  <SidebarFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    items={items}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div className="flex-1 text-base font-medium">
              <h1 className="text-xl font-bold tracking-tight">
                Browse Items
              </h1>
            </div>
            <div className="relative ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="w-full rounded-lg bg-background pl-9 md:w-50 lg:w-84"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:flex items-center gap-1"> 
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid className="h-5 w-5" />
                  <span className="sr-only">Grid View</span>
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="h-5 w-5" />
                  <span className="sr-only">List View</span>
                </Button>
              </div>
              <Button
                onClick={() => router.push(`/addItem/${user?._id}`)}
                className="hidden md:inline-flex"
                size="sm"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Report Item
              </Button>
              <UserProfile user={user} />
            </div>
          </nav>

          <ScrollArea className="flex-1 p-4 sm:px-6 sm:py-0 lg:px-8">
            <div className="py-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/20"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-24 w-24 bg-card rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6"
                    >
                      <Loader2 className="h-10 w-10 text-primary opacity-40" />
                    </motion.div>
                    <h3 className="text-2xl font-black tracking-tight">
                      Loading Items...
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium mt-2">
                      Please wait while we fetch the latest lost and found items.
                    </p>
                  </motion.div>
                ) : filteredItems.length === 0 ? (
                  <motion.div
                    key="no-records-found"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/20"
                  >
                    <div className="h-24 w-24 bg-card rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-6">
                      <Search className="h-10 w-10 text-primary opacity-40" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">
                      No Records Found
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium mt-2">
                      We couldn't find matches for your search. Try broadening
                      your keywords.
                    </p>
                    <Button
                      variant="default"
                      className="mt-8 rounded-2xl h-11 px-8 font-black uppercase text-[10px] tracking-widest"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                      }}
                    >
                      Refresh Portal
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="items-display"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className={viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "space-y-4" 
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredItems.sort((a,b) => {
                        if(b.createdAt > a.createdAt) return 1
                        if(b.createdAt < a.createdAt) return -1
                        return 0
                      }).map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                          <ItemCard
                            item={item}
                            viewMode={viewMode}
                            visit={() => router.push(`/browse/${id}/${item.id}`)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default page;
