import { Shield, Zap, Globe, Users, ArrowRight, Play, Hexagon, Link, FileCheck, ShieldCheck, Sparkles, Search, Check, Rocket, Twitter, Facebook, Instagram, Linkedin, ArrowUp, Mail, Lock, User, Eye, EyeOff, UserPlus, LogOut, X, Menu, BarChart2, Cpu, Link as LinkIcon, Hash } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc, runTransaction, getCountFromServer } from 'firebase/firestore';
import { auth, db } from './firebase';
import { presenceService } from './messaging/services/presenceService';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role === 'admin' && data.isActive === true) {
              navigate('/admin/dashboard');
              return;
            }
          }
        } catch (err) {
          console.warn("Admin check error:", err);
        }
        
        const lastPage = localStorage.getItem('last_chat_path') || '/messages';
        navigate(lastPage);
      } else {
        setUser(currentUser);
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#050816]"></div>;
  }

  return (
    <div className="bg-[#050816] text-white overflow-x-hidden font-sans relative selection:bg-purple-500/30">
      
      <div className="relative w-full bg-[#050816] flex flex-col">
        
        {/* Header Wrapper */}
        <div className="w-full relative z-20">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
            {/* Header */}
            <header className="flex items-center justify-between py-6 lg:py-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-[2px]">
                  <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
                    <Hexagon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-[20px] md:text-[28px] font-display font-bold tracking-tight text-white leading-tight">
                    Exchange<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d946ef]">Hube</span>
                  </h1>
                  <p className="text-[12px] md:text-[14px] text-[#B8C0D0] tracking-wide mt-0.5">Exchange. Connect. Grow.</p>
                </div>
              </div>
              
              {user ? (
                <button onClick={handleLogout} className="relative group overflow-hidden rounded-full p-[1px]">
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative px-6 py-2 bg-[#050816]/80 backdrop-blur-md rounded-full flex items-center gap-2 transition-all duration-300 group-hover:bg-transparent">
                    <span className="font-medium text-sm">Log Out</span>
                    <LogOut className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <button onClick={() => navigate('/signup')} className="relative group overflow-hidden rounded-full p-[1px]">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative px-6 py-2 bg-[#050816]/80 backdrop-blur-md rounded-full flex items-center gap-2 transition-all duration-300 group-hover:bg-transparent">
                    <span className="font-medium text-sm">Sign Up</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </header>
          </div>
        </div>

        {/* Hero Section Wrapper */}
        <div className="relative w-full bg-[url('/hero-background.png')] bg-cover bg-center bg-no-repeat pt-2 md:pt-0 pb-16 md:pb-24">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full flex flex-col">
            {/* Hero Section */}
            <main className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center w-full">
          
              {/* Left: Text Content */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left z-10 w-full max-w-[600px] mx-auto md:mx-0">
                <div className="inline-flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 md:mb-8">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-blue-200/80 uppercase">Connect Today, Grow Tomorrow</span>
                </div>

                <h2 className="text-[32px] sm:text-[38px] md:text-[44px] lg:text-[56px] xl:text-[64px] font-display font-[750] leading-[1.1] tracking-tight mb-6 md:mb-8">
                  The World Connects.<br />
                  Opportunities Grow.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Success Follows.
                  </span>
                </h2>

                <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] text-[#B8C0D0] w-full max-w-[480px] mb-8 md:mb-10 leading-[1.6] font-light">
                  ExchangeHube connects people, ideas, and opportunities
                  through smart exchange solutions that empower businesses,
                  creators, and communities worldwide.
                </p>

                <div className="flex flex-row items-center justify-center md:justify-start gap-3 md:gap-5 w-full flex-wrap sm:flex-nowrap">
                  <button onClick={() => navigate('/signup')} className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white text-[14px] md:text-[16px] shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 group whitespace-nowrap">
                    Explore
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 font-semibold text-white text-[14px] md:text-[16px] transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 group whitespace-nowrap">
                    See How
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" />
                  </button>
                </div>
              </div>

              {/* Right: Image Container */}
              <div className="w-full relative flex items-center justify-center lg:justify-end mt-16 md:mt-0 lg:pr-12 xl:pr-24">
                <div className="w-[160px] sm:w-[220px] md:w-[240px] lg:w-[280px] xl:w-[320px] aspect-square flex flex-col items-center justify-center relative">
                  
                  {/* Connecting Lines Layer */}
                  <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] sm:w-[200%] sm:h-[200%] z-0 pointer-events-none" viewBox="0 0 400 400" fill="none">
                    {/* Top Left to Center (Cyan) */}
                    <path d="M 60 110 Q 130 140, 180 170" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="6,6" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                    <circle cx="60" cy="110" r="5" fill="#00f0ff" className="drop-shadow-[0_0_10px_#00f0ff]" />
                    <circle cx="180" cy="170" r="5" fill="#00f0ff" className="drop-shadow-[0_0_10px_#00f0ff]" />
                    
                    {/* Bottom Left to Center (Cyan) */}
                    <path d="M 60 290 Q 130 260, 180 230" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="6,6" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                    <circle cx="60" cy="290" r="5" fill="#00f0ff" className="drop-shadow-[0_0_10px_#00f0ff]" />
                    <circle cx="180" cy="230" r="5" fill="#00f0ff" className="drop-shadow-[0_0_10px_#00f0ff]" />

                    {/* Top Right to Center (Magenta) */}
                    <path d="M 340 110 Q 270 140, 220 170" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="6,6" className="drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
                    <circle cx="340" cy="110" r="5" fill="#ff00ff" className="drop-shadow-[0_0_10px_#ff00ff]" />
                    <circle cx="220" cy="170" r="5" fill="#ff00ff" className="drop-shadow-[0_0_10px_#ff00ff]" />

                    {/* Bottom Right to Center (Magenta) */}
                    <path d="M 340 290 Q 270 260, 220 230" stroke="#ff00ff" strokeWidth="2.5" strokeDasharray="6,6" className="drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
                    <circle cx="340" cy="290" r="5" fill="#ff00ff" className="drop-shadow-[0_0_10px_#ff00ff]" />
                    <circle cx="220" cy="230" r="5" fill="#ff00ff" className="drop-shadow-[0_0_10px_#ff00ff]" />
                  </svg>

                  {/* Top Left Card (Exchange Links) */}
                  <div className="absolute -top-[5%] -left-[45%] sm:-left-[45%] md:-left-[40%] lg:-left-[45%] z-20 w-[130px] sm:w-[160px] lg:w-[190px] xl:w-[210px] bg-gradient-to-br from-[#051024] to-[#002844] backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.5)] flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-[#00f0ff] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.6)] bg-[#051024]">
                      <Link className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#00f0ff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-[9px] sm:text-[11px] lg:text-sm">Exchange Links</h3>
                      <p className="text-white/80 text-[7px] sm:text-[9px] lg:text-xs leading-tight mt-0.5">Share anything<br/>Grow everything.</p>
                    </div>
                  </div>

                  {/* Top Right Card (Payment Proofs) */}
                  <div className="absolute -top-[5%] -right-[45%] sm:-right-[45%] md:-right-[40%] lg:-right-[45%] z-20 w-[130px] sm:w-[160px] lg:w-[190px] xl:w-[210px] bg-gradient-to-br from-[#1a0524] to-[#3a0044] backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.5)] flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-[#ff00ff] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,0,255,0.6)] bg-[#1a0524]">
                      <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#ff00ff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-[9px] sm:text-[11px] lg:text-sm">Payment Proofs</h3>
                      <p className="text-white/80 text-[7px] sm:text-[9px] lg:text-xs leading-tight mt-0.5">Transparent proofs<br/>build real trust.</p>
                    </div>
                  </div>

                  {/* Bottom Left Card (Trusted Bots) */}
                  <div className="absolute -bottom-[5%] -left-[45%] sm:-left-[45%] md:-left-[40%] lg:-left-[45%] z-20 w-[130px] sm:w-[160px] lg:w-[190px] xl:w-[210px] bg-gradient-to-br from-[#051024] to-[#002844] backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.5)] flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-[#00f0ff] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.6)] bg-[#051024]">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#00f0ff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-[9px] sm:text-[11px] lg:text-sm">Trusted Bots</h3>
                      <p className="text-white/80 text-[7px] sm:text-[9px] lg:text-xs leading-tight mt-0.5">Secure automation<br/>you can rely on.</p>
                    </div>
                  </div>

                  {/* Bottom Right Card (Community Support) */}
                  <div className="absolute -bottom-[5%] -right-[45%] sm:-right-[45%] md:-right-[40%] lg:-right-[45%] z-20 w-[130px] sm:w-[160px] lg:w-[190px] xl:w-[210px] bg-gradient-to-br from-[#1a0524] to-[#3a0044] backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.5)] flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-[#ff00ff] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(255,0,255,0.6)] bg-[#1a0524]">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#ff00ff]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-[9px] sm:text-[11px] lg:text-sm">Community Support</h3>
                      <p className="text-white/80 text-[7px] sm:text-[9px] lg:text-xs leading-tight mt-0.5">Real people.<br/>Real support.<br/>24/7.</p>
                    </div>
                  </div>

                  {/* Logo (floating above) */}
                  <img 
                    src="/hero-image.png" 
                    alt="Hero logo" 
                    className="w-[99%] h-[99%] object-contain absolute top-[-11.5%] left-1/2 -translate-x-1/2 z-10" 
                    referrerPolicy="no-referrer" 
                  />
                  {/* Energy Ring (platform below) */}
                  <img 
                    src="/energy-ring.png" 
                    alt="Energy ring platform" 
                    className="w-[160%] h-[160%] object-contain absolute bottom-[-30%] left-1/2 -translate-x-1/2 z-0" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              </div>

            </main>
            
            {/* Feature Section wrapper */}
            <div className="w-full mt-8 md:mt-12 pb-8 md:pb-12">
              <div className="w-full border-t border-white/10 mb-6 md:mb-8"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between divide-y md:divide-y-0 md:divide-x divide-white/10 bg-transparent">
                {[
            {
              icon: Shield,
              title: "Secure & Trusted",
              desc: "Your safety is our top priority"
            },
            {
              icon: Zap,
              title: "Smart & Efficient",
              desc: "Technology that works for you"
            },
            {
              icon: Globe,
              title: "Global Network",
              desc: "Opportunities without borders"
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "Together we grow, together we win"
            }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="group flex flex-1 items-center gap-4 py-5 md:py-2 px-2 sm:px-4 lg:px-6 w-full justify-start transition-all duration-500"
            >
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-white/[0.04] group-hover:text-blue-300 transition-all duration-500">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <div className="flex flex-col text-left">
                <h3 className="text-white font-semibold text-[15px] tracking-wide mb-0.5">{feature.title}</h3>
                <p className="text-[13px] text-[#B8C0D0] leading-snug">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

          </div>
        </div>
      </div>

      {/* Popular Bots Section */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full bg-[#050816] pt-8 lg:pt-12 pb-16 lg:pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-widest text-white flex items-center gap-2 uppercase">
            Popular Bots <span className="text-blue-400">✦</span>
          </h2>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
            View All Bots <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full">
          {/* Previous Arrow */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-8 lg:-ml-12 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 hidden md:flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          {/* Grid Layout (2-column x 2-row with clear center corridor) */}
          <div className="w-full flex justify-center relative px-0 md:px-8 lg:px-10">
            <div className="w-full max-w-[880px] grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] lg:grid-cols-[1fr_100px_1fr] gap-y-6 md:gap-y-10">
              
              {/* Row 1 */}
              <div className="md:col-start-1 md:row-start-1 h-full">
                <BotCard 
                  name="Blum" 
                  letter="B"
                  status="Active" 
                  statusColor="green"
                  desc="Community growth opportunity" 
                />
              </div>
              <div className="md:col-start-3 md:row-start-1 h-full">
                <BotCard 
                  name="Notcoin" 
                  letter="N"
                  status="Active"
                  statusColor="green"
                  desc="Engagement opportunity" 
                />
              </div>
              
              {/* Row 2 */}
              <div className="md:col-start-1 md:row-start-2 h-full">
                <BotCard 
                  name="Hamster Kombat" 
                  letter="H"
                  desc="Community collaboration" 
                />
              </div>
              <div className="md:col-start-3 md:row-start-2 h-full">
                <BotCard 
                  name="TapSwap" 
                  letter="T"
                  status="Under Review" 
                  statusColor="yellow"
                  desc="Promotional opportunity" 
                />
              </div>

              {/* Center Corridor (Empty path for future animation) */}
              <div className="hidden md:block md:col-start-2 md:row-start-1 md:row-span-2 relative"></div>

            </div>
          </div>

          {/* Next Arrow */}
          <button className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-8 lg:-mr-12 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 hidden md:flex items-center justify-center text-white hover:bg-white/10 transition-colors">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-3 mt-12 w-full">
          <div className="w-8 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
        </div>
      </div>

      {/* How ExchangeHube Works Section */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full bg-[#050816] py-16 lg:py-24">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-16 md:mb-24">
          <div className="flex items-center gap-4 w-full max-w-[700px] mx-auto">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-500/50"></div>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400 shrink-0" />
            <h2 className="text-base sm:text-lg md:text-2xl font-display font-bold tracking-widest text-white uppercase text-center shrink-0 px-2 md:px-4">
              How ExchangeHube Works
            </h2>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400 shrink-0" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-500/50"></div>
          </div>
        </div>

        {/* Triangle Layout */}
        <div className="relative w-full max-w-[800px] mx-auto aspect-[8/7] min-h-[500px]">
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 800 700" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Top Left Line */}
            <line x1="360" y1="300" x2="260" y2="400" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,6" className="opacity-70" />
            <circle cx="360" cy="300" r="5" fill="#a855f7" className="drop-shadow-[0_0_10px_rgba(168,85,247,1)]" />

            {/* Top Right Line */}
            <line x1="440" y1="300" x2="540" y2="400" stroke="#a855f7" strokeWidth="2" strokeDasharray="6,6" className="opacity-70" />
            <circle cx="440" cy="300" r="5" fill="#a855f7" className="drop-shadow-[0_0_10px_rgba(168,85,247,1)]" />

            {/* Bottom Horizontal Line */}
            <defs>
              <linearGradient id="bottomLineGrad" x1="280" y1="525" x2="520" y2="525" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <line x1="280" y1="525" x2="520" y2="525" stroke="url(#bottomLineGrad)" strokeWidth="2" strokeDasharray="6,6" className="opacity-70" />
            <circle cx="280" cy="525" r="5" fill="#3b82f6" className="drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
            <circle cx="520" cy="525" r="5" fill="#d946ef" className="drop-shadow-[0_0_10px_rgba(217,70,239,1)]" />
          </svg>

          {/* Step 01 */}
          <div className="absolute left-1/2 top-[5%] -translate-x-1/2 flex flex-col items-center w-[180px] sm:w-[240px] z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 sm:mb-6 group">
              <div className="absolute inset-0 rounded-full bg-[#a855f7]/20 blur-xl transition-all duration-500 group-hover:bg-[#a855f7]/30 group-hover:blur-2xl"></div>
              <div className="absolute inset-0 rounded-full border border-[#a855f7]/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"></div>
              <div className="absolute inset-2 sm:inset-3 rounded-full bg-[#0a0f25] border border-white/5 shadow-inner flex items-center justify-center">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#a855f7]" />
              </div>
            </div>
            <span className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-wide mb-1 sm:mb-2 text-[#a855f7]">01</span>
            <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-center whitespace-nowrap">Find Partner</h3>
            <p className="text-[#B8C0D0] text-[11px] sm:text-xs md:text-sm text-center leading-relaxed">Browse referral links or post your own.</p>
          </div>

          {/* Step 02 */}
          <div className="absolute left-[22%] top-[55%] -translate-x-1/2 flex flex-col items-center w-[180px] sm:w-[240px] z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 sm:mb-6 group">
              <div className="absolute inset-0 rounded-full bg-[#3b82f6]/20 blur-xl transition-all duration-500 group-hover:bg-[#3b82f6]/30 group-hover:blur-2xl"></div>
              <div className="absolute inset-0 rounded-full border border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"></div>
              <div className="absolute inset-2 sm:inset-3 rounded-full bg-[#0a0f25] border border-white/5 shadow-inner flex items-center justify-center">
                <Link className="w-6 h-6 sm:w-8 sm:h-8 text-[#3b82f6]" />
              </div>
            </div>
            <span className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-wide mb-1 sm:mb-2 text-[#3b82f6]">02</span>
            <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-center whitespace-nowrap">Exchange Links</h3>
            <p className="text-[#B8C0D0] text-[11px] sm:text-xs md:text-sm text-center leading-relaxed">Exchange referral links with your partner.</p>
          </div>

          {/* Step 03 */}
          <div className="absolute left-[78%] top-[55%] -translate-x-1/2 flex flex-col items-center w-[180px] sm:w-[240px] z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 sm:mb-6 group">
              <div className="absolute inset-0 rounded-full bg-[#d946ef]/20 blur-xl transition-all duration-500 group-hover:bg-[#d946ef]/30 group-hover:blur-2xl"></div>
              <div className="absolute inset-0 rounded-full border border-[#d946ef]/50 shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(217,70,239,0.6)]"></div>
              <div className="absolute inset-2 sm:inset-3 rounded-full bg-[#0a0f25] border border-white/5 shadow-inner flex items-center justify-center">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-[#d946ef]" strokeWidth={3} />
              </div>
            </div>
            <span className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-wide mb-1 sm:mb-2 text-[#d946ef]">03</span>
            <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-center whitespace-nowrap">Confirm Exchange</h3>
            <p className="text-[#B8C0D0] text-[11px] sm:text-xs md:text-sm text-center leading-relaxed">Confirm and start exchanging opportunities.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full bg-[#050816] py-16 lg:py-24">
        <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0a0f25] to-[#070b1a] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] px-6 py-16 md:py-24 flex flex-col items-center text-center">
          
          {/* Subtle glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          {/* Rocket Icon Graphic */}
          <div className="relative mb-8 md:mb-10 w-24 h-24 flex items-center justify-center">
             <div className="absolute inset-0 bg-blue-500 rounded-3xl rotate-[-15deg] opacity-20 blur-md"></div>
             <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl rotate-[-8deg] shadow-lg"></div>
             <div className="absolute inset-0 bg-[#0a0f25] rounded-3xl m-[2px] flex items-center justify-center border border-white/10">
               <Rocket className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
             </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
            Ready to Connect <br className="hidden md:block" />
            and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Grow?</span>
          </h2>
          
          <p className="text-[#B8C0D0] text-base md:text-lg max-w-[600px] mb-10 md:mb-12">
            Join ExchangeHube today and explore endless opportunities to connect, exchange and grow together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-medium shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
              Explore Opportunities <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-white/20 hover:bg-white/5 text-white font-medium transition-all duration-300">
              Create Free Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-[#050816] border-t border-white/5 pt-16 pb-8 px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-[1280px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-[1px]">
                  <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold text-lg tracking-wider">EH</span>
                  </div>
                </div>
                <div>
                  <span className="text-[20px] md:text-[28px] font-display font-bold tracking-tight text-white leading-tight block">
                    Exchange<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d946ef]">Hube</span>
                  </span>
                  <span className="text-[12px] md:text-[14px] text-[#B8C0D0] tracking-wide mt-0.5 block">Exchange. Connect. Grow.</span>
                </div>
              </div>
              <p className="text-[#B8C0D0] text-sm leading-relaxed mt-6 mb-8 max-w-[320px]">
                ExchangeHube is a platform to discover, connect and exchange referrals, affiliate opportunities, promotions, deals, partnerships and more.
              </p>
              
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#B8C0D0] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Explore Column */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">All Opportunities</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Popular Bots</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Latest Listings</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Categories Column */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6">Categories</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Referrals</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Affiliate Programs</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Business Promotions</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Deals & Coupons</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Partnerships</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Services</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Freelance</a></li>
                <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company & Legal Column Wrapper for Mobile */}
            <div className="grid grid-cols-2 gap-8 lg:col-span-4">
              {/* Company Column */}
              <div>
                <h4 className="text-white font-semibold mb-6">Company</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">About Us</a></li>
                  <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Our Mission</a></li>
                  <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">How It Works</a></li>
                  <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Contact Us</a></li>
                </ul>
              </div>

              {/* Support & Legal Column */}
              <div className="flex flex-col gap-10">
                <div>
                  <h4 className="text-white font-semibold mb-6">Support</h4>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Guidelines</a></li>
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">FAQ</a></li>
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Contact Support</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-6">Legal</h4>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Terms of Use</a></li>
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-[#B8C0D0] hover:text-white text-sm transition-colors">Disclaimer</a></li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/5 pt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin-login')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#B8C0D0] hover:text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
                aria-label="Admin Login"
              >
                <Hexagon className="w-5 h-5" />
              </button>
              <p className="text-[#B8C0D0] text-sm">© 2026 ExchangeHube. All rights reserved.</p>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-[#11172f] hover:bg-purple-500/20 text-[#B8C0D0] hover:text-purple-400 transition-all flex items-center justify-center border border-white/5 hover:border-purple-500/50"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          
        </div>
      </footer>
    </div>
  );
}

function BotCard({ name, letter, status, statusColor, desc }: { name: string, letter: string, status?: string, statusColor?: string, desc: string }) {
  return (
    <div className="flex flex-col aspect-[4/5] md:aspect-[3/4] lg:aspect-[3/4] bg-[#0a0f25]/80 backdrop-blur-md rounded-[20px] p-6 lg:p-8 border border-blue-500/20 hover:border-purple-500/40 transition-colors duration-300">
      
      {/* Letter Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#11172f] border border-white/5 flex items-center justify-center shadow-inner mb-6 lg:mb-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] shrink-0">
        <span className="text-3xl font-bold text-white font-display">{letter}</span>
      </div>

      <div className="flex items-center gap-3 mb-3 lg:mb-4 shrink-0">
        <h3 className="text-xl font-semibold text-white tracking-wide">{name}</h3>
        {status && (
          <span className={`px-2.5 py-0.5 rounded flex items-center justify-center text-[10px] font-bold tracking-wide ${
            statusColor === 'green' ? 'bg-green-500/20 text-green-400' : 
            statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 
            'bg-blue-500/20 text-blue-400'
          }`}>
            {status}
          </span>
        )}
      </div>
      <p className="text-[#B8C0D0] text-sm leading-relaxed mb-6 lg:mb-8 flex-grow">{desc}</p>
      <button className="w-full py-3 lg:py-4 rounded-xl mt-auto shrink-0 bg-transparent border border-white/10 hover:bg-white/5 transition-all duration-300 text-white font-medium text-sm flex items-center justify-center gap-2">
        View Details <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpEmailError, setSignUpEmailError] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'Admin', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role === 'admin' && data.isActive === true) {
              navigate('/admin/dashboard');
              return;
            }
          }
        } catch (err) {
          console.warn("Admin check error:", err);
        }
        
        const lastPage = localStorage.getItem('last_chat_path') || '/messages';
        navigate(lastPage);
      } else {
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!signUpUsername) {
        setUsernameStatus('idle');
        return;
      }
      
      const normalized = signUpUsername.toLowerCase().trim();
      if (!/^[a-z0-9_@#$]+$/.test(normalized)) {
        setUsernameStatus('idle');
        return;
      }
      
      setUsernameStatus('checking');
      try {
        const q = query(collection(db, 'users'), where('username', '==', signUpUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err: any) {
        console.warn("Firestore Error:", err);
        setUsernameStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [signUpUsername]);

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#050816]"></div>;
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!signInEmail || !signInPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      const lastPage = localStorage.getItem('last_chat_path') || '/messages';
        navigate(lastPage);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpEmailError('');
    
    if (!signUpName || !signUpUsername || !signUpEmail || !signUpPassword) {
      setSignUpError('Please fill in all fields.');
      return;
    }

    const normalizedUsername = signUpUsername.toLowerCase().trim();
    if (!/^[a-z0-9_@#$]+$/.test(normalizedUsername)) {
      setSignUpError('Use only letters, numbers, _, @, #, and $.');
      return;
    }

    setIsSignUpLoading(true);
    try {
      // Create the Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;
      
      try {
        // Double check after auth
        const q = query(collection(db, 'users'), where('username', '==', signUpUsername));
        const snapshot = await getCountFromServer(q);
        if (snapshot.data().count > 0) {
          throw new Error("USERNAME_TAKEN");
        }
        
        const userRef = doc(db, 'users', user.uid);
        
        await setDoc(userRef, {
          uid: user.uid,
          fullName: signUpName,
          username: signUpUsername,
          normalizedUsername: normalizedUsername,
          email: signUpEmail,
          role: "user",
          createdAt: serverTimestamp()
        });
        
        const lastPage = localStorage.getItem('last_chat_path') || '/messages';
        navigate(lastPage);
      } catch (transactionErr: any) {
        // Rollback Auth user if transaction fails
        await user.delete().catch(console.error);
        console.error("Firestore Error:", {
          isAuthenticated: !!auth.currentUser
        });
        if (transactionErr.message === "USERNAME_TAKEN") {
          setSignUpError('Username ID already taken.');
        } else {
          setSignUpError(`Error: ${transactionErr.code || 'UNKNOWN'} - ${transactionErr.message}`);
        }
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setSignUpEmailError('An account already exists with this email. Please sign in.');
      } else {
        setSignUpError(`Error: ${err.code} - ${err.message}`);
      }
    } finally {
      setIsSignUpLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    
    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent. Please check your inbox. If you don\'t see it, check your Spam or Junk folder.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/invalid-email') {
        setResetError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setResetError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setResetError('Network error. Check your connection and try again.');
      } else {
        setResetError('Unable to send reset email. Please try again.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const SocialButtons = () => (
    <div className="flex gap-4 justify-center mb-6">
      <button type="button" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white/40 transition-all text-white">
        <Facebook className="w-4 h-4" />
      </button>
      <button type="button" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white/40 transition-all text-white">
        <span className="font-bold text-sm">G</span>
      </button>
      <button type="button" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white/40 transition-all text-white">
        <Linkedin className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[800px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Back Button */}
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-[#B8C0D0] hover:text-white transition-colors z-30 hidden md:block" aria-label="Close">
        <X className="w-6 h-6" />
      </button>

      {/* --- DESKTOP LAYOUT --- */}
      <div className="hidden md:flex relative w-full max-w-[900px] h-[600px] rounded-3xl p-[1px] bg-gradient-to-r from-blue-500/40 to-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.15)] z-10">
        <div className="relative w-full h-full bg-[#070b1a] rounded-[23px] overflow-hidden shadow-inner">
          
          {/* Sign In Form (Left half) */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-10 bg-[#070b1a] transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0 opacity-100 z-10 pointer-events-auto' : 'translate-x-20 opacity-0 z-0 pointer-events-none'}`}>
            <form className="w-full max-w-[320px] flex flex-col" onSubmit={handleSignIn}>
              <h2 className="text-3xl font-display font-bold text-white mb-6 text-center">Sign in</h2>
              <div className="text-center text-xs text-[#B8C0D0] mb-6">or use your account</div>
              <SocialButtons />
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                  <input type="email" placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} disabled={isLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} disabled={isLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8C0D0] hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowResetModal(true); setResetMessage(''); setResetError(''); setResetEmail(''); }} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot your password?</a>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? "Signing in..." : "SIGN IN"}
              </button>
            </form>
          </div>

          {/* Sign Up Form (Right half) */}
          <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-10 bg-[#070b1a] transition-all duration-700 ease-in-out ${!isLogin ? 'translate-x-0 opacity-100 z-10 pointer-events-auto' : '-translate-x-20 opacity-0 z-0 pointer-events-none'}`}>
            <form className="w-full max-w-[320px] flex flex-col" onSubmit={handleSignUp}>
              <h2 className="text-3xl font-display font-bold text-white mb-6 text-center">Create Account</h2>
              <SocialButtons />
              
              {signUpError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center w-full">
                  {signUpError}
                </div>
              )}
              
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative bg-[#070b1a] px-4 text-xs text-[#B8C0D0]">
                  or use your email for registration
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                  <input type="text" placeholder="Full Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                </div>
                <div>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type="text" placeholder="Username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value.replace(/[^a-zA-Z0-9_@#$]/g, ''))} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                  {signUpUsername.length > 0 && (
                    <div className="mt-1 text-sm text-[#B8C0D0]">You can use: @ # $ _</div>
                  )}
                  {usernameStatus === 'taken' && (
                    <div className="mt-1 text-sm text-red-400">✕ Username ID already taken</div>
                  )}
                  {usernameStatus === 'available' && (
                    <div className="mt-1 text-sm text-green-400">✓ Username ID available</div>
                  )}
                  {usernameStatus === 'checking' && (
                    <div className="mt-1 text-sm text-blue-400">Checking availability...</div>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                  {signUpEmailError && (
                    <div className="mt-1 text-sm text-red-400">{signUpEmailError}</div>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8C0D0] hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button type="submit" disabled={isSignUpLoading} className="w-full mt-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 group transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isSignUpLoading ? "Signing up..." : "SIGN UP"} {!isSignUpLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <div className="mt-6 text-center">
                <span className="text-[#B8C0D0] text-sm">Already have an account? </span>
                <button type="button" onClick={() => { setIsLogin(true); setSignUpError(''); setError(''); }} className="text-blue-400 font-medium hover:text-blue-300">Sign in</button>
              </div>
            </form>
          </div>

          {/* Sliding Overlay Panel */}
          <div className={`absolute top-0 left-0 w-1/2 h-full z-20 transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-full' : 'translate-x-0'}`}>
            <div className="relative w-full h-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              
              {/* Welcome Back (Shown when !isLogin) */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center h-full text-center px-10 overflow-hidden bg-[#070b1a] transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-100 pointer-events-auto translate-x-0' : 'opacity-0 pointer-events-none -translate-x-12'}`}>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-blue-600/20 to-transparent opacity-50 blur-xl"></div>
                <div className="flex flex-col items-center mb-10 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-[1px]">
                      <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold text-lg tracking-wider">EH</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xl md:text-2xl font-display font-bold tracking-tight text-white leading-tight block">
                        Exchange<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d946ef]">Hube</span>
                      </span>
                      <span className="text-[10px] md:text-[11px] text-[#B8C0D0] tracking-wide mt-0.5 block">Exchange. Connect. Grow.</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Welcome Back!</h2>
                <p className="text-[#B8C0D0] text-sm leading-relaxed mb-8 max-w-[240px] relative z-10">
                  To keep connected with us please login with your personal info
                </p>
                <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="px-10 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-medium transition-all flex items-center gap-2 group relative z-10">
                  SIGN IN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Hello Friend (Shown when isLogin) */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center h-full text-center px-10 overflow-hidden bg-gradient-to-br from-[#1a0b2e] to-[#070b1a] transition-all duration-700 ease-in-out ${isLogin ? 'opacity-100 pointer-events-auto translate-x-0' : 'opacity-0 pointer-events-none translate-x-12'}`}>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/30 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative mb-8 z-10 group">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full transition-all group-hover:bg-purple-500/30"></div>
                  <div className="w-20 h-20 rounded-2xl border border-purple-500/30 bg-[#0a0f25]/50 backdrop-blur-md flex items-center justify-center relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <UserPlus className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-purple-300 animate-pulse" />
                    <Sparkles className="absolute top-1/2 -left-4 w-4 h-4 text-blue-300 animate-pulse delay-150" />
                  </div>
                </div>
                <h2 className="text-4xl font-display font-bold mb-4 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Hello, Friend!</h2>
                <p className="text-[#B8C0D0] text-sm leading-relaxed mb-8 max-w-[240px] relative z-10">
                  Enter your personal details and start journey with us
                </p>
                <button type="button" onClick={() => { setIsLogin(false); setError(''); }} className="px-12 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-medium transition-all relative z-10">
                  SIGN UP
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE LAYOUT --- */}
      <div className="flex md:hidden relative w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-b from-blue-500/40 to-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] z-10 flex-col">
        <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-[#B8C0D0] hover:text-white transition-colors z-30" aria-label="Close">
          <X className="w-6 h-6" />
        </button>
        <div className="relative w-full h-full bg-[#070b1a] rounded-[23px] overflow-hidden flex flex-col p-6 pt-12 transition-all duration-500">
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-[#050816] rounded-lg flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold text-sm tracking-wider">EH</span>
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg font-display font-bold tracking-tight text-white leading-tight block">
                Exchange<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d946ef]">Hube</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 grid-rows-1 relative flex-1 w-full">
            {/* Create Account Form (Mobile) */}
            <div className={`col-start-1 row-start-1 w-full flex flex-col items-center transition-all duration-700 ease-in-out ${!isLogin ? 'translate-x-0 opacity-100 pointer-events-auto z-10' : '-translate-x-8 opacity-0 pointer-events-none z-0'}`}>
              <form className="w-full flex flex-col" onSubmit={handleSignUp}>
                <h2 className="text-2xl font-display font-bold text-white mb-6 text-center">Create Account</h2>
                <SocialButtons />
                
                {signUpError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center w-full">
                    {signUpError}
                  </div>
                )}
                
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative bg-[#070b1a] px-4 text-xs text-[#B8C0D0]">
                    or use your email
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type="text" placeholder="Full Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                  </div>
                  <div>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                      <input type="text" placeholder="Username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value.replace(/[^a-zA-Z0-9_@#$]/g, ''))} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                    </div>
                    {signUpUsername.length > 0 && (
                      <div className="mt-1 text-sm text-[#B8C0D0]">You can use: @ # $ _</div>
                    )}
                    {usernameStatus === 'taken' && (
                      <div className="mt-1 text-sm text-red-400">✕ Username ID already taken</div>
                    )}
                    {usernameStatus === 'available' && (
                      <div className="mt-1 text-sm text-green-400">✓ Username ID available</div>
                    )}
                    {usernameStatus === 'checking' && (
                      <div className="mt-1 text-sm text-blue-400">Checking availability...</div>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                      <input type="email" placeholder="Email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                    </div>
                    {signUpEmailError && (
                      <div className="mt-1 text-sm text-red-400">{signUpEmailError}</div>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} disabled={isSignUpLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8C0D0] hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <button type="submit" disabled={isSignUpLoading} className="w-full mt-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 group transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSignUpLoading ? "Signing up..." : "SIGN UP"} {!isSignUpLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
                
                <div className="mt-6 text-center pb-4">
                  <span className="text-[#B8C0D0] text-sm">Already have an account? </span>
                  <button type="button" onClick={() => { setIsLogin(true); setSignUpError(''); setError(''); }} className="text-blue-400 font-medium hover:text-blue-300">Sign in</button>
                </div>
              </form>
            </div>

            {/* Sign In Form (Mobile) */}
            <div className={`col-start-1 row-start-1 w-full flex flex-col items-center transition-all duration-700 ease-in-out ${isLogin ? 'translate-x-0 opacity-100 pointer-events-auto z-10' : 'translate-x-8 opacity-0 pointer-events-none z-0'}`}>
              <form className="w-full flex flex-col" onSubmit={handleSignIn}>
                <h2 className="text-2xl font-display font-bold text-white mb-4 text-center">Sign in</h2>
                <div className="text-center text-xs text-[#B8C0D0] mb-6">or use your account</div>
                <SocialButtons />
                
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4 mb-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type="email" placeholder="Email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} disabled={isLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} disabled={isLoading} className="w-full bg-transparent border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8C0D0] hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowResetModal(true); setResetMessage(''); setResetError(''); setResetEmail(''); }} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot your password?</a>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isLoading ? "Signing in..." : "SIGN IN"}
                </button>
                
                <div className="mt-6 text-center pb-4">
                  <span className="text-[#B8C0D0] text-sm">Don't have an account? </span>
                  <button type="button" onClick={() => { setIsLogin(false); setError(''); }} className="text-purple-400 font-medium hover:text-purple-300">Sign up</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#070b1a] rounded-3xl p-8 border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-[80px] pointer-events-none"></div>
            
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute top-6 right-6 text-[#B8C0D0] hover:text-white transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <h3 className="text-2xl font-display font-bold text-white mb-2 text-center">Reset Password</h3>
              <p className="text-[#B8C0D0] text-sm text-center mb-8">
                Enter your email address and we'll send you a password reset link.
              </p>

              {resetMessage ? (
                <div className="text-center">
                  <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    {resetMessage}
                  </div>
                  <button 
                    onClick={() => setShowResetModal(false)}
                    className="w-full py-3.5 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                  >
                    RETURN TO SIGN IN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="flex flex-col">
                  {resetError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                      {resetError}
                    </div>
                  )}

                  <div className="relative mb-8">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      disabled={isResetting} 
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isResetting} 
                    className="w-full mb-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isResetting ? "Sending..." : "SEND RESET LINK"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setShowResetModal(false)}
                    disabled={isResetting}
                    className="w-full py-3.5 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium transition-all"
                  >
                    CANCEL
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err === 'not-admin') return 'You are not an administrator.';
    if (err === 'denied') return 'Admin access denied.';
    if (err === 'permission-denied') return 'Permission denied: Please update your Firestore Security Rules.';
    if (err === 'error') return 'Error verifying Admin status.';
    return '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'Admin', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await auth.signOut();
        setError('You are not an administrator.');
        setIsLoading(false);
        return;
      }
      
      const data = docSnap.data();
      if (data.role === 'admin' && data.isActive === true) {
        navigate('/admin/dashboard');
      } else {
        if (auth.currentUser) await presenceService.updatePresence(auth.currentUser.uid, false); await auth.signOut();
        setError('Admin access denied.');
      }
    } catch (err: any) {
      console.error('Admin Sign in error:', err);
      if (err.code === 'permission-denied') {
        setError('Permission denied: Please update your Firestore Security Rules to allow access to the "Admin" collection.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <button onClick={() => window.close()} className="absolute top-8 left-8 text-[#B8C0D0] hover:text-white transition-colors z-30 flex items-center gap-2 group">
        <X className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Close Page</span>
      </button>

      <div className="relative w-full max-w-md bg-[#070b1a] rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(168,85,247,0.15)] border border-white/5 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-[1px] mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-display font-bold text-lg tracking-wider">EH</span>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Admin Access</h1>
          <p className="text-[#B8C0D0] text-sm mt-2 text-center">Secure portal for authorized personnel</p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col w-full">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
              <input 
                type="email" 
                placeholder="Admin Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading} 
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all" 
                required 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8C0D0]" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Admin Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading} 
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all" 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8C0D0] hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { ChartsPage, BotsPage, TrendingBotsPage, PublishBotPage, ReferralsPage, ChannelsPage, ProfilePage } from './DashboardPages';
import { PersonalChatsPage } from "./PersonalChatsPage";
import { PersonalChatWindow } from "./PersonalChatWindow";
import { ChannelChatPage } from "./ChannelChatPage";

import { AdminDashboardPage, AdminChartsPage, AdminReferralsPage, AdminNotificationsPage, AdminSettingsPage, AdminBotRequestsPage, AdminUserRequestsPage } from './AdminPages';
import { AdminBotsPage } from './AdminBotsPage';
import { AdminChannelsPage } from './AdminChannelsPage';
import { AdminManagementPage } from './AdminManagementPage';
import { AdminReportsPage } from './AdminReportsPage';
import { AdminManagementHubPage } from './AdminManagementHubPage';
import { AdminUsersPage } from './AdminUsersPage';

function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const docRef = doc(db, 'Admin', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'admin' && docSnap.data().isActive === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  if (isAdmin === null) return <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
      <Route path="/admin/reports" element={<AdminProtectedRoute><AdminReportsPage /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
      <Route path="/admin/bots" element={<AdminProtectedRoute><AdminBotsPage /></AdminProtectedRoute>} />
      <Route path="/admin/charts" element={<AdminProtectedRoute><AdminChartsPage /></AdminProtectedRoute>} />
      <Route path="/admin/referrals" element={<AdminProtectedRoute><AdminReferralsPage /></AdminProtectedRoute>} />
      <Route path="/admin/channels" element={<AdminProtectedRoute><AdminChannelsPage /></AdminProtectedRoute>} />
      <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotificationsPage /></AdminProtectedRoute>} />
      <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettingsPage /></AdminProtectedRoute>} />
      <Route path="/admin/management" element={<AdminProtectedRoute><AdminManagementPage /></AdminProtectedRoute>} />
      <Route path="/admin/manage" element={<AdminProtectedRoute><AdminManagementHubPage /></AdminProtectedRoute>} />
      
      <Route path="/admin/request/bot" element={<Navigate to="/admin/requests/bot" replace />} />
      <Route path="/admin/request/user" element={<Navigate to="/admin/requests/user" replace />} />
      <Route path="/admin/requests/bot" element={<AdminProtectedRoute><AdminBotRequestsPage /></AdminProtectedRoute>} />
      <Route path="/admin/requests/user" element={<AdminProtectedRoute><AdminUserRequestsPage /></AdminProtectedRoute>} />
      <Route path="/charts" element={<ChartsPage />} />
      <Route path="/bots" element={<BotsPage />} />
      <Route path="/bots/trending" element={<TrendingBotsPage />} />
      <Route path="/bots/publish" element={<PublishBotPage />} />
      <Route path="/referrals" element={<ReferralsPage />} />
      <Route path="/messages" element={<PersonalChatsPage />} />
      <Route path="/messages/:targetUserId" element={<PersonalChatWindow />} />
      <Route path="/channels" element={<ChannelsPage />} />
      <Route path="/channels/:channelId/chat" element={<ChannelChatPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Home />} />
    </Routes>
    </>
  );
}
