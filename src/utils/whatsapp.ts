import { Student, AttendanceRecord } from '../types';

/**
 * Formats Indonesian phone number into WhatsApp international format (628xxx)
 */
export const formatPhoneNumberForWA = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, ''); // Keep only digits

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

/**
 * Generates polite WhatsApp notification message for parents
 */
export const generateWAAttendanceMessage = (
  student: Student,
  record: AttendanceRecord,
  schoolName: string
): string => {
  const statusEmoji =
    record.status === 'Hadir'
      ? '✅'
      : record.status === 'Terlambat'
      ? '⏰'
      : record.status === 'Izin' || record.status === 'Sakit'
      ? 'ℹ️'
      : '⚠️';

  return `Yth. Bapak/Ibu Orang Tua/Wali dari *${student.name}* (Kelas ${student.classRoom}),

Memberitahukan bahwa putra/putri Anda telah terdata pada sistem absensi digital *${schoolName}*:

${statusEmoji} *Status*: ${record.status.toUpperCase()}
📅 *Tanggal*: ${record.date}
⏰ *Jam Masuk*: ${record.time} WIB
📌 *NIS*: ${student.nis}
📝 *Keterangan*: ${record.note || 'Tercatat otomatis'}

Terima kasih atas perhatian dan kerja samanya.
_Sistem Absensi Digital ${schoolName}_`;
};

/**
 * Opens WhatsApp Web/App directly with the pre-filled text
 */
export const openWhatsAppNotification = (
  student: Student,
  record: AttendanceRecord,
  schoolName: string
): boolean => {
  const formattedPhone = formatPhoneNumberForWA(student.parentPhone);
  if (!formattedPhone) {
    alert(`Nomor HP Orang Tua untuk ${student.name} belum diisi.`);
    return false;
  }

  const message = generateWAAttendanceMessage(student, record, schoolName);
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};

/**
 * Copies WhatsApp message to user's clipboard
 */
export const copyWAMessageToClipboard = async (
  student: Student,
  record: AttendanceRecord,
  schoolName: string
): Promise<boolean> => {
  try {
    const message = generateWAAttendanceMessage(student, record, schoolName);
    await navigator.clipboard.writeText(message);
    return true;
  } catch (err) {
    console.error('Failed to copy WA message:', err);
    return false;
  }
};
