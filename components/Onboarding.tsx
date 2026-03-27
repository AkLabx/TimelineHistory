import React, { useState, useEffect } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Slide {
  id: string;
  title_en: string;
  desc_en: string;
  title_hi: string;
  desc_hi: string;
  icon: React.ReactNode;
}

// Framer Motion SVG Animation Variants
const iconVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    }
  }
};

const slides: Slide[] = [
  {
    id: 'timeline',
    title_en: 'Explore Time',
    desc_en: 'Journey through centuries of history with our visual timeline. Discover dynasties, eras, and historical figures effortlessly.',
    title_hi: 'इतिहास की यात्रा',
    desc_hi: 'हमारी दृश्य टाइमलाइन के साथ सदियों के इतिहास की यात्रा करें। राजवंशों, युगों और ऐतिहासिक हस्तियों की खोज करें।',
    icon: (
      <motion.svg className="w-40 h-40 sm:w-56 sm:h-56 mx-auto text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <motion.path variants={iconVariants} initial="hidden" animate="visible" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <motion.path variants={iconVariants} initial="hidden" animate="visible" strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3m-9-9v3m0 12v3" />
      </motion.svg>
    ),
  },
  {
    id: 'ai',
    title_en: 'AI Historian',
    desc_en: 'Chat directly with historical figures through our Samvad AI, or ask general historical questions to our global Itihaskar assistant.',
    title_hi: 'अपने AI इतिहासकार',
    desc_hi: 'हमारे संवाद AI के माध्यम से ऐतिहासिक हस्तियों से सीधे चैट करें, या हमारे वैश्विक इतिहासकार सहायक से सामान्य ऐतिहासिक प्रश्न पूछें।',
    icon: (
      <motion.svg className="w-40 h-40 sm:w-56 sm:h-56 mx-auto text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <motion.path variants={iconVariants} initial="hidden" animate="visible" strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        <motion.circle variants={iconVariants} initial="hidden" animate="visible" cx="12" cy="12" r="9" />
      </motion.svg>
    ),
  },
  {
    id: 'compare',
    title_en: 'Compare Eras',
    desc_en: 'Select two kings or dynasties to compare their reign, empire size, and historical impact side-by-side.',
    title_hi: 'युगों की तुलना',
    desc_hi: 'उनके शासनकाल, साम्राज्य के आकार और ऐतिहासिक प्रभाव की अगल-बगल तुलना करने के लिए दो राजाओं या राजवंशों का चयन करें।',
    icon: (
      <motion.svg className="w-40 h-40 sm:w-56 sm:h-56 mx-auto text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <motion.path variants={iconVariants} initial="hidden" animate="visible" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </motion.svg>
    ),
  },
  {
    id: 'offline',
    title_en: 'Ready to Begin?',
    desc_en: 'Access history offline, search globally, and dive deep into India\'s rich past. Let the journey begin!',
    title_hi: 'तैयार हैं?',
    desc_hi: 'ऑफ़लाइन इतिहास तक पहुँचें, विश्व स्तर पर खोजें, और भारत के समृद्ध अतीत में गहराई से उतरें। यात्रा शुरू होने दें!',
    icon: (
      <motion.svg className="w-40 h-40 sm:w-56 sm:h-56 mx-auto text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <motion.path variants={iconVariants} initial="hidden" animate="visible" strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </motion.svg>
    ),
  }
];

// Motion variants for slide transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.4, type: "spring", bounce: 0.4 }
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { language, toggleLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(true);

  // Simulate network load on slide change
  useEffect(() => {
    setIsSimulatingLoad(true);
    const timer = setTimeout(() => {
      setIsSimulatingLoad(false);
    }, 600); // 600ms fake load to show spinner
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const paginate = (newDirection: number) => {
    const nextSlide = currentSlide + newDirection;
    if (nextSlide >= 0 && nextSlide < slides.length) {
      setDirection(newDirection);
      setCurrentSlide(nextSlide);
    } else if (nextSlide === slides.length) {
      onComplete();
    }
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    const swipeThreshold = 50;

    if (swipe < -swipeThreshold) {
      paginate(1);
    } else if (swipe > swipeThreshold) {
      paginate(-1);
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900 overflow-hidden font-sans select-none">
      {/* Dynamic Background Gradients based on slide */}
      <motion.div
        className="absolute inset-0 opacity-40 blur-3xl pointer-events-none"
        animate={{
          background:
            currentSlide === 0 ? "radial-gradient(circle at top right, rgba(245,158,11,0.4), transparent 50%)" :
            currentSlide === 1 ? "radial-gradient(circle at top left, rgba(99,102,241,0.4), transparent 50%)" :
            currentSlide === 2 ? "radial-gradient(circle at bottom right, rgba(16,185,129,0.4), transparent 50%)" :
            "radial-gradient(circle at center, rgba(234,179,8,0.4), transparent 50%)"
        }}
        transition={{ duration: 1 }}
      />

      {/* Header with Language Toggle & Skip */}
      <div className="flex justify-between items-center p-4 sm:p-6 z-50 w-full absolute top-0 left-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-sm font-medium text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle Language"
        >
          <span className={language === 'en' ? "text-amber-400 font-bold" : "text-white/60"}>A</span>
          <span className="text-white/30">|</span>
          <span className={language === 'hi' ? "text-amber-400 font-bold text-lg leading-none" : "text-white/60 text-lg leading-none"}>अ</span>
        </motion.button>

        {!isLastSlide ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="text-white/60 hover:text-white font-medium px-4 py-2 transition-colors cursor-pointer bg-black/20 rounded-full backdrop-blur-sm"
          >
            {language === 'en' ? 'Skip' : 'छोड़ें'}
          </motion.button>
        ) : (
           <div className="px-4 py-2"></div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-xl mx-auto w-full relative h-full">

        {/* Loading Spinner Overlay */}
        <AnimatePresence>
            {isSimulatingLoad && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-3xl"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-white/20 border-t-amber-500 rounded-full"
                    />
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 flex flex-col items-center text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Glossy shine effect on card */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[2.5rem]" />

            <div className="relative z-10 mb-6">
                {slide.icon}
            </div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md"
            >
              {language === 'en' ? slide.title_en : slide.title_hi}
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-base sm:text-lg text-white/70 max-w-sm leading-relaxed"
            >
              {language === 'en' ? slide.desc_en : slide.desc_hi}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="p-8 sm:p-12 flex flex-col items-center gap-8 z-50 w-full relative">
        {/* Progress Indicators */}
        <div className="flex gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                index === currentSlide
                  ? 'w-10 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(245,158,11,0.3)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => paginate(1)}
          className="w-full max-w-sm py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl relative overflow-hidden group"
        >
          {/* Button Shine effect */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

          <div className="flex items-center justify-center gap-2 relative z-10">
            {isLastSlide
                ? (language === 'en' ? 'Get Started' : 'शुरू करें')
                : (language === 'en' ? 'Continue' : 'आगे बढ़ें')
            }
            {!isLastSlide && (
                <motion.svg
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </motion.svg>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
