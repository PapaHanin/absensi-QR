import { AttendanceRecord, Student, SystemSettings, Teacher } from '../types';
import { formatCleanNIP } from './classUtils';

export interface CSVAttendanceExportOptions {
  records: AttendanceRecord[];
  filename?: string;
  settings?: SystemSettings;
  selectedClass?: string;
  dateRangeLabel?: string;
  homeroomTeacher?: {
    name?: string;
    nip?: string;
    classLabel?: string;
  };
  headmaster?: {
    name?: string;
    nip?: string;
  };
  signatureDate?: string;
}

/**
 * Export attendance records to Excel-compatible CSV file with UTF-8 BOM
 */
export const exportAttendanceToCSV = (
  recordsOrOptions: AttendanceRecord[] | CSVAttendanceExportOptions,
  legacyFilename?: string
) => {
  let records: AttendanceRecord[] = [];
  let filename = legacyFilename || 'Rekap_Absensi_Siswa_SD.csv';
  let settings: SystemSettings | undefined = undefined;
  let selectedClass = 'Semua';
  let dateRangeLabel = '';
  let homeroomTeacher: { name?: string; nip?: string; classLabel?: string } | undefined = undefined;
  let headmaster: { name?: string; nip?: string } | undefined = undefined;
  let signatureDate = '';

  if (Array.isArray(recordsOrOptions)) {
    records = recordsOrOptions;
  } else {
    records = recordsOrOptions.records;
    filename = recordsOrOptions.filename || filename;
    settings = recordsOrOptions.settings;
    selectedClass = recordsOrOptions.selectedClass || 'Semua';
    dateRangeLabel = recordsOrOptions.dateRangeLabel || '';
    homeroomTeacher = recordsOrOptions.homeroomTeacher;
    headmaster = recordsOrOptions.headmaster;
    signatureDate = recordsOrOptions.signatureDate || '';
  }

  if (!records || records.length === 0) {
    alert('Tidak ada data absensi untuk diekspor.');
    return;
  }

  const lines: string[] = [];

  // Kop Header if settings provided
  if (settings) {
    lines.push(`"${settings.schoolName.toUpperCase()}"`);
    lines.push(`"LAPORAN REKAPITULASI PRESENSI SISWA - TAHUN AJARAN ${settings.academicYear}"`);
    if (dateRangeLabel) lines.push(`"Periode:","${dateRangeLabel}"`);
    lines.push(`"Kelas:","${selectedClass}"`);
    lines.push(`"Batas Masuk:","${settings.lateCutoffTime} WIB"`);
    lines.push('""');
  }

  // Header row
  const headers = [
    'No',
    'Tanggal',
    'Jam Masuk',
    'NIS',
    'Nama Siswa',
    'Kelas',
    'Status Kehadiran',
    'Metode Absen',
    'Keterangan',
  ];
  lines.push(headers.join(','));

  // Data rows
  records.forEach((record, index) => {
    const row = [
      index + 1,
      `"${record.date}"`,
      `"${record.time}"`,
      `"${record.nis}"`,
      `"${record.studentName.replace(/"/g, '""')}"`,
      `"${record.classRoom}"`,
      `"${record.status}"`,
      `"${record.scannedVia}"`,
      `"${(record.note || '').replace(/"/g, '""')}"`,
    ];
    lines.push(row.join(','));
  });

  // Tanda Tangan Section
  if (settings) {
    const now = new Date();
    const dateFormatted = signatureDate || now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const city = settings.schoolCity || 'Kota';
    const waliTitle = homeroomTeacher?.classLabel || (selectedClass !== 'Semua' ? `Wali Kelas ${selectedClass}` : 'Wali Kelas / Koordinator');
    const waliName = homeroomTeacher?.name?.trim() || '( ........................................ )';
    const waliNip = formatCleanNIP(homeroomTeacher?.nip);

    const headName = headmaster?.name?.trim() || settings.headmasterName?.trim() || '( ........................................ )';
    const headNip = formatCleanNIP(headmaster?.nip || settings.headmasterNip);

    lines.push('""');
    lines.push('""');
    lines.push(`"","Mengetahui,","","","","","${city}, ${dateFormatted}"`);
    lines.push(`"","${waliTitle}","","","","","Mengetahui,"`);
    lines.push(`"","","","","","","Kepala Sekolah"`);
    lines.push('""');
    lines.push('""');
    lines.push(`"","${waliName}","","","","","${headName}"`);
    lines.push(`"","${waliNip}","","","","","${headNip}"`);
  }

  // Combine CSV content with BOM for Excel UTF-8 compatibility
  const csvContent = '\uFEFF' + lines.join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

export interface MonthlyRecapCSVExportOptions {
  recaps: Array<{
    nis: string;
    name: string;
    classRoom: string;
    gender: string;
    hadir: number;
    terlambat: number;
    sakit: number;
    izin: number;
    alpa: number;
    totalHadir: number;
    percentage: number;
  }>;
  monthLabel: string;
  selectedClass: string;
  settings: SystemSettings;
  homeroomTeacher?: {
    name?: string;
    nip?: string;
    classLabel?: string;
  };
  headmaster?: {
    name?: string;
    nip?: string;
  };
  signatureDate?: string;
  filename?: string;
}

/**
 * Export Monthly Student Attendance Summary (Per Siswa: Hadir, Terlambat, Sakit, Izin, Alfa) to CSV
 */
export const exportMonthlyRecapToCSV = ({
  recaps,
  monthLabel,
  selectedClass,
  settings,
  homeroomTeacher,
  headmaster,
  signatureDate,
  filename,
}: MonthlyRecapCSVExportOptions) => {
  if (!recaps || recaps.length === 0) {
    alert('Tidak ada data siswa untuk diekspor ke rekap bulanan.');
    return;
  }

  const lines: string[] = [];

  // Kop Header
  lines.push(`"${settings.schoolName.toUpperCase()}"`);
  lines.push(`"LAPORAN REKAPITULASI PRESENSI BULANAN SISWA"`);
  lines.push(`"Tahun Ajaran:","${settings.academicYear}"`);
  lines.push(`"Bulan:","${monthLabel}"`);
  lines.push(`"Kelas:","${selectedClass}"`);
  lines.push(`"Total Siswa:","${recaps.length} Siswa"`);
  lines.push('""');

  // Columns
  const headers = [
    'No',
    'NIS',
    'Nama Siswa',
    'Kelas',
    'L/P',
    'Hadir (Hari)',
    'Terlambat (Hari)',
    'Sakit (Hari)',
    'Izin (Hari)',
    'Alfa (Hari)',
    'Total Hadir (Hari)',
    'Persentase Kehadiran (%)',
  ];
  lines.push(headers.join(','));

  let totalHadir = 0;
  let totalTerlambat = 0;
  let totalSakit = 0;
  let totalIzin = 0;
  let totalAlpa = 0;
  let totalKehadiranSemua = 0;

  recaps.forEach((r, idx) => {
    totalHadir += r.hadir;
    totalTerlambat += r.terlambat;
    totalSakit += r.sakit;
    totalIzin += r.izin;
    totalAlpa += r.alpa;
    totalKehadiranSemua += r.totalHadir;

    const row = [
      idx + 1,
      `"${r.nis}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.classRoom}"`,
      `"${r.gender === 'Perempuan' ? 'P' : 'L'}"`,
      r.hadir,
      r.terlambat,
      r.sakit,
      r.izin,
      r.alpa,
      r.totalHadir,
      `"${r.percentage}%"`,
    ];
    lines.push(row.join(','));
  });

  // Summary Row
  lines.push(
    [
      '"TOTAL"',
      '""',
      '""',
      '""',
      '""',
      totalHadir,
      totalTerlambat,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalKehadiranSemua,
      '""',
    ].join(',')
  );

  // Signatures
  const now = new Date();
  const dateFormatted = signatureDate || now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const city = settings.schoolCity || 'Kota';
  const waliTitle = homeroomTeacher?.classLabel || (selectedClass !== 'Semua' ? `Wali Kelas ${selectedClass}` : 'Wali Kelas / Koordinator');
  const waliName = homeroomTeacher?.name?.trim() || '( ........................................ )';
  const waliNip = formatCleanNIP(homeroomTeacher?.nip);

  const headName = headmaster?.name?.trim() || settings.headmasterName?.trim() || '( ........................................ )';
  const headNip = formatCleanNIP(headmaster?.nip || settings.headmasterNip);

  lines.push('""');
  lines.push('""');
  lines.push(`"","Mengetahui,","","","","","${city}, ${dateFormatted}"`);
  lines.push(`"","${waliTitle}","","","","","Mengetahui,"`);
  lines.push(`"","","","","","","Kepala Sekolah"`);
  lines.push('""');
  lines.push('""');
  lines.push(`"","${waliName}","","","","","${headName}"`);
  lines.push(`"","${waliNip}","","","","","${headNip}"`);

  const safeSchool = settings.schoolName.replace(/[\s\/\\]+/g, '_');
  const safeMonth = monthLabel.replace(/[\s\/\\]+/g, '_');
  const safeClass = selectedClass.replace(/[\s\/\\]+/g, '_');
  const defaultFilename = `Rekap_Bulanan_${safeSchool}_${safeMonth}_Kelas_${safeClass}.csv`;

  const csvContent = '\uFEFF' + lines.join('\n');
  downloadFile(csvContent, filename || defaultFilename, 'text/csv;charset=utf-8;');
};

/**
 * Export student list to Excel-compatible CSV file
 */
export const exportStudentsToCSV = (
  students: Student[],
  filename = 'Data_Siswa_SD.csv',
  options?: {
    settings?: SystemSettings;
    selectedClass?: string;
    homeroomTeacher?: { name?: string; nip?: string; classLabel?: string };
    headmaster?: { name?: string; nip?: string };
  }
) => {
  if (!students || students.length === 0) {
    alert('Tidak ada data siswa untuk diekspor.');
    return;
  }

  const lines: string[] = [];

  if (options?.settings) {
    const s = options.settings;
    lines.push(`"${s.schoolName.toUpperCase()}"`);
    lines.push(`"BUKU INDUK / DATA SISWA - TAHUN AJARAN ${s.academicYear}"`);
    if (options.selectedClass) lines.push(`"Kelas:","${options.selectedClass}"`);
    lines.push(`"Total Siswa:","${students.length} Siswa"`);
    lines.push('""');
  }

  const headers = ['No', 'NIS', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin', 'No HP Orang Tua', 'Tanggal Daftar'];
  lines.push(headers.join(','));

  students.forEach((std, index) => {
    const row = [
      index + 1,
      `"${std.nis}"`,
      `"${std.name.replace(/"/g, '""')}"`,
      `"${std.classRoom}"`,
      `"${std.gender}"`,
      `"${std.parentPhone}"`,
      `"${std.createdAt || '-'}"`,
    ];
    lines.push(row.join(','));
  });

  if (options?.settings) {
    const s = options.settings;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const city = s.schoolCity || 'Kota';
    const waliTitle = options.homeroomTeacher?.classLabel || (options.selectedClass && options.selectedClass !== 'Semua' ? `Wali Kelas ${options.selectedClass}` : 'Wali Kelas / Koordinator');
    const waliName = options.homeroomTeacher?.name?.trim() || '( ........................................ )';
    const waliNip = formatCleanNIP(options.homeroomTeacher?.nip);
    const headName = options.headmaster?.name?.trim() || s.headmasterName?.trim() || '( ........................................ )';
    const headNip = formatCleanNIP(options.headmaster?.nip || s.headmasterNip);

    lines.push('""');
    lines.push('""');
    lines.push(`"","Mengetahui,","","","${city}, ${dateFormatted}"`);
    lines.push(`"","${waliTitle}","","","Mengetahui,"`);
    lines.push(`"","","","","Kepala Sekolah"`);
    lines.push('""');
    lines.push('""');
    lines.push(`"","${waliName}","","","${headName}"`);
    lines.push(`"","${waliNip}","","","${headNip}"`);
  }

  const csvContent = '\uFEFF' + lines.join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Export full application database to a JSON backup file
 */
export const exportFullBackupJSON = (
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  settings: SystemSettings,
  teachers: Teacher[]
) => {
  const backupData = {
    app: 'Aplikasi Absensi QR Code Siswa SD',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    students,
    attendanceRecords,
    settings,
    teachers,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonString, `Backup_Database_Absensi_SD_${dateStr}.json`, 'application/json');
};

/**
 * Download CSV Template for Bulk Student Import
 */
export const downloadStudentImportTemplateCSV = (className: string = '1-A') => {
  const headers = ['NIS', 'Nama', 'Kelas', 'Jenis Kelamin', 'No HP Orang Tua'];
  const sampleRows = [
    ['1001', 'Ahmad Fauzi', className, 'Laki-laki', '081234567890'],
    ['1002', 'Anisa Rahmawati', className, 'Perempuan', '081234567891'],
    ['1003', 'Budi Santoso', className, 'Laki-laki', '081234567892'],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
  downloadFile(csvContent, `Template_Import_Siswa_${className.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Parse uploaded CSV file content into Student array
 */
export const parseStudentImportCSV = (
  csvText: string,
  defaultClass: string,
  existingStudents: Student[]
): { students: Student[]; errors: string[]; addedCount: number } => {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    return { students: [], errors: ['File CSV kosong atau hanya berisi baris header.'], addedCount: 0 };
  }

  const MALE_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const FEMALE_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

  const newStudents: Student[] = [];
  const errors: string[] = [];
  const existingNisSet = new Set(existingStudents.map(s => s.nis.trim()));

  // Examine header row to determine column indices dynamically
  const headerCols = lines[0].split(/[,;\t]/).map(c => c.replace(/^["']|["']$/g, '').trim().toLowerCase());
  let nisIdx = headerCols.findIndex(c => c.includes('nis'));
  let nameIdx = headerCols.findIndex(c => c.includes('nama'));
  let classIdx = headerCols.findIndex(c => c.includes('kelas'));
  let genderIdx = headerCols.findIndex(c => c.includes('kelamin') || c.includes('gender') || c.includes('jk'));
  let phoneIdx = headerCols.findIndex(c => c.includes('hp') || c.includes('phone') || c.includes('ortu') || c.includes('telepon') || c.includes('wa'));

  // Fallbacks if header matching fails
  if (nisIdx === -1) nisIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  if (classIdx === -1) classIdx = 2;
  if (genderIdx === -1) genderIdx = 3;
  if (phoneIdx === -1) phoneIdx = 4;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine
      .split(/[,;\t]/)
      .map(col => col.replace(/^["']|["']$/g, '').trim());

    if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;

    const nis = cols[nisIdx] || '';
    const name = cols[nameIdx] || '';
    const classRoom = cols[classIdx] || defaultClass || 'Kelas 1';
    let gender = cols[genderIdx] || 'Laki-laki';
    const parentPhone = cols[phoneIdx] || '';

    if (!nis || !name) {
      errors.push(`Baris ${i + 1}: NIS dan Nama Wajib diisi (${rawLine}).`);
      continue;
    }

    if (existingNisSet.has(nis)) {
      errors.push(`Baris ${i + 1}: NIS "${nis}" sudah terdaftar di sistem, dilewati.`);
      continue;
    }

    const gLower = gender.toLowerCase();
    if (gLower.includes('p') || gLower.includes('female') || gLower.includes('wanita')) {
      gender = 'Perempuan';
    } else {
      gender = 'Laki-laki';
    }

    const uniqueId = `std-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`;

    const newStudent: Student = {
      id: uniqueId,
      nis: nis,
      name: name,
      classRoom: classRoom,
      gender: gender as 'Laki-laki' | 'Perempuan',
      parentPhone: parentPhone,
      avatarUrl: gender === 'Perempuan' ? FEMALE_AVATAR : MALE_AVATAR,
      createdAt: new Date().toISOString().split('T')[0],
    };

    existingNisSet.add(nis);
    newStudents.push(newStudent);
  }

  return {
    students: newStudents,
    errors,
    addedCount: newStudents.length,
  };
};

/**
 * Helper to trigger file download in browser
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

