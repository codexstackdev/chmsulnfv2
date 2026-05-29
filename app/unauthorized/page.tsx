'use client'

import React, { useEffect } from 'react'
import { AlertCircle, Lock, ArrowLeft, Home } from 'lucide-react'
import { useUser } from '../store'
import { useRouter } from 'next/navigation'

const UnauthorizedPage = () => {
  const router = useRouter();
  const user = useUser((s) => s.clearUser);
  useEffect(() => {
    user();
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-linear-to-r from-destructive via-primary to-destructive"></div>

          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"></div>
                <div className="relative bg-linear-to-br from-destructive/20 to-destructive/10 p-6 rounded-full border border-destructive/30">
                  <Lock className="w-12 h-12 text-destructive" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-full">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-destructive">Error 403</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                Access Denied
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                You don't have permission to access this resource. Please contact your administrator if you believe this is a mistake.
              </p>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Insufficient Permissions</p>
                  <p className="text-xs text-muted-foreground mt-1">Your current role does not have access to this page</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">Request More Access</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact your administrator to request elevated permissions</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.replace("/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-all duration-200 border border-border hover:border-primary/50 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Go Back To Login Page
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                If you need assistance, please{' '}
                <a href="mailto:fazxe21@gmail.com" className="text-primary hover:underline font-semibold">
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
          <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
