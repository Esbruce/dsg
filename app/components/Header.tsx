import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-white px-8 py-3 flex items-center justify-between shadow-sm max-w-5xl mx-auto rounded-2xl">
      {/* Left: Logo and Slogan */}
      <div className="flex items-center gap-6">
        <Image src="/DSG%20logo.jpg" alt="DSG Logo" width={240} height={90} className="object-contain" priority />
        <span className="text-lg text-gray-800 font-medium whitespace-nowrap">Built by doctors. Powered by AI.</span>
        <div style={{ width: '180px' }} />
      </div>
      {/* Right: Navigation */}
      <nav className="flex items-center gap-2">
        <a href="#about" className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>About</a>
        <span className="text-lg font-medium ml-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif', cursor: 'pointer', color: 'rgba(4,179,190,1)' }}>Settings</span>
      </nav>
    </header>
  );
} 