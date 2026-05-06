"use client"
import { motion } from "motion/react";
import React, { useState } from "react";
import { login } from "../hooks/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    studentId: "",
    password: ""
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLoginChange = (e:React.ChangeEvent<HTMLInputElement>)=> {
    const {name, value} = e.target;
    setLoginData((prev) => ({...prev, [name]: value}));
  }

  const handleSubmit = async(e:React.SubmitEvent)=>{
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(loginData.email, loginData.password);
      if(data.success){
        toast.success(data.message);
        router.replace(`/browse/${data.id}`)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error);
    }
    finally{
      setLoading(false);
    }
  }
  return (
    <>
      <motion.form onSubmit={handleSubmit} key="login" className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleLoginChange}
            placeholder="student@university.edu"
            className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:border-ring focus:ring-4 focus:ring-ring/10 transition-all outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            placeholder="••••••••"
            className="w-full h-11 px-4 rounded-lg border border-input bg-background focus:border-ring focus:ring-4 focus:ring-ring/10 transition-all outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
          {loading ? <div className="flex items-center justify-center gap-2"><Spinner/> <span>Signing In</span></div> : "Sign In"}
        </button>
      </motion.form>
    </>
  );
};

export default Login;
