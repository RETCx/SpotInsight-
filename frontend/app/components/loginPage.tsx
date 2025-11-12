"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Music, Upload, LogOut, User, LogIn } from "lucide-react";

interface NavbarProps {
  hideAuth?: boolean;
}

export default function Navbar({ hideAuth = false }: NavbarProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* --- Logo --- */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/20 transition-transform group-hover:scale-110">
            <Music className="text-black" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            MyMusic<span className="text-green-400">App</span>
          </span>
        </Link>

        {/* --- Actions --- */}
        {!hideAuth && (
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
            ) : status === "authenticated" ? (
              /* --- Logged In State --- */
              <>
                <Link
                  href="/upload"
                  className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white sm:flex"
                >
                  <Upload size={18} />
                  <span>Upload Zip file here</span>
                </Link>

                <div className="h-6 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/10">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-800">
                        <User size={18} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="group ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20"
                  >
                    <LogOut size={16} className="text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </>
            ) : (
              /* --- Logged Out State --- */
              <button
                onClick={() => signIn("spotify")}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-gray-200"
              >
                <LogIn size={18} />
                <span>Login</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}