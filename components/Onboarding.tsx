import React, { useState, useEffect } from 'react';
import { useLanguage } from '../src/contexts/LanguageContext';

interface Slide {
  id: string;
  title_en: string;
  desc_en: string;
  title_hi: string;
  desc_hi: string;
  icon: React.ReactNode;
}

const slides: Slide[] = [
  {
    id: 'timeline',
    title_en: 'Explore Interactive Timeline',
    desc_en: 'Journey through centuries of history with our visual timeline. Discover dynasties, eras, and historical figures effortlessly.',
    title_hi: 'इंटरएक्टिव टाइमलाइन का अन्वेषण करें',
    desc_hi: 'हमारी दृश्य टाइमलाइन के साथ सदियों के इतिहास की यात्रा करें। राजवंशों, युगों और ऐतिहासिक हस्तियों की खोज करें।',
    icon: (
      <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto text-orange-500 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3m12 0h3m-9-9v3m0 12v3" />
      </svg>
    ),
  },
  {
    id: 'ai',
    title_en: 'Meet Your AI Historian',
    desc_en: 'Chat directly with historical figures through our Samvad AI, or ask general historical questions to our global Itihaskar assistant.',
    title_hi: 'अपने AI इतिहासकार से मिलें',
    desc_hi: 'हमारे संवाद AI के माध्यम से ऐतिहासिक हस्तियों से सीधे चैट करें, या हमारे वैश्विक इतिहासकार सहायक से सामान्य ऐतिहासिक प्रश्न पूछें।',
    icon: (
      <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto text-indigo-500 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 'compare',
    title_en: 'Compare & Analyze',
    desc_en: 'Select two kings or dynasties to compare their reign, empire size, and historical impact side-by-side.',
    title_hi: 'तुलना करें और विश्लेषण करें',
    desc_hi: 'उनके शासनकाल, साम्राज्य के आकार और ऐतिहासिक प्रभाव की अगल-बगल तुलना करने के लिए दो राजाओं या राजवंशों का चयन करें।',
    icon: (
      <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto text-emerald-500 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'offline',
    title_en: 'Ready to Begin?',
    desc_en: 'Access history offline, search globally, and dive deep into India\'s rich past. Let the journey begin!',
    title_hi: 'शुरू करने के लिए तैयार हैं?',
    desc_hi: 'ऑफ़लाइन इतिहास तक पहुँचें, विश्व स्तर पर खोजें, और भारत के समृद्ध अतीत में गहराई से उतरें। यात्रा शुरू होने दें!',
    icon: (
      <svg className="w-32 h-32 sm:w-48 sm:h-48 mx-auto text-yellow-500 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { language, toggleLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance to trigger swipe
  const minSwipeDistance = 50;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-stone-50 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header with Language Toggle & Skip */}
      <div className="flex justify-between items-center p-4 sm:p-6 z-10 w-full absolute top-0 left-0">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Toggle Language"
        >
          <span className="text-orange-600 font-bold">{language === 'en' ? 'A' : 'अ'}</span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">{language === 'en' ? 'अ' : 'A'}</span>
          <span className="ml-1 hidden sm:inline">{language === 'en' ? 'English' : 'हिंदी'}</span>
        </button>

        {!isLastSlide ? (
          <button
            onClick={onComplete}
            className="text-stone-500 hover:text-stone-800 font-medium px-4 py-2 transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Skip' : 'छोड़ें'}
          </button>
        ) : (
           <div className="px-4 py-2"></div> // Placeholder to keep layout balanced
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-2xl mx-auto w-full relative mt-16 sm:mt-20">
        <div
          key={slide.id}
          className="animate-in fade-in slide-in-from-right-8 duration-500 ease-out flex flex-col items-center text-center w-full"
        >
          {slide.icon}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-4 font-serif">
            {language === 'en' ? slide.title_en : slide.title_hi}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-md leading-relaxed px-4">
            {language === 'en' ? slide.desc_en : slide.desc_hi}
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 sm:p-10 flex flex-col items-center gap-8 z-10 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent w-full pb-10">
        {/* Indicators */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-orange-600'
                  : 'w-2.5 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full max-w-sm py-4 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {isLastSlide
            ? (language === 'en' ? 'Get Started' : 'शुरू करें')
            : (language === 'en' ? 'Continue' : 'आगे बढ़ें')
          }
          {!isLastSlide && (
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
