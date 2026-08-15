import { Student, AttendanceRecord, AttendanceStatus, SystemSettings, Teacher } from '../types';
import { MALE_BW_AVATAR, FEMALE_BW_AVATAR } from '../utils/avatars';

export const DEFAULT_SETTINGS: SystemSettings = {
  lateCutoffTime: '07:00',
  schoolName: 'SD NEGERI 1 INDONESIA',
  schoolAddress: 'Jl. Pendidikan No. 45, Jakarta Selatan',
  academicYear: '2025/2026',
  headmasterName: 'Drs. H. Mulyadi, M.Pd',
  headmasterNip: '19680512 199403 1 005',
  schoolCity: 'Jakarta Selatan',
};

export const SD_CLASSES = [
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
  '1-A',
  '1-B',
  '2-A',
  '2-B',
  '3-A',
  '3-B',
  '4-A',
  '4-B',
  '5-A',
  '5-B',
  '6-A',
  '6-B',
];

// Alias for backwards compatibility
export const SMP_CLASSES = SD_CLASSES;

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-admin',
    name: 'MOH. FADLI',
    nip: '199903202025211020',
    email: 'Fadli46046@gmail.com',
    subject: 'Administrator Sekolah',
    role: 'admin',
    teacherType: 'admin',
  },
];

export const INITIAL_STUDENTS: Student[] = [];

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateInitialAttendance = (_todayStr: string): AttendanceRecord[] => {
  return [];
};

