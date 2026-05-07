"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

type ItemProps = {
  id: number;
  title: string;
  description: string;
  itemType: "lost" | "found" | "approved" | "rejected";
  category: string;
  date: string;
  location: string;
  image: string;
};

const ItemCard = ({
  item,
  viewMode,
  visit,
}: {
  item: ItemProps;
  viewMode: string;
  visit: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 0 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={`group relative border rounded-[1.5rem] sm:rounded-[2rem] bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl shadow-sm ${
      viewMode === "list" ? "md:flex md:h-52" : ""
    }`}
  >
    <div
      className={`relative shrink-0 overflow-hidden bg-muted ${
        viewMode === "grid" ? "aspect-4/3 w-full" : "md:w-72 h-48 md:h-full"
      }`}
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Badge
        className={`absolute top-4 left-4 shadow-lg ${
          item.itemType === "found"
            ? "bg-emerald-500 hover:bg-emerald-600"
            : "bg-destructive"
        } border-none`}
      >
        {item.itemType.toUpperCase()} 
      </Badge>
    </div>

    <div className="p-6 flex flex-col flex-1">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase text-primary/70 tracking-[0.15em]">
            {item.category}
          </span>
          <h3 className="text-xl font-black tracking-tighter leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[9px] font-black text-muted-foreground bg-muted px-2 py-1 rounded-md uppercase">
          <Clock className="h-3 w-3" /> {format(new Date(item.date), "MMM dd, yyyy")}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 font-medium leading-relaxed">
        {item.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-bold truncate">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-3 w-3" />
          </div>
          <span className="truncate">{item.location}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={visit}
          className="h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Inspect <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  </motion.div>
);

export default ItemCard;
