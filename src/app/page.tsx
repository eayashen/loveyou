"use client";

import { useState, useCallback, useEffect, useRef, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Session & Tracking Helpers                                        */
/* ------------------------------------------------------------------ */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("love_session_id");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("love_session_id", id);
  }
  return id;
}

async function trackVisit(payload: {
  sessionId: string;
  pageType: "login" | "chapter";
  chapterId?: number | null;
  chapterTitle?: string;
  durationSeconds?: number;
}) {
  try {
    await fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* silent — tracking should never break the UI */
  }
}

async function trackMessage(sessionId: string, message: string) {
  try {
    await fetch("/api/track/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    });
  } catch {
    /* silent */
  }
}

/* ------------------------------------------------------------------ */
/*  useHydrated — client-only detection (no hydration mismatch)       */
/* ------------------------------------------------------------------ */
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/* ------------------------------------------------------------------ */
/*  Floating Petals Background                                        */
/* ------------------------------------------------------------------ */
function FloatingPetals({ count = 15 }: { count?: number }) {
  const mounted = useHydrated();
  const items = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 8}s`,
        delay: `${Math.random() * 6}s`,
        size: `${12 + Math.random() * 16}px`,
      })),
    [count]
  );

  if (!mounted) return <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {items.map((s, i) => (
        <span
          key={i}
          className="absolute text-rose-200/40 animate-float-up"
          style={{
            left: s.left,
            "--duration": s.duration,
            "--delay": s.delay,
            fontSize: s.size,
          } as React.CSSProperties}
        >
          ✿
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkle particles                                                 */
/* ------------------------------------------------------------------ */
function SparklesOverlay() {
  const mounted = useHydrated();
  const items = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => ({
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        delay: `${Math.random() * 3}s`,
        size: `${10 + Math.random() * 14}px`,
      })),
    []
  );

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {items.map((s, i) => (
        <span
          key={i}
          className="absolute text-amber-300/60 animate-sparkle"
          style={{
            left: s.left,
            top: s.top,
            "--delay": s.delay,
            fontSize: s.size,
          } as React.CSSProperties}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LOGIN SCREEN                                                      */
/* ------------------------------------------------------------------ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const enterTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    inputRef.current?.focus();
    enterTimeRef.current = Date.now();
    const sid = getSessionId();
    trackVisit({ sessionId: sid, pageType: "login", durationSeconds: 0 });

    return () => {
      const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
      trackVisit({ sessionId: sid, pageType: "login", durationSeconds: duration });
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim()) return;

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();

        if (data.success) {
          const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
          trackVisit({ sessionId: getSessionId(), pageType: "login", durationSeconds: duration });
          onLogin();
        } else {
          setError(data.message);
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      } catch {
        setError("Network error, please try again");
      } finally {
        setIsLoading(false);
      }
    },
    [password, onLogin]
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <FloatingPetals count={18} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-sm mx-4 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
      >
        <div className="glass rounded-3xl p-8 shadow-xl shadow-rose-200/40 border border-rose-100/60">
          {/* Hi text */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-300/50">
              <span className="text-2xl text-white font-cursive font-bold">Hi</span>
            </div>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-cursive text-3xl text-rose-600 mb-2">
              Just for You
            </h1>
            <p className="text-sm text-rose-400/80 font-serif">
              Written with nothing but truth...
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
              <Input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                placeholder="Secret key.."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="pl-10 pr-10 h-12 rounded-2xl border-rose-200 bg-white/60 focus:bg-white/90 text-rose-800 placeholder:text-rose-300 font-serif text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-500 text-center font-serif"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-cursive text-lg shadow-lg shadow-rose-300/40 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                "Decrypt >>>"
              )}
            </Button>
          </form>
        </div>


      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAPTER DATA                                                      */
/* ------------------------------------------------------------------ */
interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  content: React.ReactNode;
  bgGradient: string;
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "তোমাকেই প্রথম বলা",
    subtitle: "আরে হাই, কিছু কথা ছিল মাথায়...",
    image: "/love-images/chapter1-meet.png",
    bgGradient: "from-rose-50 via-pink-50 to-orange-50",
    content: (
      <div className="space-y-6">
        <p className="text-rose-700/90 leading-relaxed text-base">
          আরে হাই, কিছু কথা ছিল মাথায়
          <br />
          যা আমি বলে দিতে চাই।
          <br />
          কিন্তু উপায় কোথায়?
        </p>
        <p className="text-rose-700/90 leading-relaxed text-base">
          আমি জানি না কীভাবে শুরু করা উচিত, তবে আজ নিজের মনের কথাগুলো তোমাকে না বললে হয়তো সারাজীবন একটা আফসোস থেকে যাবে—কেন সেদিন সাহস করে সত্যিটা বললাম না!
        </p>
        <p className="text-rose-700/90 leading-relaxed text-base">
          সত্যি বলতে, কাউকে আলাদা করে পছন্দ করা বা নিজের মতো করে কাউকে খোঁজার চিন্তা আমার কখনোই ছিল না। ভেবেছিলাম, মা যাঁর সাথে বিয়ের কথা বলবেন, তাঁকেই গ্রহণ করে নিজের মতো গুছিয়ে চলব।
        </p>
        <p className="text-rose-700/90 leading-relaxed text-base">
          কিন্তু তোমাকে দেখার পর আমার সেই স্বাভাবিক চিন্তাগুলো একদম বদলে গেল।
        </p>
        <p className="text-rose-700/90 leading-relaxed text-base">
          আমি বিষয়টা পারিবারিকভাবে তোমার পরিবারকে জানাতে পারতাম। কিন্তু আমার মনে হলো, যাকে নিয়ে আমি স্বপ্ন দেখছি, তাঁর মতামতটাই তো সবার আগে নেওয়া দরকার। তোমার পছন্দ-অপছন্দের একটি বড় বিষয় আছে; তাই সেটিকে সর্বোচ্চ সম্মান জানিয়ে এবং যাকে মনে মনে এতটা ভালোবেসে ফেলেছি তার জন্য স্পেশাল কিছু করার ইচ্ছা থেকেই এইভাবে তোমাকে জানালাম।
        </p>
      </div>
    ),
  },
  {
    id: 2,
    title: "What I Adore About You",
    subtitle: "A love letter in progress...",
    image: "/love-images/chapter2-adore.png",
    bgGradient: "from-amber-50 via-rose-50 to-pink-50",
    content: (
      <div className="space-y-5">
        {[
          "The way your eyes light up when you talk about something you love",
          "Your laugh — the real one, when you can&apos;t hold it in anymore",
          "How you care so deeply about everyone around you",
          "The little things you do that you think nobody notices (but I always do)",
          "Your strength, your kindness, your beautiful soul",
          "The way you make every ordinary moment feel extraordinary",
          "Your imperfect perfection — every flaw makes you more beautiful to me",
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            viewport={{ once: true }}
            className="flex items-start gap-3"
          >
            <span className="text-rose-300 mt-1 shrink-0 w-2.5 h-2.5 rounded-full bg-rose-300/60" />
            <p className="text-rose-700/90 text-base leading-relaxed">
              {item}
            </p>
          </motion.div>
        ))}
        <div className="flex justify-center pt-4">
          <span className="font-cursive text-2xl text-rose-400">And so much more...</span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Our Journey Together",
    subtitle: "Every step has been worth it...",
    image: "/love-images/chapter3-journey.png",
    bgGradient: "from-orange-50 via-amber-50 to-rose-50",
    content: (
      <div className="space-y-6">
        <p className="text-rose-700/90 leading-relaxed text-base">
          Every day with you has been an adventure. From late-night talks to
          morning coffees, from silly moments to deep conversations — we&apos;ve built
          something truly special together.
        </p>
        <div className="space-y-4 pl-2">
          {[
            { time: "The beginning", memory: "Those nervous first words that turned into endless conversations" },
            { time: "Getting closer", memory: "The moment I realized you were becoming my favorite person" },
            { time: "Growing together", memory: "Every challenge that only made us stronger" },
            { time: "Right now", memory: "Looking at you and knowing I want this forever" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative pl-6 border-l-2 border-rose-200/60"
            >
              <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-rose-300 shadow-sm" />
              <p className="font-cursive text-rose-500 text-lg">{item.time}</p>
              <p className="text-rose-700/80 text-sm mt-1 leading-relaxed">
                {item.memory}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <span className="font-cursive text-2xl text-rose-400">And the best is yet to come.</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "You&apos;re My Everything",
    subtitle: "Words will never be enough...",
    image: "/love-images/chapter4-everything.png",
    bgGradient: "from-rose-50 via-fuchsia-50 to-amber-50",
    content: (
      <div className="space-y-6">
        <p className="text-rose-700/90 leading-relaxed text-base">
          You are my first thought in the morning and my last before I sleep.
          You are the calm in my storm, the warmth on my coldest days,
          and the reason I believe in forever.
        </p>
        <div className="bg-white/50 rounded-2xl p-6 border border-rose-100/40">
          <p className="font-cursive text-xl text-rose-500 text-center leading-relaxed">
            &ldquo;In a world full of chaos,
            <br />
            you are my peace.
            <br />
            In a life full of questions,
            <br />
            you are my answer.
            <br />
            In a heart full of dreams,
            <br />
            you are the only one I dream about.&rdquo;
          </p>
        </div>
        <p className="text-rose-700/90 leading-relaxed text-base">
          I don&apos;t need a perfect love story. I just need one with you.
          And that, my darling, is already the most beautiful story ever written.
        </p>
        <div className="flex justify-center pt-2">
          <span className="font-cursive text-2xl text-rose-400">You make my heart complete.</span>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "The Question",
    subtitle: "The most important words I&apos;ll ever say...",
    image: "/love-images/chapter5-proposal.png",
    bgGradient: "from-pink-50 via-rose-50 to-fuchsia-50",
    content: null,
  },
];

/* ------------------------------------------------------------------ */
/*  CELEBRATION POPUP MODAL                                           */
/* ------------------------------------------------------------------ */
function CelebrationPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="glass rounded-3xl p-8 shadow-2xl shadow-rose-300/40 border border-rose-100/60 text-center">
              <SparklesOverlay />

              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4"
              >
                <span className="text-5xl block">✨</span>
              </motion.div>

              <h2 className="font-cursive text-3xl text-rose-500 mb-2">
                You Said Yes!
              </h2>
              <p className="text-rose-600/70 text-sm font-serif mb-1">
                This is the happiest moment of my life.
              </p>
              <p className="font-cursive text-lg text-rose-400">
                I love you, forever and always.
              </p>

              <p className="text-xs text-rose-300/50 mt-5 font-serif">
                Closing automatically...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  PROPOSAL CHAPTER (Special)                                        */
/* ------------------------------------------------------------------ */
function ProposalChapter({ sessionId, onSayYes }: { sessionId: string; onSayYes: () => void }) {
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const messageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleYes = () => {
    setShowPopup(true);
  };

  const handlePopupClose = useCallback(() => {
    setShowPopup(false);
  }, []);

  // Debounced message save
  const handleMessageChange = useCallback(
    (value: string) => {
      setMessage(value);
      if (messageDebounceRef.current) clearTimeout(messageDebounceRef.current);
      if (value.trim()) {
        messageDebounceRef.current = setTimeout(() => {
          trackMessage(sessionId, value);
        }, 1500);
      }
    },
    [sessionId]
  );

  // Save message on unmount if there's content
  useEffect(() => {
    return () => {
      if (messageDebounceRef.current) clearTimeout(messageDebounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <SparklesOverlay />

      <div className="space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-rose-700/90 leading-relaxed text-base mb-8">
            I&apos;ve been wanting to say this for a long time, and there&apos;s no
            better moment than now. You&apos;ve made every single day brighter,
            every moment more meaningful, and every dream worth chasing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="py-6"
        >
          <p className="font-cursive text-3xl md:text-4xl text-rose-500 mb-2">
            Will you be mine?
          </p>
          <p className="text-rose-400/70 text-sm font-serif">
            Forever and always
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
        >
          <Button
            onClick={handleYes}
            className="h-14 px-10 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 hover:from-rose-500 hover:via-pink-600 hover:to-fuchsia-600 text-white font-cursive text-xl shadow-xl shadow-rose-300/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-400/60 hover:scale-105"
          >
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Yes!
            </motion.span>
          </Button>
        </motion.div>

        {/* Textarea section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="pt-4"
        >
          <p className="font-cursive text-lg text-rose-500 mb-3">
            Say something about me
          </p>
          <Textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Write whatever is in your heart..."
            className="min-h-[100px] rounded-2xl border-rose-200 bg-white/60 backdrop-blur-sm focus:bg-white/90 text-rose-800 placeholder:text-rose-300 font-serif text-sm resize-none"
          />
        </motion.div>
      </div>

      {/* Celebration popup */}
      <CelebrationPopup open={showPopup} onClose={handlePopupClose} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CELEBRATION SCREEN                                                */
/* ------------------------------------------------------------------ */
function CelebrationScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <FloatingPetals count={30} />
      <SparklesOverlay />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10 text-center px-6 max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <span className="text-7xl block mb-4">✨</span>
        </motion.div>

        <h1 className="font-cursive text-5xl md:text-6xl text-rose-500 mb-6">
          Forever Yours
        </h1>

        <div className="glass rounded-3xl p-8 shadow-xl shadow-rose-200/40 border border-rose-100/60 mb-6">
          <p className="font-cursive text-2xl text-rose-500 mb-3">
            Every love story is beautiful,
          </p>
          <p className="font-cursive text-2xl text-rose-400">
            but ours is my favorite.
          </p>
        </div>

        <p className="text-rose-600/60 text-sm font-serif">
          This is just the beginning of our forever...
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAPTER PAGE                                                      */
/* ------------------------------------------------------------------ */
function StoryPage({ onSayYes }: { onSayYes: () => void }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [direction, setDirection] = useState(1);
  const sessionIdRef = useRef("");
  const enterTimeRef = useRef<number>(Date.now());
  const prevChapterRef = useRef(0);

  // Init session
  useEffect(() => {
    sessionIdRef.current = getSessionId();
    enterTimeRef.current = Date.now();
  }, []);

  const goToChapter = useCallback(
    (index: number) => {
      if (index < 0 || index >= chapters.length) return;

      // Track the current chapter before leaving
      const chapter = chapters[prevChapterRef.current];
      const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
      trackVisit({
        sessionId: sessionIdRef.current,
        pageType: "chapter",
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        durationSeconds: duration,
      });

      setDirection(index > currentChapter ? 1 : -1);
      setCurrentChapter(index);
      enterTimeRef.current = Date.now();
      prevChapterRef.current = index;

      // Scroll to top on chapter change
      window.scrollTo({ top: 0, behavior: "instant" });
    },
    [currentChapter]
  );

  const goNext = useCallback(() => goToChapter(currentChapter + 1), [currentChapter, goToChapter]);
  const goPrev = useCallback(() => goToChapter(currentChapter - 1), [currentChapter, goToChapter]);

  // Track when leaving the page (chapter 1 initial visit)
  useEffect(() => {
    const sid = sessionIdRef.current;
    return () => {
      const chapter = chapters[prevChapterRef.current];
      const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
      trackVisit({
        sessionId: sid,
        pageType: "chapter",
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        durationSeconds: duration,
      });
    };
  }, []);

  const chapter = chapters[currentChapter];
  const isProposal = currentChapter === chapters.length - 1;
  const progress = ((currentChapter + 1) / chapters.length) * 100;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${chapter.bgGradient} relative overflow-hidden`}
    >
      <FloatingPetals count={10} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-rose-100/50">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-300 to-pink-400"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Chapter counter */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <span className="text-xs text-rose-400/60 font-serif bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
          {currentChapter + 1} / {chapters.length}
        </span>
      </div>

      {/* Main content area */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentChapter}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full max-w-md mx-auto"
          >
            {/* Chapter header */}
            <div className="text-center mb-8">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs uppercase tracking-widest text-rose-400/60 font-serif mb-2"
              >
                Chapter {chapter.id}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-cursive text-3xl md:text-4xl text-rose-600 mb-2"
              >
                {chapter.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-sm text-rose-400/70 font-serif italic"
              >
                {chapter.subtitle}
              </motion.p>
            </div>

            {/* Chapter image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative w-full max-w-xs mx-auto mb-8 rounded-3xl overflow-hidden shadow-xl shadow-rose-200/30 aspect-[768/1344]"
            >
              <Image
                src={chapter.image}
                alt={chapter.title}
                fill
                className="object-cover"
                priority={currentChapter < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            </motion.div>

            {/* Chapter content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {isProposal ? (
                <ProposalChapter sessionId={sessionIdRef.current} onSayYes={onSayYes} />
              ) : (
                <div className="glass rounded-3xl p-6 md:p-8 shadow-lg shadow-rose-100/20 border border-rose-100/30">
                  {chapter.content}
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-6 pt-8 bg-gradient-to-t from-white/60 via-white/30 to-transparent pointer-events-none">
          <div className="flex items-center justify-center gap-6 max-w-md mx-auto px-4 pointer-events-auto">
            <Button
              onClick={goPrev}
              disabled={currentChapter === 0}
              variant="outline"
              className="h-11 w-11 rounded-full border-rose-200 bg-white/70 backdrop-blur-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all duration-300"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex items-center gap-2">
              {chapters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToChapter(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentChapter
                      ? "w-6 h-2.5 bg-rose-400 shadow-sm shadow-rose-300/50"
                      : "w-2.5 h-2.5 bg-rose-200/60 hover:bg-rose-300/80"
                  }`}
                  aria-label={`Go to chapter ${i + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={goNext}
              disabled={currentChapter === chapters.length - 1}
              variant="outline"
              className="h-11 w-11 rounded-full border-rose-200 bg-white/70 backdrop-blur-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all duration-300"
              aria-label="Next chapter"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */
export default function LovePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (showCelebration) {
    return <CelebrationScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <StoryPage onSayYes={() => setShowCelebration(true)} />;
}
