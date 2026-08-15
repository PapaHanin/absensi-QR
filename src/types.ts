export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';

export type Gender = 'Laki-laki' | 'Perempuan';

export interface Student {
  id: string;
  nis: string;
  name: string;
  classRoom: string;
  gender: Gender;
  parentPhone: string;
  avatarUrl: string;
  photo?: string; // Base64 encoded string or image URL
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  classRoom: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  note?: string;
  scannedVia: 'QR Camera' | 'Manual Input' | 'Simulator';
}

export interface SystemSettings {
  lateCutoffTime: string; // e.g. "07:00"
  schoolName: string;
  schoolAddress: string;
  academicYear: string;
  headmasterName?: string; // e.g. "Drs. H. Mulyadi, M.Pd"
  headmasterNip?: string; // e.g. "19680512 199403 1 005"
  schoolCity?: string; // e.g. "Jakarta"
}

export interface QRPayload {
  app: string;
  nis: string;
  name: string;
  classRoom: string;
}

export type ActiveTab = 'dashboard' | 'scanner' | 'students' | 'simulator';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export type TeacherType = 'admin' | 'wali_kelas' | 'guru_mapel';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  nip?: string;
  subject: string; // e.g. "IPA", "Matematika", "Bahasa Indonesia", "Kurikulum & Administrasi"
  role: 'admin' | 'guru';
  teacherType: TeacherType;
  homeroomClass?: string; // e.g. "7-A", "7-B", "8-A", "8-B", "9-A", "9-B" (wajib diisi untuk wali_kelas)
}

