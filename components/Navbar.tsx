import React from 'react';
import { Icons } from './Icons';

interface NavbarProps {
  onHome: () => void;
  onSearchOpen: () => void;
  onCompareOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onSearchOpen, onCompareOpen }) => {
  return (
    <nav className="sticky top-0 z-40 bg-[#fdfbf7]/80 backdrop-blur-md border-b border-orange-200/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer group" onClick={onHome}>
             <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-700 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md transform group-hover:rotate-6 transition-all duration-300 ring-2 ring-orange-100 group-hover:ring-orange-200">
                <span className="text-xl">ॐ</span>
             </div>
             <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-stone-900 heading-text leading-none group-hover:text-orange-700 transition-colors">BharatItihas</span>
             </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
             <button 
                onClick={onHome} 
                className="hidden md:flex p-2 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-300" 
                aria-label="Home"
                title="Go to Dashboard"
             >
               <Icons.Home />
             </button>
             
             {onCompareOpen && (
                <button
                  onClick={onCompareOpen}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-stone-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all font-medium text-sm border border-transparent hover:border-orange-200"
                  title="Compare two figures"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  <span>Compare</span>
                </button>
             )}

             <div className="hidden md:block h-6 w-px bg-stone-200"></div>
             
             <button 
                onClick={onSearchOpen} 
                className="flex items-center gap-3 px-4 py-2 text-stone-600 bg-white/50 hover:bg-white hover:text-orange-800 rounded-full transition-all duration-300 border border-stone-200 hover:border-orange-300 hover:shadow-md group"
             >
               <span className="group-hover:scale-110 transition-transform"><Icons.Search /></span>
               <span className="hidden sm:inline font-medium text-sm">Search History...</span>
               <kbd className="hidden lg:inline-flex items-center justify-center bg-white text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-200 shadow-sm">CTRL K</kbd>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;