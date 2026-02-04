"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Zap, Search, Layers, Share2, Shield, Globe, Star, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    { title: "Memory Proxy", desc: "Own your context. Seamlessly port your prompts between AI platforms instantly.", icon: <Layers className="w-5 h-5 text-indigo-400" /> },
    { title: "Web Shuttles", desc: "1-Click transport to Claude, GPT, or Gemini. No copy-pasting required.", icon: <ChevronRight className="w-5 h-5 text-purple-400" /> },
    { title: "Native IDE Bridge", desc: "Pipe your browser research directly into VS Code for a distraction-free flow.", icon: <Zap className="w-5 h-5 text-blue-400" /> },
    { title: "Pro Scrapers", desc: "Deep extraction for DeepSeek, Grok, Perplexity, and complex model interfaces.", icon: <Search className="w-5 h-5 text-indigo-400" /> },
    { title: "Local Privacy", desc: "Your data stays on your machine. Zero remote servers, zero data mining.", icon: <Shield className="w-5 h-5 text-purple-400" /> },
    { title: "Expert Packs", desc: "Deploy tailored personalities like System Architect with one click.", icon: <Star className="w-5 h-5 text-blue-400" /> }
  ];

  return (
    <div className="bg-[#020617] text-[#f8fafc] min-h-screen selection:bg-indigo-500/30 antialiased overflow-x-hidden">

      {/* 🚀 POLISHED NAVBAR */}
      <header className="sticky top-0 z-[200] bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 w-full h-[clamp(5rem,10vh,6.5rem)] flex items-center transition-all">
        <div className="w-[92%] max-w-[1440px] mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-[clamp(2rem,4vw,2.5rem)] h-[clamp(2rem,4vw,2.5rem)] rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg group-hover:rotate-12 transition-transform">B</div>
            <span className="text-[clamp(1.2rem,2.5vw,1.5rem)] font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors">BridgeContext</span>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-[clamp(2rem,4vw,3rem)] text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            {["Features", "Marketplace"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white hover:tracking-[0.35em] transition-all duration-300">{item}</a>
            ))}
          </nav>

          <a
            href="https://chromewebstore.google.com/detail/bridgecontext/kgfdnbpnjilbclbobhcmnbbkfenlfafh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-[clamp(1.5rem,3vw,2.5rem)] py-[0.75rem] rounded-2xl font-bold text-[clamp(0.7rem,1.5vw,0.875rem)] shadow-2xl transition-all"
            >
              Install Extension
            </motion.button>
          </a>
        </div>
      </header>

      <main>

        {/* 🚀 POLISHED HERO */}
        <section className="relative py-[clamp(4rem,12vh,10rem)] px-[4%]">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-indigo-600/5 blur-[12vw] -z-10 rounded-full animate-pulse" />

          <div className="w-full max-w-[1440px] mx-auto">
            <div className="grid lg:grid-cols-2 gap-[clamp(4rem,10vw,8rem)] items-center">

              <div className="flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)] items-start">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[clamp(0.55rem,1vw,0.7rem)] font-black tracking-[0.45em] text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-sm"
                >
                  <Star className="w-3 h-3 fill-indigo-400" />
                  Universal Intelligence Bridge
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[clamp(2.5rem,7.5vw,6rem)] font-black leading-[1.02] tracking-tight text-white m-0"
                >
                  Total Control. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400">Infinite Proof.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[clamp(1.1rem,2.2vw,1.35rem)] text-slate-400 max-w-xl leading-relaxed font-medium m-0"
                >
                  Stop manual context switching. Link your knowledge across ChatGPT, Claude, and Gemini into one unified bridge.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-6"
                >
                  <a
                    href="https://chromewebstore.google.com/detail/bridgecontext/kgfdnbpnjilbclbobhcmnbbkfenlfafh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <button className="group w-full px-[clamp(2.5rem,5vw,4rem)] py-[clamp(1.2rem,2.5vw,1.5rem)] bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95">
                      Start Bridging — Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </a>
                  <button className="px-[clamp(2.5rem,5vw,4rem)] py-[clamp(1.2rem,2.5vw,1.5rem)] bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all">
                    Live Demo
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-6 pt-10"
                >
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-14 h-14 rounded-full border-4 border-[#020617] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[clamp(0.6rem,1.2vw,0.75rem)] font-black uppercase tracking-[0.25em] text-slate-500 leading-tight">
                    <span className="text-white">Active globally</span> <br />
                    Joined by 10,000+ power users
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative w-full"
              >
                <div className="relative aspect-video lg:aspect-square rounded-[clamp(2.5rem,6vw,5rem)] border border-white/10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden glass p-[clamp(1rem,3vw,2rem)]">
                  <div className="relative w-full h-full rounded-[clamp(2rem,5vw,4rem)] overflow-hidden group">
                    <Image
                      src="/images/landing_page_hero_v3_clear.png"
                      alt="BridgeContext Application"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-[4000ms]"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent mix-blend-overlay" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 🚀 POLISHED FEATURES */}
        <section id="features" className="py-[clamp(8rem,18vh,14rem)] bg-slate-950/40 px-[4%] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-purple-600/5 blur-[15vw] -z-10 rounded-full" />

          <div className="w-full max-w-[1440px] mx-auto">
            <div className="max-w-[clamp(35rem,65vw,55rem)] mb-[clamp(5rem,10vw,8rem)] flex flex-col gap-8">
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.92] tracking-tighter m-0 lowercase first-letter:uppercase">Universal tools. <br /> <span className="text-slate-500">personal control.</span></h2>
              <p className="text-slate-400 text-[clamp(1.1rem,2vw,1.4rem)] font-medium leading-relaxed m-0 max-w-2xl">Stop letting native AI silos lock your intelligence. We build the layer that lets your context flow freely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(2rem,4vw,3.5rem)]">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-[clamp(2.5rem,5vw,4rem)] rounded-[clamp(2.5rem,5vw,3.5rem)] bg-white/[0.015] border border-white/5 flex flex-col gap-[clamp(2rem,4vw,2.5rem)] glowing-card group hover:bg-white/[0.03]"
                >
                  <div className="w-[clamp(4rem,6vw,5rem)] h-[clamp(4rem,6vw,5rem)] bg-white/[0.02] rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner group-hover:rotate-6 transition-transform">
                    {f.icon}
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[clamp(0.65rem,1vw,0.8rem)] font-black tracking-[0.45em] uppercase text-indigo-400/80 group-hover:text-indigo-400 transition-colors">{f.title}</h3>
                    <p className="text-[clamp(1rem,1.6vw,1.2rem)] text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 POLISHED MARKETPLACE */}
        <section id="pro" className="py-[clamp(8rem,20vh,15rem)] px-[4%]">
          <div className="w-full max-w-[1280px] mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-[clamp(3rem,10vw,10rem)] rounded-[clamp(4rem,8vw,6rem)] overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-[0_80px_150px_-40px_rgba(0,0,0,0.9)] flex flex-col items-center text-center gap-[clamp(2.5rem,5vw,4rem)]"
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[50vw] h-[50vw] bg-indigo-600/10 blur-[10vw] rounded-full animate-pulse" />

              <span className="px-6 py-2.5 text-[clamp(0.55rem,1.2vw,0.7rem)] font-black tracking-[0.5em] text-indigo-400 uppercase bg-indigo-500/10 rounded-full border border-indigo-500/20">The Forge</span>

              <h2 className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-tighter leading-none m-0 text-white lowercase">The marketplace.</h2>

              <p className="text-[clamp(1.1rem,2.5vw,1.6rem)] text-slate-400 max-w-[55rem] leading-relaxed font-medium m-0 lowercase first-letter:uppercase">The future of expert intelligence. Buy and sell specialized context packs used by the world's elite AI engineers.</p>

              <button className="group relative px-[clamp(3rem,8vw,6rem)] py-[clamp(1.5rem,3vw,2rem)] bg-white text-slate-950 rounded-[2.5rem] font-black text-[clamp(1.1rem,2.2vw,1.6rem)] shadow-[0_25px_60px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
                Join Waitlist
                <span className="absolute inset-0 rounded-[2.5rem] ring-4 ring-white/10 group-hover:ring-white/20 transition-all" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* 🚀 POLISHED FOOTER */}
        <footer className="py-[clamp(5rem,10vh,8rem)] border-t border-white/5 bg-[#010108] px-[4%]">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-[clamp(4rem,8vw,6rem)]">
            <div className="flex flex-col items-center md:items-start gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl">B</div>
                <span className="text-[clamp(1.5rem,2.5vw,1.8rem)] font-black tracking-tighter">BridgeContext</span>
              </div>
              <p className="text-slate-500 text-[clamp(0.8rem,1.4vw,1rem)] max-w-sm leading-relaxed text-center md:text-left font-medium">Empowering master over your digital intelligence.</p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-12">
              <div className="flex gap-[clamp(2rem,4vw,3.5rem)] text-[clamp(0.8rem,1.4vw,1rem)] font-bold uppercase tracking-[0.3em] text-slate-400">
                {["Twitter", "Privacy", "Terms", "Support"].map(link => (
                  <a key={link} href="#" className="hover:text-white hover:translate-y-[-2px] transition-all">{link}</a>
                ))}
              </div>
              <p className="text-slate-700 text-[clamp(0.6rem,1.2vw,0.75rem)] font-black tracking-[0.5em]">© 2026 BRIDGE CONTEXT / ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
