"use client";
import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Info,
  CheckCircle2,
  Package,
  Camera,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { push, ref, set } from "firebase/database";
import { database } from "@/app/lib/firebase";
import { authenticator, deleteImage, updatePostedItem } from "@/app/hooks/actions";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/app/store";

const AddItemPage = () => {
  const [loading, setLoading] = useState(false);
  const [itemType, setItemType] = useState("found");
  const [imagePreview, setImagePreview] = useState("");
  const [rawImage, setRawImage] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const user = useUser((s) => s.user);
  const [progress, setProgress] = useState(0);
  const params = useParams();
  const id = params.id;
  const abortController = new AbortController();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const maxDate = `${year}-${month}-${day}`;
  const [itemData, setItemData] = useState({
    id: "",
    title: "",
    date: "",
    createdAt: Date.now(),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const categories = [
    "Electronics",
    "Accessories",
    "Documents",
    "Clothing",
    "Books",
    "Other",
  ];

  const locations = [
    "Main Library",
    "Student Center",
    "Engineering Building",
    "Science Complex",
    "Gymnasium",
    "Cafeteria",
    "North Gate",
    "Other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: File) => {
    if (e) {
      setRawImage(e);
      const url = URL.createObjectURL(e);
      setImagePreview(url);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (
      !rawImage ||
      !itemData.title ||
      !itemData.date ||
      !selectedLocation ||
      !description ||
      !itemType ||
      !category
    ) {
      toast.error("Missing fields");
      return;
    }
    setLoading(true);
    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate");
      return;
    }
    const { signature, expire, token, publicKey } = authParams;
    try {
      const uploadResponse = await upload({
        expire,
        signature,
        token,
        publicKey,
        file: rawImage,
        fileName: itemData.title,
        folder: "/items",
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });

      const itemRef = ref(database, "items");
      const newItem = push(itemRef);

      const location =
        selectedLocation === "other" ? customLocation : selectedLocation;
      const finalItem = {
        ...itemData,
        id: newItem.key,
        description,
        category,
        image: uploadResponse.url,
        imageId: uploadResponse.fileId,
        location,
        itemType,
        user
      };
      await set(newItem, finalItem);
      const emptyField = {
        id: "",
        title: "",
        date: "",
        createdAt: Date.now(),
      };
      setRawImage(null);
      setImagePreview("");
      setDescription("");
      setSelectedLocation("");
      setCategory("");
      setItemData(emptyField);
      if (newItem.key) {
        toast.success("Item uploaded successfully");
        await updatePostedItem(id as string, newItem.key);
        router.back();
      } else {
        await deleteImage(uploadResponse.fileId as string);
        toast.error("Something went wrong");
      }
    } catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="h-16 border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase">
              REPOS
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="hidden sm:flex border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest px-3 py-1"
          >
            Officil Report Portal
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10 sm:pt-16">
        <div className="space-y-2 mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase">
            Report {itemType === "found" ? "Recovered" : "Misplaced"} Item
          </h1>
          <p className="text-muted-foreground font-medium max-w-xl text-sm sm:text-base">
            Provide accurate details to help facilitate the return of the item.
            Fields marked with an asterisk (*) are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Report Type
              </Label>
              <div className="flex p-1 bg-muted rounded-2xl border border-border/50">
                <button
                  type="button"
                  onClick={() => setItemType("found")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                    itemType === "found"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${itemType === "found" ? "text-emerald-500" : ""}`}
                  />
                  I Found Something
                </button>
                <button
                  type="button"
                  onClick={() => setItemType("lost")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm ${
                    itemType === "lost"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlertCircle
                    className={`h-4 w-4 ${itemType === "lost" ? "text-destructive" : ""}`}
                  />
                  I Lost Something
                </button>
              </div>
            </section>

            <section className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  Item Name *
                </Label>
                <Input
                  id="title"
                  name="title"
                  onChange={handleChange}
                  value={itemData.title}
                  placeholder="e.g. MacBook Pro 14-inch, Blue Wallet"
                  className="h-12 rounded-xl bg-card border-2 focus-visible:ring-primary font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Category *
                  </Label>
                  <Select onValueChange={setCategory} name="category">
                    <SelectTrigger className="h-12 rounded-xl bg-card border-2">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    {itemType === "found" ? "Date Found *" : "Date Lost *"}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      name="date"
                      max={maxDate}
                      onChange={handleChange}
                      value={itemData.date}
                      className="h-12 pl-10 rounded-xl bg-card border-2 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    General Location *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-12 pl-10 rounded-xl bg-card border-2">
                        <SelectValue placeholder="Select Campus Location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc.toLowerCase()}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedLocation === "other" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label
                      htmlFor="other_location"
                      className="text-xs font-black uppercase tracking-widest text-primary"
                    >
                      Specific Location Details *
                    </Label>
                    <div className="relative">
                      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="other_location"
                        onChange={(e) => setCustomLocation(e.target.value)}
                        value={customLocation}
                        placeholder="e.g. Near the fountain, 2nd floor hallway..."
                        className="h-12 pl-10 rounded-xl bg-primary/5 border-primary/20 border-2 focus-visible:ring-primary font-medium"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  placeholder="Describe unique identifiers, stickers, colors, or internal contents..."
                  className="min-h-37.5 rounded-xl bg-card border-2 focus-visible:ring-primary font-medium p-4 resize-none"
                  required
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Item Media
              </Label>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpg, image/jpeg, image/webp"
                onChange={(e) => {
                  const file = e?.target?.files?.[0];
                  if (file) {
                    handleFileChange(file);
                  }
                }}
              />

              <div
                className={`relative group h-80 border-2 border-dashed rounded-[2.5rem] bg-card/30 flex flex-col items-center justify-center transition-all overflow-hidden ${
                  imagePreview ? "border-primary/50" : "hover:border-primary/30"
                }`}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <Button
                        type="button"
                        onClick={triggerFilePicker}
                        variant="secondary"
                        className="rounded-full font-bold px-6"
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setImagePreview("")}
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="flex flex-col items-center justify-center w-full h-full px-10 text-center space-y-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="h-16 w-16 bg-muted rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-border/20">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Upload evidence</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        High-quality photos help confirm ownership faster.
                      </p>
                    </div>
                    <div className="px-6 py-2 border-2 border-border rounded-full text-xs font-bold uppercase tracking-widest bg-background group-hover:border-primary group-hover:text-primary transition-all">
                      Browse Files
                    </div>
                  </button>
                )}
                {progress <= 0 && progress > 100 && (<Progress value={progress}/>)}
              </div>
            </div>

            <Card className="bg-primary/5 border-none rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex gap-4">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Privacy Notice</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Personal contact information is hidden. Only authorized
                    personnel and verified owners can contact you through REPOS.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:-translate-y-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>Submit Report</>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter">
              Verify all details before submitting.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddItemPage;
