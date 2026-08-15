import React, { useState, useEffect, useRef } from 'react';
import { SystemSettings, Teacher } from '../types';

interface HeaderProps {
  settings: SystemSettings;
  currentTeacher: Teacher | null;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onOpenTeacherManage: () => void;
  onOpenCloudSync: () => void;
  onOpenAdminProfile?: () => void;
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentTeacher,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenLogin,
  onLogout,
  onOpenTeacherManage,
  onOpenCloudSync,
  onOpenAdminProfile,
  onOpenGuide,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Clean Brand & School Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            <i className="fa-solid fa-qrcode"></i>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {settings.schoolName || 'Sistem Absensi Siswa'}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shrink-0">
                TA {settings.academicYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden xs:block">
              Presensi Realtime Siswa • Batas: {settings.lateCutoffTime} WIB
            </p>
          </div>
        </div>

        {/* Right: Clean, Unified Utility & Profile Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Live Clock Pill (Minimalist) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500">{formattedDate}</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formattedTime}</span>
          </div>

          {/* Guide Button */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 transition-all cursor-pointer"
              title="Panduan Instalasi HP Guru & Penjualan"
            >
              <i className="fa-solid fa-mobile-screen-button text-emerald-600 dark:text-emerald-400 text-xs"></i>
              <span className="hidden md:inline">Panduan HP</span>
            </button>
          )}

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenCloudSync}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 transition-all cursor-pointer"
            title="Sinkronisasi Cloud & Google Sheets"
          >
            <i className="fa-solid fa-cloud-arrow-up text-indigo-600 dark:text-indigo-400 text-xs"></i>
            <span className="hidden md:inline">Cloud Sync</span>
          </button>

          {/* Dark / Light Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs font-bold text-slate-600 dark:text-amber-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title={isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
            </button>
          )}

          {/* User Account / Profile Menu */}
          {currentTeacher ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer text-left"
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentTeacher.role === 'admin'
                      ? 'bg-amber-500 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  <i className={currentTeacher.role === 'admin' ? 'fa-solid fa-shield-halved text-[10px]' : 'fa-solid fa-user-tie text-[10px]'}></i>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[120px]">
                    {currentTeacher.name}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 leading-none">
                    {currentTeacher.role === 'admin' ? 'Admin Sekolah' : currentTeacher.subject}
                  </span>
                </div>
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 ml-0.5"></i>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{currentTeacher.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentTeacher.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {currentTeacher.role === 'admin' ? 'Administrator Utama' : `Guru Mapel: ${currentTeacher.subject}`}
                    </span>
                  </div>

                  <div className="py-1">
                    {currentTeacher.role === 'admin' && onOpenAdminProfile && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAdminProfile();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <i className="fa-solid fa-school text-indigo-600 dark:text-indigo-400 w-4"></i>
                        <span>Edit Profil & Sekolah</span>
                      </button>
                    )}

                    {currentTeacher.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenTeacherManage();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        <i className="fa-solid fa-users-gear text-indigo-600 dark:text-indigo-400 w-4"></i>
                        <span>Kelola Akun Guru</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          onOpenLogin();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 font-semibold"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4"></i>
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
              <span>Login Guru</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

