"use client"
import { useState } from 'react';
import {  AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Register from './components/Register';

const LostAndFoundProfessionalAuth = () => {
  const [isLogin, setIsLogin] = useState(true);



  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-110 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4 shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">University Lost & Found</h1>
        <p className="text-sm text-muted-foreground mt-1">Official Student Portal</p>
      </div>

      <div className="w-full max-w-110 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-muted/30">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'bg-card text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'bg-card text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isLogin ? <Login/> : <Register isSuccess={() => setIsLogin(true)} />}
          </AnimatePresence>
        </div>
      </div>

      <footer className="mt-8 flex gap-6 text-xs text-muted-foreground font-medium uppercase tracking-widest">
        {new Date().getFullYear()}-Demolnf
      </footer>
    </div>
  );
};

export default LostAndFoundProfessionalAuth;
