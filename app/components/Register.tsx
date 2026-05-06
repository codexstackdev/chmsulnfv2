"use client";
import { motion } from "motion/react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { authenticator, deleteImage, register } from "../hooks/actions";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const Register = ({ isSuccess }: { isSuccess: () => void }) => {
  const [profilePreview, setProfilePreview] = useState("");
  const [fileRaw, setFileRaw] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    social: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [progress, setProgress] = useState(0);
  const abortController = new AbortController();

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: FileList) => {
    const raw = e[0];
    if (!raw) return toast.error("Please select profile picture");
    const preview = URL.createObjectURL(raw);
    setProfilePreview(preview);
    setFileRaw(raw);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (
      !registerData.confirmPassword ||
      !registerData.email ||
      !registerData.fullName ||
      !registerData.password ||
      !registerData.social ||
      !registerData.studentId
    )
      return toast.error("Missing fields");
    if (!fileRaw) return toast.error("No profie selected");
    if (registerData.confirmPassword !== registerData.password)
      return toast.info("Password didn't match");
    setLoading(true);
    let authParams;
    try {
      authParams = await authenticator();
    } catch (error) {
      console.error(error);
      return;
    }
    const { signature, expire, token, publicKey } = authParams;
    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file: fileRaw,
        fileName: registerData.fullName,
        folder: "/profiles",
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });
      if (uploadResponse) {
        const data = await register(
          registerData.fullName,
          registerData.email,
          registerData.social,
          registerData.password,
          parseInt(registerData.studentId),
          uploadResponse.url as string,
          uploadResponse.fileId as string,
        );
        if (data.success) {
          toast.success(data.message);
          registerData.confirmPassword = "";
          registerData.email = "";
          registerData.fullName = "";
          registerData.password = "";
          registerData.social = "";
          registerData.studentId;
          setProgress(0);
          setProfilePreview("");
          setFileRaw(null);
          isSuccess();
        } else {
          await deleteImage(uploadResponse.fileId as string);
          toast.error(data.message);
        }
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
    <>
      <motion.form onSubmit={handleSubmit} key="register" className="space-y-5">
        <div className="flex items-center gap-6 pb-2">
          <div className="relative group">
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted transition-colors group-hover:border-ring">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <input
                type="file"
                accept="image/png,image/jpg,image/webp"
                onChange={(e) =>
                  handleProfileChange(e.target.files as FileList)
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Profile Photo</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Recommended size 400x400px. Supports JPG or PNG.
            </p>
            <br />
            {progress > 0 && progress === 100 && <Progress value={progress} />}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={registerData.fullName}
              onChange={handleRegisterChange}
              placeholder="codex"
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              School Email
            </label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              placeholder="codex@university.edu"
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Student ID
            </label>
            <Input
              type="number"
              inputMode="numeric"
              required={true}
              pattern="[0-9]*"
              name="studentId"
              value={registerData.studentId}
              onChange={handleRegisterChange}
              placeholder="2024..."
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Social Media URL (Must be active)
          </label>
          <input
            type="url"
            name="social"
            value={registerData.social}
            onChange={handleRegisterChange}
            placeholder="https://instagram.com/codexstackdev"
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              placeholder="••••••••"
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="••••••••"
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus:border-ring outline-none transition-all placeholder:text-muted-foreground"
            />
            {registerData.confirmPassword.length > 0 &&
              registerData.confirmPassword !== registerData.password && (
                <span className="text-red-500 text-xs">
                  Password don't match
                </span>
              )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm mt-2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner className="size-4" /> <span>Creating your account</span>
            </div>
          ) : (
            "Complete Registration"
          )}
        </button>
      </motion.form>
    </>
  );
};

export default Register;
