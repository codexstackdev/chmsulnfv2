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
import { KeyRound, Calendar, MapPin, ShieldCheck, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "../store";
import { ref, serverTimestamp, set } from "firebase/database";
import { database } from "../lib/firebase";

const ClaimItemDialog = ({
  itemTitle,
  itemId,
  trigger,
}: {
  itemTitle?: string;
  itemId?: string;
  trigger: React.ReactNode;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const maxDate = `${year}-${month}-${day}`;
  const user = useUser((s) => s.user);

  const [form, setForm] = useState({
    identifyingDetail: "",
    eventDate: "",
    eventLocation: "",
    contactNumber: "",
    additionalInfo: "",
  });

  const handleSubmit = async () => {
    if (!form.identifyingDetail || !form.eventDate || !form.contactNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    const claimRef = ref(database, `/request/${itemId}/${user?._id}`);
    const requestForm = {
      ...form,
      requestedBy: user?._id,
      claimerName: user?.fullName,
      claimerStudentId: user?.studentId,
      claimerProfile: user?.profile,
      status: "pending",
      createdAt: serverTimestamp(),
    };
    try {
      await set(claimRef, requestForm);
      toast.success("Claim requested");
    } catch (error) {
      console.error("Firebase Error:", error);
      throw error;
    }
    setSubmitting(false);
    setOpen(false);
    setForm({
      identifyingDetail: "",
      eventDate: "",
      eventLocation: "",
      contactNumber: "",
      additionalInfo: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[92vh] customScroll overflow-y-auto rounded-[2rem] border border-border bg-background p-0 sm:max-w-lg">
        <div className="sticky top-0 z-10 rounded-t-[2rem] border-b border-border bg-background/90 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-[0.2em] text-foreground">
                Claim This Item
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Provide identifying details to prove ownership securely.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Claiming Item
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">
              {itemTitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Identifying Detail <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Describe a unique feature of this item that only the true owner
              would know (e.g. sticker, engraving, contents inside).
            </p>
            <Textarea
              placeholder="e.g. There's a cracked corner on the bottom-right of the case, and a yellow star sticker inside…"
              className="min-h-22.5 resize-none rounded-2xl border-border bg-muted/40 text-sm focus-visible:ring-primary"
              value={form.identifyingDetail}
              onChange={(e) =>
                setForm((f) => ({ ...f, identifyingDetail: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Date Lost <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                max={maxDate}
                className="h-12 rounded-2xl border-border bg-muted/40 pl-10 text-sm focus-visible:ring-primary"
                value={form.eventDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Where did you lose it?{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="e.g. Canteen near the entrance"
                className="h-12 rounded-2xl border-border bg-muted/40 pl-10 text-sm focus-visible:ring-primary"
                value={form.eventLocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventLocation: e.target.value }))
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
              Additional Information{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Anything else that supports your ownership claim…"
              className="min-h-20 resize-none rounded-2xl border-border bg-muted/40 text-sm focus-visible:ring-primary"
              value={form.additionalInfo}
              onChange={(e) =>
                setForm((f) => ({ ...f, additionalInfo: e.target.value }))
              }
            />
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mb-1 inline h-3.5 w-3.5 text-primary" />{" "}
            Your claim will be reviewed by the finder. A match is only confirmed
            when your identifying detail matches the hidden detail they
            recorded.
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
                  Submit Claim
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimItemDialog;
