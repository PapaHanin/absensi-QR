import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, iihhBeresDb, IIHH_BERES_DATABASE_ID, handleFirestoreError, OperationType } from '../firebase';
import { Student, AttendanceRecord, SystemSettings, Teacher, ScheduledLeave, BehaviorLog, ERaporRecapDoc } from '../types';
import { CloudSyncPayload } from '../utils/cloudSync';

/**
 * Sanitizes an object by converting undefined values to null or stripping them,
 * preventing Firestore "Unsupported field value: undefined" errors.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (!obj) return obj;
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

// Collection Names
export const COLLECTIONS = {
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  TEACHERS: 'teachers',
  SETTINGS: 'settings',
  CLOUD_SYNC: 'cloud_sync',
  LEAVES: 'leaves',
  BEHAVIOR_LOGS: 'behavior_logs',
  REKAP_ABSENSI_OGOMOJOLO: 'rekap_absensi_ogomojolo',
};

/**
 * Subscribes to real-time updates for Students
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: any) => void
) {
  const path = COLLECTIONS.STUDENTS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Student[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Student);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves or updates a single student in Firestore
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${student.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), sanitizeForFirestore(student));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a single student from Firestore
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${studentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Bulk deletes multiple students from Firestore in a batch
 */
export async function bulkDeleteStudentsFromFirestore(studentIds: string[]): Promise<void> {
  const path = COLLECTIONS.STUDENTS;
  try {
    const batch = writeBatch(db);
    studentIds.forEach((id) => {
      batch.delete(doc(db, COLLECTIONS.STUDENTS, id));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Bulk saves or overwrites students in Firestore in safe chunks (max 450 items per Firestore batch)
 */
export async function syncAllStudentsToFirestore(students: Student[]): Promise<void> {
  const path = COLLECTIONS.STUDENTS;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((std) => {
        const ref = doc(db, COLLECTIONS.STUDENTS, std.id);
        batch.set(ref, sanitizeForFirestore(std));
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Bulk saves attendance records in safe chunks (max 400 per batch)
 */
export async function syncAllAttendanceToFirestore(records: AttendanceRecord[]): Promise<void> {
  const path = COLLECTIONS.ATTENDANCE;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((att) => {
        const ref = doc(db, COLLECTIONS.ATTENDANCE, att.id);
        batch.set(ref, sanitizeForFirestore(att));
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Bulk saves teachers in a single batch
 */
export async function syncAllTeachersToFirestore(teachers: Teacher[]): Promise<void> {
  const path = COLLECTIONS.TEACHERS;
  try {
    const batch = writeBatch(db);
    teachers.forEach((t) => {
      const ref = doc(db, COLLECTIONS.TEACHERS, t.id);
      batch.set(ref, sanitizeForFirestore(t));
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to real-time updates for Attendance Records
 */
export function subscribeToAttendance(
  onUpdate: (records: AttendanceRecord[]) => void,
  onError?: (err: any) => void
) {
  const path = COLLECTIONS.ATTENDANCE;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AttendanceRecord);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a single attendance record
 */
export async function saveAttendanceToFirestore(record: AttendanceRecord): Promise<void> {
  const path = `${COLLECTIONS.ATTENDANCE}/${record.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), sanitizeForFirestore(record));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a single attendance record
 */
export async function deleteAttendanceFromFirestore(recordId: string): Promise<void> {
  const path = `${COLLECTIONS.ATTENDANCE}/${recordId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.ATTENDANCE, recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time updates for Teachers
 */
export function subscribeToTeachers(
  onUpdate: (teachers: Teacher[]) => void,
  onError?: (err: any) => void
) {
  const path = COLLECTIONS.TEACHERS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Teacher[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Teacher);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a teacher to Firestore
 */
export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacher.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), sanitizeForFirestore(teacher));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a teacher from Firestore
 */
export async function deleteTeacherFromFirestore(teacherId: string): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacherId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TEACHERS, teacherId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to System Settings
 */
export function subscribeToSettings(
  onUpdate: (settings: SystemSettings) => void,
  onError?: (err: any) => void
) {
  const path = `${COLLECTIONS.SETTINGS}/school`;
  return onSnapshot(
    doc(db, COLLECTIONS.SETTINGS, 'school'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as SystemSettings);
      }
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves System Settings to Firestore
 */
export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  const path = `${COLLECTIONS.SETTINGS}/school`;
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'school'), sanitizeForFirestore(settings));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Cloud Sync Snapshots to Firestore
 */
export async function saveCloudSyncToFirestore(payload: CloudSyncPayload): Promise<void> {
  const cleanCode = payload.syncCode.trim().toUpperCase();
  const path = `${COLLECTIONS.CLOUD_SYNC}/${cleanCode}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CLOUD_SYNC, cleanCode), sanitizeForFirestore(payload));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches a Cloud Sync Snapshot from Firestore
 */
export async function fetchCloudSyncFromFirestore(syncCode: string): Promise<CloudSyncPayload | null> {
  const cleanCode = syncCode.trim().toUpperCase();
  const path = `${COLLECTIONS.CLOUD_SYNC}/${cleanCode}`;
  try {
    // Direct document fetch first
    const docSnap = await getDoc(doc(db, COLLECTIONS.CLOUD_SYNC, cleanCode));
    if (docSnap.exists()) {
      return docSnap.data() as CloudSyncPayload;
    }

    // Fallback search across collection
    const snapshot = await getDocs(collection(db, COLLECTIONS.CLOUD_SYNC));
    let found: CloudSyncPayload | null = null;
    snapshot.forEach((d) => {
      if (d.id === cleanCode || (d.data() as CloudSyncPayload).syncCode === cleanCode) {
        found = d.data() as CloudSyncPayload;
      }
    });
    return found;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Subscribes to real-time updates for Scheduled Leaves
 */
export function subscribeToLeaves(
  onUpdate: (leaves: ScheduledLeave[]) => void,
  onError?: (err: any) => void
) {
  const path = COLLECTIONS.LEAVES;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ScheduledLeave[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ScheduledLeave);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a scheduled leave to Firestore
 */
export async function saveLeaveToFirestore(leave: ScheduledLeave): Promise<void> {
  const path = `${COLLECTIONS.LEAVES}/${leave.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.LEAVES, leave.id), sanitizeForFirestore(leave));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a scheduled leave from Firestore
 */
export async function deleteLeaveFromFirestore(leaveId: string): Promise<void> {
  const path = `${COLLECTIONS.LEAVES}/${leaveId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEAVES, leaveId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to real-time updates for Student Behavior Logs
 */
export function subscribeToBehaviorLogs(
  onUpdate: (logs: BehaviorLog[]) => void,
  onError?: (err: any) => void
) {
  const path = COLLECTIONS.BEHAVIOR_LOGS;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: BehaviorLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as BehaviorLog);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice (${path}):`, error?.message || error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a behavior log to Firestore
 */
export async function saveBehaviorLogToFirestore(log: BehaviorLog): Promise<void> {
  const path = `${COLLECTIONS.BEHAVIOR_LOGS}/${log.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.BEHAVIOR_LOGS, log.id), sanitizeForFirestore(log));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a behavior log from Firestore
 */
export async function deleteBehaviorLogFromFirestore(logId: string): Promise<void> {
  const path = `${COLLECTIONS.BEHAVIOR_LOGS}/${logId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BEHAVIOR_LOGS, logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seeds initial database data if Firestore is currently completely empty
 */
export async function seedInitialFirestoreDataIfEmpty(
  initialStudents: Student[],
  initialTeachers: Teacher[],
  defaultSettings: SystemSettings,
  initialAttendance: AttendanceRecord[]
): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty) {
      console.log('Seeding initial students to Firestore...');
      const batch = writeBatch(db);
      initialStudents.forEach((std) => {
        batch.set(doc(db, COLLECTIONS.STUDENTS, std.id), std);
      });
      initialTeachers.forEach((tch) => {
        batch.set(doc(db, COLLECTIONS.TEACHERS, tch.id), tch);
      });
      batch.set(doc(db, COLLECTIONS.SETTINGS, 'school'), defaultSettings);
      initialAttendance.forEach((att) => {
        batch.set(doc(db, COLLECTIONS.ATTENDANCE, att.id), att);
      });
      await batch.commit();
      console.log('Initial Firestore database seeded successfully!');
    }
  } catch (error) {
    console.warn('Could not check or seed Firestore (running in offline/local fallback mode):', error);
  }
}

/**
 * Generates an idempotent, valid document ID for rekap_absensi_ogomojolo using student's NISN.
 * As requested: "simpan dokumen ke koleksi 'rekap_absensi_ogomojolo' dengan ID dokumen = NISN siswa"
 */
export function generateERaporDocId(nisn: string, semester?: number, tahunAjaran?: string): string {
  const cleanNisn = (nisn || '').trim();
  if (cleanNisn) {
    return cleanNisn;
  }
  // Fallback only if student has no NISN filled yet
  const cleanTahun = (tahunAjaran || 'default').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  return `no_nisn_sem${semester || 1}_${cleanTahun}`;
}

/**
 * Builds the exact document payload requested for e-Rapor Merdeka (iihh Beres):
 * {
 *   nisn: "0012345678",
 *   namaSiswa: "Nama Siswa",
 *   kelas: "Kelas 4",
 *   semester: 1,
 *   tahunAjaran: "2024/2025",
 *   sakit: 2,
 *   izin: 1,
 *   tanpaKeterangan: 0,
 *   kehadiran: { sakit: 2, izin: 1, tanpaKeterangan: 0 },
 *   updatedAt: ISO_STRING
 * }
 */
export function buildERaporPayload(recap: ERaporRecapDoc) {
  const sakit = Number(recap.sakit ?? recap.kehadiran?.sakit) || 0;
  const izin = Number(recap.izin ?? recap.kehadiran?.izin) || 0;
  const tanpaKeterangan = Number(recap.tanpaKeterangan ?? recap.kehadiran?.tanpaKeterangan) || 0;

  return sanitizeForFirestore({
    nisn: String(recap.nisn || '').trim(),
    namaSiswa: recap.namaSiswa,
    kelas: recap.kelas,
    semester: Number(recap.semester) || 1,
    tahunAjaran: recap.tahunAjaran,
    sakit,
    izin,
    tanpaKeterangan,
    kehadiran: {
      sakit,
      izin,
      tanpaKeterangan,
    },
    updatedAt: recap.updatedAt || new Date().toISOString(),
  });
}

/**
 * Saves a single e-Rapor recap document to Firestore collection `rekap_absensi_ogomojolo`
 * Target database: ai-studio-iihhberes-db02674d-a027-43d4-b17e-50573c47075a (and local backup)
 */
export async function saveERaporRecapToFirestore(recap: ERaporRecapDoc): Promise<void> {
  const docId = generateERaporDocId(recap.nisn, recap.semester, recap.tahunAjaran);
  const path = `${COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO}/${docId}`;
  const payload = buildERaporPayload(recap);

  try {
    // Write directly to target e-Rapor database (iihh Beres)
    await setDoc(doc(iihhBeresDb, COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO, docId), payload);

    // Also write to local app database as backup
    try {
      await setDoc(doc(db, COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO, docId), payload);
    } catch {
      // Local backup failure is non-fatal
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Bulk uploads student attendance recaps to Firestore collection `rekap_absensi_ogomojolo`
 * Writes to the target database `ai-studio-iihhberes-db02674d-a027-43d4-b17e-50573c47075a`
 * with ID dokumen = NISN siswa.
 * Also keeps a backup in the current app database.
 */
export async function batchSyncERaporRecapsToFirestore(
  recaps: ERaporRecapDoc[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number; destinationDb: string }> {
  if (recaps.length === 0) return { success: true, count: 0, destinationDb: IIHH_BERES_DATABASE_ID };
  const path = COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO;
  try {
    const CHUNK_SIZE = 400;
    let completedCount = 0;
    for (let i = 0; i < recaps.length; i += CHUNK_SIZE) {
      const chunk = recaps.slice(i, i + CHUNK_SIZE);
      
      // Batch for target e-Rapor database (iihh Beres)
      const targetBatch = writeBatch(iihhBeresDb);
      // Batch for local app database backup
      const localBatch = writeBatch(db);

      for (const recap of chunk) {
        const docId = generateERaporDocId(recap.nisn, recap.semester, recap.tahunAjaran);
        const payload = buildERaporPayload(recap);

        const targetRef = doc(iihhBeresDb, COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO, docId);
        targetBatch.set(targetRef, payload);

        const localRef = doc(db, COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO, docId);
        localBatch.set(localRef, payload);
      }

      // Commit to target database
      await targetBatch.commit();

      // Commit backup to local database silently
      try {
        await localBatch.commit();
      } catch (backupErr) {
        console.warn('Local database backup commit note:', backupErr);
      }

      completedCount += chunk.length;
      if (onProgress) {
        onProgress(completedCount, recaps.length);
      }
    }
    return { success: true, count: completedCount, destinationDb: IIHH_BERES_DATABASE_ID };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches all student recap records currently in `rekap_absensi_ogomojolo`
 * Checks the target e-Rapor database first, falling back to local database.
 */
export async function fetchERaporRecapsFromFirestore(): Promise<ERaporRecapDoc[]> {
  const path = COLLECTIONS.REKAP_ABSENSI_OGOMOJOLO;
  try {
    let snap;
    try {
      snap = await getDocs(collection(iihhBeresDb, path));
    } catch {
      snap = await getDocs(collection(db, path));
    }
    const list: ERaporRecapDoc[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as ERaporRecapDoc);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

