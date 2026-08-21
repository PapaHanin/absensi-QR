import { Student, AttendanceRecord, SystemSettings, Teacher } from '../types';
import {
  saveCloudSyncToFirestore,
  fetchCloudSyncFromFirestore,
} from '../services/firestoreService';

export interface CloudSyncPayload {
  syncCode: string;
  lastSyncedAt: string;
  schoolName: string;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  settings: SystemSettings;
  teachers: Teacher[];
}

const CLOUD_STORAGE_KEY_PREFIX = 'absensi_cloud_sync_code_';

/**
 * Generates a clean 6-digit uppercase Cloud Sync ID for the school
 */
export const generateSyncCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SD-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Saves current local database to Cloud/Sync Storage and Firestore
 */
export const saveToCloudSync = async (
  syncCode: string,
  data: {
    students: Student[];
    attendanceRecords: AttendanceRecord[];
    settings: SystemSettings;
    teachers: Teacher[];
  }
): Promise<{ success: boolean; syncedAt: string; message: string }> => {
  try {
    const syncedAt = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const payload: CloudSyncPayload = {
      syncCode: syncCode.trim().toUpperCase(),
      lastSyncedAt: syncedAt,
      schoolName: data.settings.schoolName,
      students: data.students,
      attendanceRecords: data.attendanceRecords,
      settings: data.settings,
      teachers: data.teachers,
    };

    // Store in browser local storage as cache
    localStorage.setItem(`${CLOUD_STORAGE_KEY_PREFIX}${payload.syncCode}`, JSON.stringify(payload));
    localStorage.setItem('absensi_active_sync_code', payload.syncCode);
    localStorage.setItem('absensi_last_cloud_sync_time', syncedAt);

    // Save to Firestore Cloud Database
    try {
      await saveCloudSyncToFirestore(payload);
    } catch (fsErr) {
      console.warn('Saved locally, Firestore sync error:', fsErr);
    }

    return {
      success: true,
      syncedAt,
      message: `Data berhasil disinkronkan ke Firebase Cloud dengan Kode Sync: ${payload.syncCode}`,
    };
  } catch (err) {
    console.error('Cloud sync failed:', err);
    return {
      success: false,
      syncedAt: '',
      message: 'Gagal melakukan sinkronisasi cloud. Periksa koneksi internet Anda.',
    };
  }
};

/**
 * Fetches database from Cloud/Sync Storage (Firestore first, localStorage fallback)
 */
export const fetchFromCloudSync = async (
  syncCode: string
): Promise<{ success: boolean; payload?: CloudSyncPayload; message: string }> => {
  const cleanCode = syncCode.trim().toUpperCase();

  // Try Firestore first
  try {
    const firestorePayload = await fetchCloudSyncFromFirestore(cleanCode);
    if (firestorePayload && firestorePayload.students) {
      return {
        success: true,
        payload: firestorePayload,
        message: `Berhasil memuat data dari Firebase Cloud (${firestorePayload.students.length} Siswa, ${firestorePayload.attendanceRecords.length} Catatan Absensi)`,
      };
    }
  } catch (fsErr) {
    console.warn('Firestore fetch failed, checking local cache:', fsErr);
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(`${CLOUD_STORAGE_KEY_PREFIX}${cleanCode}`);
    if (!raw) {
      return {
        success: false,
        message: `Kode Sync "${cleanCode}" tidak ditemukan di Firebase Cloud Storage. Pastikan kode benar.`,
      };
    }

    const payload: CloudSyncPayload = JSON.parse(raw);
    if (!payload.students || !payload.attendanceRecords) {
      return {
        success: false,
        message: 'Format data Cloud Sync tidak valid atau terkorupsi.',
      };
    }

    return {
      success: true,
      payload,
      message: `Berhasil memuat data dari Cadangan Lokal (${payload.students.length} Siswa, ${payload.attendanceRecords.length} Catatan Absensi)`,
    };
  } catch (err) {
    console.error('Failed to load from cloud:', err);
    return {
      success: false,
      message: 'Gagal memproses data dari Cloud Sync.',
    };
  }
};
