import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, SystemSettings } from '../types';

interface PDFReportOptions {
  records: AttendanceRecord[];
  dateRangeLabel: string;
  selectedClass: string;
  settings: SystemSettings;
  stats: {
    totalStudents: number;
    hadir: number;
    terlambat: number;
    izinSakit: number;
    alpa: number;
  };
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

export const generateAttendancePDFReport = ({
  records,
  dateRangeLabel,
  selectedClass,
  settings,
  stats,
  homeroomTeacher,
  headmaster,
  signatureDate,
}: PDFReportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Kop Surat
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.schoolName.toUpperCase(), pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `LAPORAN REKAPITULASI PRESENSI SISWA - TAHUN AJARAN ${settings.academicYear}`,
    pageWidth / 2,
    16,
    { align: 'center' }
  );

  // Metadata Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  let startY = 32;
  doc.text(`Periode Laporan: ${dateRangeLabel}`, 14, startY);
  doc.text(`Kelas Filter: ${selectedClass}`, 14, startY + 5);
  doc.text(`Jam Batas Masuk: ${settings.lateCutoffTime} WIB`, 14, startY + 10);

  // Stats Box on the right
  const rightX = pageWidth - 14;
  doc.setFontSize(9);
  doc.text(
    `Hadir: ${stats.hadir} | Terlambat: ${stats.terlambat} | Izin/Sakit: ${stats.izinSakit} | Alpa: ${stats.alpa}`,
    rightX,
    startY,
    { align: 'right' }
  );
  doc.text(
    `Total Entri Terdata: ${records.length} Record`,
    rightX,
    startY + 5,
    { align: 'right' }
  );

  // Divider Line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, startY + 14, pageWidth - 14, startY + 14);

  // Determine if multi-day report
  const uniqueDates = new Set(records.map((r) => r.date));
  const isMultiDay = uniqueDates.size > 1;

  // Table Columns & Rows
  let tableHeaders: string[][];
  let tableRows: (string | number)[][];

  if (isMultiDay) {
    tableHeaders = [['No', 'Tgl', 'Jam', 'NIS', 'Nama Siswa', 'Kelas', 'Status', 'Metode', 'Keterangan']];
    tableRows = records.map((rec, index) => [
      index + 1,
      rec.date,
      rec.time,
      rec.nis,
      rec.studentName,
      rec.classRoom,
      rec.status,
      rec.scannedVia,
      rec.note || '-',
    ]);
  } else {
    tableHeaders = [['No', 'Jam', 'NIS', 'Nama Siswa', 'Kelas', 'Status', 'Metode', 'Keterangan']];
    tableRows = records.map((rec, index) => [
      index + 1,
      rec.time,
      rec.nis,
      rec.studentName,
      rec.classRoom,
      rec.status,
      rec.scannedVia,
      rec.note || '-',
    ]);
  }

  autoTable(doc, {
    startY: startY + 18,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: isMultiDay
      ? {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 42 },
          5: { cellWidth: 14, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 'auto' },
        }
      : {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 50 },
          4: { cellWidth: 16, halign: 'center' },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 22, halign: 'center' },
          7: { cellWidth: 'auto' },
        },
    didParseCell: function (data) {
      // Highlight Status column
      const statusColIndex = isMultiDay ? 6 : 5;
      if (data.section === 'body' && data.column.index === statusColIndex) {
        const val = String(data.cell.raw);
        if (val === 'Hadir') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Terlambat') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Alpa') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [79, 70, 229]; // Indigo
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Tanda Tangan / Signature Block at the end
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 120;

  // Check remaining page space for signatures (needs at least 45mm)
  let sigY = finalY + 12;
  if (sigY + 45 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    sigY = 22;
  }

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  // Date and location label (Right side above Kepala Sekolah)
  const now = new Date();
  const dateFormatted = signatureDate || now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const city = settings.schoolCity || 'Kota';
  const locationDateStr = `${city}, ${dateFormatted}`;

  // Left column: Wali Kelas masing-masing
  const leftX = 20;
  const waliTitle =
    homeroomTeacher?.classLabel ||
    (selectedClass !== 'Semua' ? `Wali Kelas ${selectedClass}` : 'Wali Kelas');
  const waliName = homeroomTeacher?.name?.trim() || '( ........................................ )';
  const waliNip = homeroomTeacher?.nip?.trim()
    ? `NIP. ${homeroomTeacher.nip}`
    : 'NIP. ............................';

  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', leftX, sigY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(waliTitle, leftX, sigY + 10);

  // Underlined Wali Kelas Name & NIP
  doc.setFont('helvetica', 'bold');
  doc.text(waliName, leftX, sigY + 34);
  const waliTextWidth = Math.max(doc.getTextWidth(waliName), 50);
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);
  doc.line(leftX, sigY + 35, leftX + waliTextWidth, sigY + 35);

  doc.setFont('helvetica', 'normal');
  doc.text(waliNip, leftX, sigY + 40);

  // Right column: Kepala Sekolah
  const sigRightX = pageWidth - 80;
  const headName =
    headmaster?.name?.trim() || settings.headmasterName?.trim() || '( ........................................ )';
  const headNip =
    headmaster?.nip?.trim() || settings.headmasterNip?.trim()
      ? `NIP. ${headmaster?.nip || settings.headmasterNip}`
      : 'NIP. ............................';

  doc.setFont('helvetica', 'normal');
  doc.text(locationDateStr, sigRightX, sigY);
  doc.text('Mengetahui,', sigRightX, sigY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('Kepala Sekolah', sigRightX, sigY + 10);

  // Underlined Headmaster Name & NIP
  doc.setFont('helvetica', 'bold');
  doc.text(headName, sigRightX, sigY + 34);
  const headTextWidth = Math.max(doc.getTextWidth(headName), 50);
  doc.line(sigRightX, sigY + 35, sigRightX + headTextWidth, sigY + 35);

  doc.setFont('helvetica', 'normal');
  doc.text(headNip, sigRightX, sigY + 40);

  // Save the PDF
  const safeSchool = settings.schoolName.replace(/\s+/g, '_');
  const safeRange = dateRangeLabel.replace(/[\s\/\\]+/g, '_');
  const filename = `Laporan_Presensi_${safeSchool}_${safeRange}_Kelas_${selectedClass}.pdf`;
  doc.save(filename);
};
