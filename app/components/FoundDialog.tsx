"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MapPin,
  Calendar,
  X,
  ImagePlus,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FoundThisItemDialog = ({
  itemTitle,
  itemId,
  trigger,
}: {
  itemTitle?: string;
  itemId:string;
  trigger: React.ReactNode;
}) => {
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    foundLocation: "",
    foundDate: "",
    message: "",
    contactNumber: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.foundLocation || !form.foundDate || !form.contactNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Match request submitted! The owner will be notified.");
    setSubmitting(false);
    setOpen(false);
    setForm({
      foundLocation: "",
      foundDate: "",
      message: "",
      contactNumber: "",
    });
    setProofPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[92vh] customScroll overflow-y-auto rounded-[2rem] border border-border bg-background p-0 sm:max-w-lg">
        <div className="sticky top-0 z-10 rounded-t-[2rem] border-b border-border bg-background/90 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-[0.2em] text-foreground">
                I Found This Item
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Submit proof so the owner can verify your claim securely.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Regarding Item
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {itemTitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Where did you find it? <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="e.g. Library 2nd floor, near the study area"
                className="h-12 rounded-2xl border-border bg-muted/40 pl-10 text-sm focus-visible:ring-primary"
                value={form.foundLocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, foundLocation: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Date Found <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="h-12 rounded-2xl border-border bg-muted/40 pl-10 text-sm focus-visible:ring-primary"
                value={form.foundDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, foundDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Contact Number <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. 09XX-XXX-XXXX"
              className="h-12 rounded-2xl border-border bg-muted/40 text-sm focus-visible:ring-primary"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactNumber: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Proof Photo{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional but recommended)
              </span>
            </Label>

            {proofPreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={proofPreview}
                  alt="Proof"
                  className="h-44 w-full object-cover"
                />
                <button
                  onClick={() => setProofPreview(null)}
                  className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition hover:bg-background"
                >
                  <X className="h-3.5 w-3.5 text-foreground" />
                </button>
              </div>
            ) : (
              <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 transition hover:bg-muted/50">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Click to upload a photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Additional Message{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Any extra details that might help the owner identify you or the item…"
              className="min-h-22.5 resize-none rounded-2xl border-border bg-muted/40 text-sm focus-visible:ring-primary"
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
            />
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mb-1 inline h-3.5 w-3.5 text-primary" />{" "}
            Your submission will be reviewed by the item owner. Personal details
            are kept private until a match is confirmed.
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-2xl border-border text-xs font-black uppercase tracking-[0.25em]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={submitting}
              onClick={handleSubmit}
              className="h-12 flex-1 rounded-2xl text-xs font-black uppercase tracking-[0.25em]"
            >
              {submitting ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoundThisItemDialog;
