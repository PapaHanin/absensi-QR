import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  todayCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, todayCount }) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard & Rekap',
      icon: 'fa-solid fa-chart-pie',
      badge: null,
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'Scan QR Kamera',
      icon: 'fa-solid fa-camera',
      badge: 'LIVE',
      badgeClass: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'students' as ActiveTab,
      label: 'Data Siswa & Kartu',
      icon: 'fa-solid fa-id-card',
      badge: null,
    },
    {
      id: 'simulator' as ActiveTab,
      label: 'Pengaturan & Simulasi',
      icon: 'fa-solid fa-sliders',
      badge: null,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs Bar (Clean Segmented Tabs) */}
      <nav className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 hidden md:block backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <i className={`${item.icon} text-xs ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}></i>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.id === 'dashboard' && todayCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' : 'bg-slate-300/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {todayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden lg:block">
            Sistem Absensi Otomatis SD • Berbasis Kartu QR
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-2 shadow-lg">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <i className={`${item.icon} text-base mb-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}></i>
                <span className="text-[10px] truncate max-w-full">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

