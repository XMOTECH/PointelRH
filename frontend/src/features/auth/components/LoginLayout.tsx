import React from 'react';

interface LoginLayoutProps {
  children: React.ReactNode;
  leftContent: React.ReactNode;
  leftBgClass?: string;
}

export function LoginLayout({ children, leftContent, leftBgClass = "bg-primary" }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Left Pane - Brand/Promo */}
        <div className={`w-full md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden ${leftBgClass}`}>
          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-white/5 rounded-full blur-2xl opacity-30"></div>
          
          <div className="relative z-10">
            {leftContent}
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
          
          {/* Footer inside Right Pane */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              © 2024 POINTEL SIRH. TOUS DROITS RÉSERVÉS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
