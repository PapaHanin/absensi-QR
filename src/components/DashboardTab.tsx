import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, SystemSettings, Teacher, ScheduledLeave, BehaviorLog } from '../types';
import { exportAttendanceToCSV } from '../utils/csv';
import { openWhatsAppNotification } from '../utils/whatsapp';
import { generateAttendancePDFReport } from '../utils/pdf';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { isHomeroomClassMatch, formatClassLabel } from '../utils/classUtils';
import { AutoAbsenteeModal } from './AutoAbsenteeModal';
import { ScheduledLeaveModal } from './ScheduledLeaveModal';
import { StudentBehaviorModal } from './StudentBehaviorModal';

interface DashboardTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  scheduledLeaves?: ScheduledLeave[];
  behaviorLogs?: BehaviorLog[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  settings: SystemSettings;
  teachers?: Teacher[];
  currentTeacher?: Teacher | null;
  onAddManualAttendance: (
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    customTime?: string
  ) => void;
  onDeleteRecord: (id: string) => void;
  onSaveLeave?: (leave: ScheduledLeave, autoPopulateAttendance: boolean) => void;
  onDeleteLeave?: (leaveId: string) => void;
  onSaveBehaviorLog?: (log: BehaviorLog) => void;
  onDeleteBehaviorLog?: (logId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  attendanceRecords,
  scheduledLeaves = [],
  behaviorLogs = [],
  selectedDate,
  setSelectedDate,
  settings,
  teachers,
  currentTeacher,
  onAddManualAttendance,
  onDeleteRecord,
  onSaveLeave,
  onDeleteLeave,
  onSaveBehaviorLog,
  onDeleteBehaviorLog,
}) => {
  const isAdmin = currentTeacher?.role === 'admin' || currentTeacher?.teacherType === 'admin';
  const isWaliKelas = !isAdmin && (currentTeacher?.teacherType === 'wali_kelas' || Boolean(currentTeacher?.homeroomClass));
  const myHomeroom = currentTeacher?.homeroomClass;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isWaliKelas && myHomeroom) return myHomeroom;
    return 'Semua';
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [exportAlertMessage, setExportAlertMessage] = useState<string | null>(null);

  // New Features Modals State
  const [isAutoAbsenteeOpen, setIsAutoAbsenteeOpen] = useState(false);
  const [isScheduledLeaveOpen, setIsScheduledLeaveOpen] = useState(false);
  const [isStudentBehaviorOpen, setIsStudentBehaviorOpen] = useState(false);

  // Manual Attendance Form State
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Hadir');
  const [manualNote, setManualNote] = useState('');
  const [manualTime, setManualTime] = useState('06:50');

  // Filter mode state: 'daily' | 'range' | 'monthly'
  const [filterMode, setFilterMode] = useState<'daily' | 'range' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<string>(selectedDate);
  const [endDate, setEndDate] = useState<string>(selectedDate);
  const [monthPicker, setMonthPicker] = useState<string>(() => selectedDate.slice(0, 7));

  // Filter attendance by date / range / month
  const dateFilteredRecords = useMemo(() => {
    if (filterMode === 'daily') {
      return attendanceRecords.filter((rec) => rec.date === selectedDate);
    } else if (filterMode === 'range') {
      if (!startDate || !endDate) return attendanceRecords;
      return attendanceRecords.filter((rec) => rec.date >= startDate && rec.date <= endDate);
    } else if (filterMode === 'monthly') {
      if (!monthPicker) return attendanceRecords;
      return attendanceRecords.filter((rec) => rec.date.startsWith(monthPicker));
    }
    return attendanceRecords;
  }, [attendanceRecords, filterMode, selectedDate, startDate, endDate, monthPicker]);

  // Readable Date Range Label for UI and PDF Report
  const dateRangeLabel = useMemo(() => {
    if (filterMode === 'daily') {
      try {
        const d = new Date(selectedDate);
        return d.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return selectedDate;
      }
    } else if (filterMode === 'range') {
      return `${startDate} s/d ${endDate}`;
    } else if (filterMode === 'monthly') {
      try {
        const [y, m] = monthPicker.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1, 1);
        const mName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        return `Bulan ${mName}`;
      } catch {
        return `Bulan ${monthPicker}`;
      }
    }
    return selectedDate;
  }, [filterMode, selectedDate, startDate, endDate, monthPicker]);

  // Statistics calculation
  const stats = useMemo(() => {
    const relevantStudents = isWaliKelas && myHomeroom
      ? students.filter((s) => isHomeroomClassMatch(s.classRoom, myHomeroom))
      : students;
    const totalStudents = relevantStudents.length;

    const relevantRecords = isWaliKelas && myHomeroom
      ? dateFilteredRecords.filter((r) => isHomeroomClassMatch(r.classRoom, myHomeroom))
      : (selectedClass !== 'Semua' ? dateFilteredRecords.filter((r) => isHomeroomClassMatch(r.classRoom, selectedClass) || r.classRoom === selectedClass) : dateFilteredRecords);

    const hadir = relevantRecords.filter((r) => r.status === 'Hadir').length;
    const terlambat = relevantRecords.filter((r) => r.status === 'Terlambat').length;
    const izinSakit = relevantRecords.filter((r) => r.status === 'Izin' || r.status === 'Sakit').length;
    const alpa = relevantRecords.filter((r) => r.status === 'Alpa').length;
    const totalRecorded = relevantRecords.length;
    const unrecorded = Math.max(0, totalStudents - totalRecorded);

    return { totalStudents, hadir, terlambat, izinSakit, alpa, totalRecorded, unrecorded };
  }, [students, dateFilteredRecords, isWaliKelas, myHomeroom, selectedClass]);

  // Active Leaves for today/selectedDate
  const activeLeavesCount = useMemo(() => {
    return scheduledLeaves.filter(
      (l) => selectedDate >= l.startDate && selectedDate <= l.endDate
    ).length;
  }, [scheduledLeaves, selectedDate]);

  // Available classes for filter
  const classesList = useMemo(() => {
    const setCls = new Set(students.map((s) => s.classRoom));
    return ['Semua', ...Array.from(setCls).sort()];
  }, [students]);

  // Filtered list for the display table
  const filteredTableData = useMemo(() => {
    return dateFilteredRecords.filter((rec) => {
      const matchSearch =
        rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.nis.toLowerCase().includes(searchTerm.toLowerCase());

      let matchClass = true;
      if (isWaliKelas && myHomeroom) {
        matchClass = isHomeroomClassMatch(rec.classRoom, myHomeroom);
      } else if (selectedClass !== 'Semua') {
        matchClass = isHomeroomClassMatch(rec.classRoom, selectedClass) || rec.classRoom === selectedClass;
      }

      const matchStatus = selectedStatus === 'Semua' || rec.status === selectedStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [dateFilteredRecords, searchTerm, isWaliKelas, myHomeroom, selectedClass, selectedStatus]);

  const handleExportCSV = () => {
    if (!filteredTableData || filteredTableData.length === 0) {
      setExportAlertMessage('Tidak ada data absensi untuk diekspor ke CSV pada filter saat ini.');
      return;
    }
    exportAttendanceToCSV(
      filteredTableData,
      `Rekap_Absensi_${dateRangeLabel.replace(/[\s\/\\]+/g, '_')}_Kelas_${selectedClass}.csv`
    );
  };

  const handleExportPDF = () => {
    if (!filteredTableData || filteredTableData.length === 0) {
      setExportAlertMessage('Tidak ada data absensi untuk dicetak ke PDF pada filter saat ini.');
      return;
    }

    // Dynamic signature determination based on selected class and teachers list
    let hrTeacher: { name?: string; nip?: string; classLabel?: string } | undefined = undefined;

    if (selectedClass !== 'Semua') {
      const matchedTeacher = teachers?.find(
        (t) => (t.teacherType === 'wali_kelas' || t.homeroomClass) && t.homeroomClass === selectedClass
      );
      if (matchedTeacher) {
        hrTeacher = {
          name: matchedTeacher.name,
          nip: matchedTeacher.nip || '-',
          classLabel: `Wali Kelas ${selectedClass}`,
        };
      } else if (currentTeacher?.homeroomClass === selectedClass) {
        hrTeacher = {
          name: currentTeacher.name,
          nip: currentTeacher.nip || '-',
          classLabel: `Wali Kelas ${selectedClass}`,
        };
      } else {
        hrTeacher = {
          name: '....................................',
          nip: 'NIP. ............................',
          classLabel: `Wali Kelas ${selectedClass}`,
        };
      }
    } else {
      if (currentTeacher?.teacherType === 'wali_kelas' && currentTeacher.homeroomClass) {
        hrTeacher = {
          name: currentTeacher.name,
          nip: currentTeacher.nip || '-',
          classLabel: `Wali Kelas ${currentTeacher.homeroomClass}`,
        };
      } else {
        hrTeacher = {
          name: '....................................',
          nip: 'NIP. ............................',
          classLabel: 'Wali Kelas / Koordinator Presensi',
        };
      }
    }

    const hm = {
      name: settings.headmasterName || 'Drs. H. Mulyadi, M.Pd.',
      nip: settings.headmasterNip || '19680512 199403 1 004',
    };

    generateAttendancePDFReport({
      records: filteredTableData,
      dateRangeLabel,
      selectedClass,
      settings,
      stats,
      homeroomTeacher: hrTeacher,
      headmaster: hm,
    });
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }
    onAddManualAttendance(manualStudentId, manualStatus, manualNote, `${manualTime}:00`);
    setIsManualModalOpen(false);
    setManualStudentId('');
    setManualNote('');
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Hadir':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <i className="fa-solid fa-circle-check text-[10px]"></i> Hadir
          </span>
        );
      case 'Terlambat':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <i className="fa-solid fa-clock text-[10px]"></i> Terlambat
          </span>
        );
      case 'Izin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <i className="fa-solid fa-file-signature text-[10px]"></i> Izin
          </span>
        );
      case 'Sakit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <i className="fa-solid fa-notes-medical text-[10px]"></i> Sakit
          </span>
        );
      case 'Alpa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <i className="fa-solid fa-circle-xmark text-[10px]"></i> Alpa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Streamlined Clean Header & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs transition-colors space-y-4">
        {/* Row 1: Page Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Dashboard & Rekap Absensi
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/80">
                {dateRangeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoring kehadiran siswa realtime, rekapitulasi harian, rentang tanggal, dan bulanan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <i className="fa-solid fa-user-plus text-indigo-600 dark:text-indigo-400"></i>
              <span>Absen Manual</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Unduh Laporan Absensi PDF Siap Cetak"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span>Unduh PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Ekspor Data ke File Excel / CSV"
            >
              <i className="fa-solid fa-file-csv"></i>
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Clean Date Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 w-fit">
            <button
              type="button"
              onClick={() => setFilterMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-regular fa-calendar text-[11px]"></i>
              <span>Harian</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('range')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'range'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-calendar-days text-[11px]"></i>
              <span>Rentang Tanggal</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-calendar-week text-[11px]"></i>
              <span>Per Bulan</span>
            </button>
          </div>

          {/* Dynamic Date Inputs */}
          <div className="flex items-center gap-2">
            {filterMode === 'daily' && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <i className="fa-regular fa-calendar text-slate-400"></i>
                <span className="font-medium text-slate-500 dark:text-slate-400">Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {filterMode === 'range' && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                />
                <span className="text-slate-400">-</span>
                <span className="font-medium text-slate-500 dark:text-slate-400">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {filterMode === 'monthly' && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <i className="fa-solid fa-calendar-week text-slate-400"></i>
                <span className="font-medium text-slate-500 dark:text-slate-400">Bulan:</span>
                <input
                  type="month"
                  value={monthPicker}
                  onChange={(e) => setMonthPicker(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Bento Grid Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Siswa */}
        <div className="bento-card border-l-4 border-l-slate-400 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Siswa</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">Siswa terdaftar</div>
          </div>
        </div>

        {/* Hadir */}
        <div className="bento-card border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="stat-label text-emerald-700">Hadir Tepat Waktu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-user-check"></i>
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-value text-emerald-700">{stats.hadir}</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              {stats.totalStudents > 0
                ? `${Math.round((stats.hadir / stats.totalStudents) * 100)}% dari total`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bento-card border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="stat-label text-amber-700">Terlambat</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-user-clock"></i>
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-value text-amber-700">{stats.terlambat}</div>
            <div className="text-[11px] font-semibold text-amber-600 mt-1">&gt; 07:00 WIB</div>
          </div>
        </div>

        {/* Izin / Sakit */}
        <div className="bento-card border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="stat-label text-indigo-700">Izin / Sakit</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-notes-medical"></i>
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-value text-indigo-700">{stats.izinSakit}</div>
            <div className="text-[11px] font-semibold text-indigo-600 mt-1">Keterangan resmi</div>
          </div>
        </div>

        {/* Alpa / Belum Absen */}
        <div className="bento-card border-l-4 border-l-rose-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="stat-label text-rose-700">Alpa / Belum Absen</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-user-xmark"></i>
            </div>
          </div>
          <div className="mt-2">
            <div className="stat-value text-rose-700">
              {stats.alpa + stats.unrecorded}
            </div>
            <div className="text-[11px] font-semibold text-rose-600 mt-1">
              {stats.alpa} Alpa, {stats.unrecorded} Belum
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tools: Auto-Flag Absentees, Scheduled Leaves, Behavior Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tool 1: Auto Absentee Detection */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-rose-50 to-orange-50/60 dark:from-rose-950/30 dark:to-orange-950/20 border border-rose-200/80 dark:border-rose-800/60 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                <i className="fa-solid fa-bell"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Peringatan Siswa Alpha
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Deteksi otomatis & kirim WA
                </p>
              </div>
            </div>
            {stats.unrecorded > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                {stats.unrecorded} Belum Hadir
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Lengkap
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsAutoAbsenteeOpen(true)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <i className="fa-solid fa-magnifying-glass-chart"></i>
            <span>Cek Siswa Belum Hadir</span>
          </button>
        </div>

        {/* Tool 2: Scheduled Leaves & Doctor's Note */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-sky-50 to-indigo-50/60 dark:from-sky-950/30 dark:to-indigo-950/20 border border-sky-200/80 dark:border-sky-800/60 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Izin / Sakit Terjadwal
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Izin multi-hari & surat dokter
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
              {activeLeavesCount > 0 ? `${activeLeavesCount} Aktif Hari Ini` : `${scheduledLeaves.length} Total Izin`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsScheduledLeaveOpen(true)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white text-sky-700 dark:text-sky-300 text-xs font-bold rounded-xl border border-sky-200 dark:border-sky-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <i className="fa-solid fa-file-medical"></i>
            <span>Kelola Izin & Bukti Dokter</span>
          </button>
        </div>

        {/* Tool 3: Behavior & Character Logs */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-amber-50 to-yellow-50/60 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/80 dark:border-amber-800/60 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                <i className="fa-solid fa-star"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Jurnal & Poin Karakter
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Kedisiplinan & evaluasi rapor
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {behaviorLogs.length} Catatan
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsStudentBehaviorOpen(true)}
            className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <i className="fa-solid fa-book-bookmark"></i>
            <span>Buka Jurnal & Poin Siswa</span>
          </button>
        </div>
      </div>

      {/* 7-Day Attendance Trend Visualizer (Recharts) */}
      <AttendanceTrendChart
        students={students}
        attendanceRecords={attendanceRecords}
        selectedDate={selectedDate}
        selectedClass={selectedClass}
      />

      {/* Bento Main Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Cari nama siswa atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                title="Hapus Pencarian"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <i className="fa-solid fa-graduation-cap text-indigo-600 dark:text-indigo-400 text-xs"></i>
              <span className="font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
              >
                {classesList.map((cls) => (
                  <option key={cls} value={cls} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {cls === 'Semua' ? 'Semua Kelas' : `Kelas ${cls}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <i className="fa-solid fa-filter text-slate-500 dark:text-slate-400 text-xs"></i>
              <span className="font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Semua Status</option>
                <option value="Hadir" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Hadir</option>
                <option value="Terlambat" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Terlambat</option>
                <option value="Izin" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Izin</option>
                <option value="Sakit" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Sakit</option>
                <option value="Alpa" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Alpa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Results Count & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span>
            Menampilkan <strong className="text-slate-900 dark:text-white font-mono font-bold">{filteredTableData.length}</strong> data absensi
            {selectedClass !== 'Semua' && (
              <> (Kelas <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedClass}</span>)</>
            )}
          </span>
          {(searchTerm || selectedClass !== 'Semua' || selectedStatus !== 'Semua') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('Semua');
                setSelectedStatus('Semua');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left text-[10px]"></i>
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Main Attendance Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                {filterMode !== 'daily' && <th className="py-3 px-4">Tanggal</th>}
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
              {filteredTableData.length > 0 ? (
                filteredTableData.map((record, index) => {
                  const studentInfo = students.find((s) => s.id === record.studentId);
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 dark:text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={studentInfo?.photo || studentInfo?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={record.studentName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{record.studentName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">NIS: {record.nis}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{record.classRoom}</td>
                      {filterMode !== 'daily' && (
                        <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">{record.date}</td>
                      )}
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 dark:text-indigo-400">{record.time} WIB</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <i
                            className={
                              record.scannedVia === 'QR Camera'
                                ? 'fa-solid fa-camera text-indigo-600 dark:text-indigo-400'
                                : 'fa-solid fa-keyboard text-amber-600 dark:text-amber-400'
                            }
                          ></i>
                          {record.scannedVia}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {record.note || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {studentInfo ? (
                            <button
                              onClick={() =>
                                openWhatsAppNotification(
                                  studentInfo,
                                  record,
                                  settings.schoolName
                                )
                              }
                              title={`Kirim WA Otomatis ke Ortu ${record.studentName} (${studentInfo.parentPhone || 'No HP Belum Ada'})`}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold shadow-2xs"
                            >
                              <i className="fa-brands fa-whatsapp text-sm"></i>
                              <span>Kirim WA</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Data siswa tidak ditemukan"
                              className="px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed"
                            >
                              <i className="fa-brands fa-whatsapp text-sm mr-1"></i>
                              <span>Kirim WA</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            title="Hapus riwayat ini"
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <i className="fa-solid fa-clipboard-question text-3xl text-slate-300"></i>
                      <p className="font-bold text-sm text-slate-700">Tidak ada data absensi ditemukan</p>
                      <p className="text-xs text-slate-500">
                        Gunakan tab Scanner QR untuk melakukan pemindaian atau ubah filter tanggal/pencarian.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Absen Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-1">
              <i className="fa-solid fa-pen-to-square text-indigo-600"></i>
              <span>Input Absensi Manual</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Catat absensi siswa secara manual untuk kasus siswa tanpa kartu QR atau keterangan khusus.
            </p>

            <form onSubmit={handleSubmitManual} className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Siswa <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students
                    .filter((std) => (isWaliKelas && myHomeroom ? isHomeroomClassMatch(std.classRoom, myHomeroom) : true))
                    .map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.name} ({std.nis}) - {formatClassLabel(std.classRoom)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status & Jam */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Kehadiran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Catatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Surat sakit terlampir, Lomba, dll..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Simpan Absensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Alert Modal */}
      {exportAlertMessage && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Informasi Laporan</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {exportAlertMessage}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setExportAlertMessage(null)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Modal Auto Absentee Detection */}
      {isAutoAbsenteeOpen && (
        <AutoAbsenteeModal
          students={students}
          attendanceRecords={attendanceRecords}
          selectedDate={selectedDate}
          settings={settings}
          currentTeacher={currentTeacher || null}
          onAddManualAttendance={onAddManualAttendance}
          onClose={() => setIsAutoAbsenteeOpen(false)}
        />
      )}

      {/* 2. Modal Scheduled Leaves & Doctor Note Upload */}
      {isScheduledLeaveOpen && onSaveLeave && onDeleteLeave && (
        <ScheduledLeaveModal
          students={students}
          leaves={scheduledLeaves}
          currentTeacher={currentTeacher || null}
          onSaveLeave={onSaveLeave}
          onDeleteLeave={onDeleteLeave}
          onClose={() => setIsScheduledLeaveOpen(false)}
        />
      )}

      {/* 3. Modal Student Behavior & Character Log */}
      {isStudentBehaviorOpen && onSaveBehaviorLog && onDeleteBehaviorLog && (
        <StudentBehaviorModal
          students={students}
          behaviorLogs={behaviorLogs}
          settings={settings}
          currentTeacher={currentTeacher || null}
          onSaveBehaviorLog={onSaveBehaviorLog}
          onDeleteBehaviorLog={onDeleteBehaviorLog}
          onClose={() => setIsStudentBehaviorOpen(false)}
        />
      )}
    </div>
  );
};
