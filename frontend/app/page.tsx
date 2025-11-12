"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Login from "@/app/components/loginPage"; // Navbar
import NowPlaying from "@/app/components/nowPlaying"; 
import { PlayCircle } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [lastSync, setLastSync] = useState<string | null>(null);

  // --- Logic เดิมของคุณ (เก็บไว้เผื่อใช้แสดง Last update) ---
  useEffect(() => {
    if (status !== "authenticated") return;
    const syncTrack = async () => {
      try {
        // await fetch("/api/track"); 
        setLastSync(new Date().toLocaleTimeString());
      } catch (err) { console.error(err); }
    };
    syncTrack();
    const interval = setInterval(syncTrack, 30000);
    return () => clearInterval(interval);
  }, [status]);

  // 1. Loading State
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. Guest View (Landing Page)
  if (status === "unauthenticated" || !session) {
    return (
      <main className="relative flex min-h-screen flex-col bg-neutral-950 text-white">
        {/* ส่ง prop hideAuth เพื่อซ่อนปุ่ม Login ด้านบน (ถ้า Component รองรับ) */}
        <Login hideAuth={true} /> 
        
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/20 blur-[100px]" />
          
          <h1 className="mb-6 text-5xl font-bold tracking-tighter sm:text-7xl">
            Your Music, <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              Synced Perfectly.
            </span>
          </h1>
          <p className="mb-8 max-w-lg text-lg text-gray-400">
            Connect your Spotify account to start tracking your listening history.
          </p>
          
          <button
            onClick={() => signIn("spotify", { callbackUrl: "/" })}
            className="group flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-black transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/30"
          >
            <PlayCircle size={24} className="transition-transform group-hover:scale-110" />
            Start Listening Now
          </button>
        </div>
      </main>
    );
  }

  // 3. Authenticated View (Dashboard)
  return (
    <main className="min-h-screen bg-neutral-950 pb-10 selection:bg-green-500/30">
      <Login /> {/* Navbar */}
      
      {/* Main Layout Container */}
      <div className="container mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-6 pt-20 md:pt-0">
        
        {/* Header Text (เพิ่มเพื่อให้ดูมีมิติขึ้น) */}
        <div className="mb-8 w-full text-center md:text-left md:pl-4">
           <h2 className="text-3xl font-bold text-white">
           </h2>
           <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
              <p>Welcome back, {session.user?.name}</p>
              {lastSync && <span className="text-xs opacity-50">• Last sync: {lastSync}</span>}
           </div>
        </div>

        {/* เรียกใช้ Component Wide Capsule ที่นี่ */}
        <div className="w-full">
            {/* เราใช้ session.accessToken ถ้าไม่มีให้ส่ง string ว่างไปก่อนเพื่อกัน Crash */}
            <NowPlaying accessToken={session.accessToken as string || ""} />
        </div>

      </div>
    </main>
  );
}