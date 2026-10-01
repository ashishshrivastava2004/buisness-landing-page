import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { insertWaitlistRecord } from './lib/supabase';

export default function App() {
  // Entry & Reveal States
  const [hasEntered, setHasEntered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Form input state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cipherText, setCipherText] = useState('ENCRYPTING...');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Video fallback state
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle Initial "Tap to Enter" Interaction
  const handleEnter = () => {
    if (hasEntered) return;
    
    // Play video with audio explicitly after user interaction
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(e => console.error("Video play error:", e));
    }

    setHasEntered(true);
    
    // Start the 2.5s reveal timer
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTimeElapsed(Math.min(2.5, elapsed));
      if (elapsed >= 2.5) {
        setIsRevealed(true);
        clearInterval(interval);
      }
    }, 50);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Dynamic cipher animation during encryption
  useEffect(() => {
    if (!isSubmitting) return;
    const ciphers = [
      'HASHING CIPHER...',
      'ENCRYPTING IDENTITY...',
      'VERIFYING ACCESS...',
      'ARCHIVING DOSSIER...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % ciphers.length;
      setCipherText(ciphers[idx]);
    }, 350);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setSubmitError('PLEASE SPECIFY IDENTIFIER / FULL NAME.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setSubmitError('INVALID ELECTRONIC ADDRESS SPECIFIED.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 7) {
      setSubmitError('COMMUNICATION FREQUENCY (PHONE) INCOMPLETE.');
      return;
    }

    setIsSubmitting(true);

    try {
      const [result] = await Promise.all([
        insertWaitlistRecord({
          full_name: fullName,
          email,
          phone,
          drop_code: 'FW26-WAITLIST',
          status: 'verified'
        }),
        new Promise((resolve) => setTimeout(resolve, 1400)) // luxury latency
      ]);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error || 'ARCHIVE REJECTION: UNABLE TO PROCESS.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'CRITICAL ARCHIVE ERROR: PLEASE RETRY.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#eaeaea] overflow-hidden flex flex-col justify-between select-none">
      
      {/* 1. ENTRY SCREEN OVERLAY (Smooth Fade-out on click) */}
      <div 
        onClick={handleEnter}
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white cursor-pointer transition-opacity duration-1000 ease-out ${
          hasEntered ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-[-0.05em] mb-4">
          ANON ATELIER.
        </h1>
        <p className="font-mono-code text-xs tracking-[0.3em] uppercase text-neutral-500 animate-pulse">
          [ TAP TO ENTER ARCHIVE ]
        </p>
      </div>

      {/* 2. CINEMATIC VIDEO BACKGROUND (No overlays, full original video) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {!videoError ? (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            // Filters removed to show raw, high-quality video
            className="w-full h-full object-cover scale-105 transition-opacity duration-1000"
          >
            {/* Supabase Video Link */}
            <source src="https://bjhowrtlyerkqivxjfjr.supabase.co/storage/v1/object/public/brand-assets/Landing%20Page%20Video.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0c0c0c] via-[#050505] to-[#020202] relative" />
        )}
      </div>

      {/* 3. MINIMAL TOP BAR (Glassmorphism removed, pure transparent) */}
      <header className="relative z-30 w-full flex items-center justify-between px-6 md:px-12 py-5 bg-transparent">
        <a
          href="/"
          onClick={(e) => e.preventDefault()}
          className="font-display font-black text-lg md:text-xl tracking-tighter text-white hover:text-white/80 transition-colors uppercase drop-shadow-md"
        >
          ANON ATELIER.
        </a>

        {/* Audio Toggle Button (Blur and background removed) */}
        <button 
          onClick={toggleMute}
          className="p-2 text-white/90 hover:text-white transition-colors cursor-pointer drop-shadow-md"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* 4. MAIN HERO VIEWPORT */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full">
        
        {/* CENTERSTAGE HERO */}
        <div className="text-center relative mb-6 md:mb-8 transition-all duration-700">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Added a subtle text shadow so the logo remains visible even if the video background is bright */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-[-0.06em] text-white leading-none uppercase drop-shadow-2xl">
              ANON ATELIER.
            </h1>
          </motion.div>

          {/* Intro countdown progress bar */}
          {!isRevealed && hasEntered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center gap-2 drop-shadow-lg"
            >
              <div className="text-[11px] font-mono-code text-white/90 tracking-widest uppercase">
                DECRYPTING ARCHIVE... {(timeElapsed).toFixed(1)}S / 2.5S
              </div>
              <div className="w-48 h-0.5 bg-white/30 relative overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${(timeElapsed / 2.5) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* 5. THE REVEAL: SLEEK GLASSMORPHIC WAITLIST FORM */}
        <AnimatePresence mode="wait">
          {isRevealed && !isSuccess && (
            <motion.div
              key="waitlist-form-container"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="relative rounded-none border border-white/20 bg-neutral-950/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
                
                <div className="border-b border-white/20 pb-4 mb-6">
                  <div className="text-[10px] font-mono-code tracking-[0.25em] text-white/60 uppercase">
                    RESTRICTED ACCESS
                  </div>
                  <h2 className="text-base sm:text-lg font-display font-bold uppercase tracking-tight text-white mt-0.5">
                    REQUEST ARCHIVE WAITLIST CIPHER
                  </h2>
                </div>

                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 border border-red-500/40 bg-red-950/50 text-red-300 text-xs font-mono-code flex items-start gap-2.5 backdrop-blur-md"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>{submitError}</div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="group relative">
                    <label htmlFor="full-name" className="block text-[11px] font-mono-code tracking-widest text-white/70 uppercase mb-1 group-focus-within:text-white transition-colors">
                      FULL NAME
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-transparent border-b border-white/30 py-2.5 px-0 text-white font-mono-code text-sm focus:outline-none focus:border-white transition-colors duration-200"
                    />
                  </div>

                  <div className="group relative">
                    <label htmlFor="email-address" className="block text-[11px] font-mono-code tracking-widest text-white/70 uppercase mb-1 group-focus-within:text-white transition-colors">
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-transparent border-b border-white/30 py-2.5 px-0 text-white font-mono-code text-sm focus:outline-none focus:border-white transition-colors duration-200"
                    />
                  </div>

                  <div className="group relative">
                    <label htmlFor="phone-number" className="block text-[11px] font-mono-code tracking-widest text-white/70 uppercase mb-1 group-focus-within:text-white transition-colors">
                      PHONE NUMBER
                    </label>
                    <input
                      id="phone-number"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-transparent border-b border-white/30 py-2.5 px-0 text-white font-mono-code text-sm focus:outline-none focus:border-white transition-colors duration-200"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-white text-black hover:bg-neutral-200 font-mono-code text-xs md:text-sm tracking-[0.2em] font-bold uppercase transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                          <span>{cipherText}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>REQUEST ACCESS CIPHER</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono-code text-white/50 pt-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
                      <span>SECURE ENCRYPTION</span>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* 6. SUCCESS STATE */}
          {isSuccess && (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="border border-white/20 bg-neutral-950/70 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative text-center">
                <div className="flex items-center justify-center gap-3 text-emerald-400 mb-6">
                  <CheckCircle2 className="w-10 h-10 shrink-0" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-4">
                  Access Requested
                </h2>
                <p className="text-xs sm:text-sm font-mono-code text-neutral-300 mb-8 leading-relaxed">
                  Your identity has been registered in the archive. Monitor your communications.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFullName('');
                    setEmail('');
                    setPhone('');
                  }}
                  className="py-3 px-8 border border-white/20 hover:border-white text-xs font-mono-code tracking-widest uppercase text-white hover:bg-white hover:text-black transition-all bg-black/50"
                >
                  RETURN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}