import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, SystemSettings } from '../types';
import { SD_CLASSES } from '../data/initialData';
import { formatClassLabel } from '../utils/classUtils';

interface SimulatorTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: SystemSettings;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onRecordAttendance: (student: Student, scannedVia: 'QR Camera' | 'Manual Input' | 'Simulator') => {
    record: AttendanceRecord;
    isDuplicate: boolean;
  };
  onResetData: () => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  students,
  attendanceRecords,
  settings,
  isDarkMode = false,
  onToggleDarkMode,
  onUpdateSettings,
  onRecordAttendance,
  onResetData,
}) => {
  const [cutoffTime, setCutoffTime] = useState(settings.lateCutoffTime);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);

  const [simulatedClass, setSimulatedClass] = useState<string>('Semua');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredStudents = students.filter(
    (s) => simulatedClass === 'Semua' || s.classRoom === simulatedClass
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      lateCutoffTime: cutoffTime,
      schoolName,
      academicYear,
    });
    alert('Pengaturan berhasil diperbarui!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-sliders text-amber-600"></i>
          <span>Simulasi Presensi & Pengaturan Sistem</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Uji coba alur pemindaian cepat serta konfigurasi parameter sistem absensi sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Scan Simulator (2 Cols) */}
        <div className="lg:col-span-2 bento-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                <span>Simulasi Instan Scan QR Siswa</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Klik tombol &quot;Simulasi&quot; untuk menguji absensi siswa secara langsung.
              </p>
            </div>

            <select
              value={simulatedClass}
              onChange={(e) => setSimulatedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {Array.from(new Set([...SD_CLASSES, ...students.map((s) => s.classRoom)])).sort().map((cls) => (
                <option key={cls} value={cls}>
                  {formatClassLabel(cls)}
                </option>
              ))}
            </select>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const hasScannedToday = attendanceRecords.some(
                (r) => r.studentId === student.id && r.date === new Date().toISOString().split('T')[0]
              );

              return (
                <div
                  key={student.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    hasScannedToday
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{student.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-semibold">
                        NIS: {student.nis} • Kelas {student.classRoom}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const { isDuplicate } = onRecordAttendance(student, 'Simulator');
                      if (isDuplicate) {
                        alert(`⚠️ ${student.name} sudah melakukan absensi hari ini.`);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      hasScannedToday
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <i className="fa-solid fa-qrcode text-[10px]"></i>
                    <span>{hasScannedToday ? 'Sudah Absen' : 'Simulasi'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Settings & Reset Data (1 Col) */}
        <div className="space-y-6">
          {/* Theme Mode Selector Card */}
          {onToggleDarkMode && (
            <div className="bento-card space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <i className="fa-solid fa-palette text-indigo-600"></i>
                <span>Tampilan / Tema Aplikasi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih mode tampilan yang nyaman untuk mata saat bertugas di kelas atau gerbang sekolah:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isDarkMode) onToggleDarkMode();
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !isDarkMode
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className="fa-solid fa-sun text-amber-500 text-sm"></i>
                  <span>Mode Terang</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDarkMode) onToggleDarkMode();
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-indigo-950 border-indigo-400 text-indigo-300 shadow-xs ring-2 ring-indigo-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className="fa-solid fa-moon text-indigo-400 text-sm"></i>
                  <span>Mode Gelap</span>
                </button>
              </div>
            </div>
          )}

          {/* Settings Box */}
          <div className="bento-card space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <i className="fa-solid fa-gear text-indigo-600"></i>
              <span>Konfigurasi Batas Waktu & Sekolah</span>
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Batas Masuk (Keterlambatan)
                </label>
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Absensi setelah jam ini akan dikategorikan sebagai <strong>Terlambat</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Simpan Pengaturan
              </button>
            </form>
          </div>

          {/* Reset Database Box */}
          <div className="bento-card border-rose-200 bg-rose-50/30 space-y-3">
            <h3 className="text-sm font-extrabold text-rose-700 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Reset Data ke Awal (Demo)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mengembalikan seluruh data siswa dan riwayat absensi ke data dummy sampel awal.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white border border-rose-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Reset Data Sampel
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Reset Database</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Apakah Anda yakin ingin mereset seluruh data absensi dan data siswa kembali ke data sampel awal?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
