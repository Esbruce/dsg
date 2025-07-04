import React from "react";
import Image from "next/image";

export default function Header() {
  /* Simplified header, invite functionality removed */
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Image src="/dsg_logo.jpg" alt="DSG Logo" width={160} height={60} className="object-contain" priority />
          <span className="text-sm md:text-base text-gray-700 font-medium tracking-wide whitespace-nowrap ml-2" style={{ fontFamily: 'Inter, sans-serif' }}>Built by doctors. Powered by AI.</span>
        </div>
        <div className="flex-1" />
      </div>
    </header>
  );
}



