"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Login from "@/app/components/loginPage"; // ตรวจสอบ Path ให้ถูกต้อง
import { Upload, FileArchive, CheckCircle, AlertCircle, X } from "lucide-react";

export default function UploadPage() {
  const { status } = useSession();
  
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    lifestyle: "", 
  });
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // ตรวจสอบว่าเป็นไฟล์ .zip หรือไม่
      if (selectedFile.type === "application/zip" || selectedFile.type === "application/x-zip-compressed" || selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: "Please upload a .zip file only." });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.age || !formData.sex) {
      setMessage({ type: 'error', text: "Please fill in all required fields and select a file." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // 1. เตรียมข้อมูลส่ง Server (Multipart Form Data)
      const data = new FormData();
      data.append("file", file);
      data.append("age", formData.age);
      data.append("sex", formData.sex);
      data.append("lifestyle", formData.lifestyle);

      // 2. ส่งไป API (คุณต้องสร้าง API route นี้)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      // 3. Success
      setMessage({ type: 'success', text: "Upload successful!" });
      setFile(null);
      setFormData({ age: "", sex: "", lifestyle: "" }); // Reset form
      
    } catch (error) {
      setMessage({ type: 'error', text: "Something went wrong. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  // --- Loading / Auth Checks ---
  if (status === "loading") return <div className="min-h-screen bg-neutral-950" />;
  
  return (
    <main className="min-h-screen bg-neutral-950 pb-10 text-white selection:bg-green-500/30">
      <Login />

      <div className="container mx-auto max-w-2xl px-6 pt-24">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Upload Your Data</h1>
          <p className="text-gray-400 mt-2">Share your listening history history (zip file) to generate insights.</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Group 1: Demographics */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Age Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Age <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="e.g. 24"
                  required
                />
              </div>

              {/* Sex Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sex <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                    required
                  >
                    <option value="" disabled className="text-gray-500">Select option</option>
                    <option value="male" className="bg-gray-900">Male</option>
                    <option value="female" className="bg-gray-900">Female</option>
                    <option value="other" className="bg-gray-900">Other / Prefer not to say</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Lifestyle (Optional) */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-medium text-gray-300">
                <span>Lifestyle / Bio</span>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
              </label>
              <textarea
                rows={3}
                value={formData.lifestyle}
                onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none"
                placeholder="Tell us a bit about your music listening habits..."
              />
            </div>

            {/* Group 3: File Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Spotify Data (.zip) <span className="text-red-500">*</span></label>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-all hover:border-green-500/50 hover:bg-green-500/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                    <Upload className="text-gray-400 group-hover:text-green-400" size={24} />
                  </div>
                  <p className="mb-1 text-sm font-medium text-white">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">ZIP files only (max 50MB)</p>
                </div>
              ) : (
                // Selected File State
                <div className="relative flex items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                    <FileArchive size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-green-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full p-1 hover:bg-white/10 text-gray-400 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <input 
                type="file" 
                accept=".zip,application/zip,application/x-zip-compressed" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            {/* Feedback Message */}
            {message && (
              <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !file || !formData.age || !formData.sex}
              className="w-full rounded-xl bg-green-500 py-3.5 text-sm font-bold text-black shadow-lg shadow-green-500/20 transition-all hover:bg-green-400 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"/>
                  Uploading...
                </span>
              ) : (
                "Submit Data"
              )}
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}