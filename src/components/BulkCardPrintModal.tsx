import React, { useState, useEffect, useMemo } from 'react';
import { Student, SystemSettings, Teacher } from '../types';
import { createStudentQRPayload, generateQRCodeDataURL } from '../utils/qr';
import { isHomeroomClassMatch } from '../utils/classUtils';
import jsPDF from 'jspdf';

interface BulkCardPrintModalProps {
  students: Student[];
  settings: SystemSettings;
  currentTeacher: Teacher | null;
  initialClass?: string;
  initialSelectedIds?: string[];
  initialLayout?: CardLayoutMode;
  onClose: () => void;
}

export type CardLayoutMode = '8_per_page' | '4_per_page' | '6_per_page' | '1_per_page';

export const BulkCardPrintModal: React.FC<BulkCardPrintModalProps> = ({
  students,
  settings,
  currentTeacher,
  initialClass = 'Semua',
  initialSelectedIds,
  initialLayout = '8_per_page',
  onClose,
}) => {
  const isAdmin = currentTeacher?.role === 'admin' || currentTeacher?.teacherType === 'admin';
  const isWaliKelas = !isAdmin && (currentTeacher?.teacherType === 'wali_kelas' || Boolean(currentTeacher?.homeroomClass));
  const myHomeroom = currentTeacher?.homeroomClass;

  // Determine active class filter:
  // If Wali Kelas, strictly lock to their homeroom class
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isWaliKelas && myHomeroom) {
      return myHomeroom;
    }
    return initialClass !== 'Semua' ? initialClass : 'Semua';
  });

  const [layoutMode, setLayoutMode] = useState<CardLayoutMode>(initialLayout);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      return new Set(initialSelectedIds);
    }
    return new Set();
  });
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Available classes derived from students
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach((s) => {
      if (s.classRoom) classSet.add(s.classRoom);
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [students]);

  // Filter students based on class selection and role
  const classFilteredStudents = useMemo(() => {
    let list = students;
    if (isWaliKelas && myHomeroom) {
      list = list.filter((s) => isHomeroomClassMatch(s.classRoom, myHomeroom));
    } else if (selectedClass !== 'Semua') {
      list = list.filter((s) => isHomeroomClassMatch(s.classRoom, selectedClass) || s.classRoom === selectedClass);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      const clsCompare = (a.classRoom || '').localeCompare(b.classRoom || '', undefined, { numeric: true });
      if (clsCompare !== 0) return clsCompare;
      return a.name.localeCompare(b.name);
    });
  }, [students, isWaliKelas, myHomeroom, selectedClass, searchQuery]);

  // Initialize selected student IDs if not passed via props
  useEffect(() => {
    if (!initialSelectedIds || initialSelectedIds.length === 0) {
      setSelectedStudentIds(new Set(classFilteredStudents.map((s) => s.id)));
    }
  }, [classFilteredStudents, initialSelectedIds]);

  // Generate QR Code Data URLs for all students in the list
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQR(true);

    const generateAll = async () => {
      const map: Record<string, string> = {};
      for (const student of classFilteredStudents) {
        try {
          const payload = createStudentQRPayload(student);
          const dataUrl = await generateQRCodeDataURL(payload);
          map[student.id] = dataUrl;
        } catch (e) {
          console.error('Error generating QR for student:', student.name, e);
        }
      }
      if (isMounted) {
        setQrMap(map);
        setIsGeneratingQR(false);
      }
    };

    if (classFilteredStudents.length > 0) {
      generateAll();
    } else {
      setIsGeneratingQR(false);
    }

    return () => {
      isMounted = false;
    };
  }, [classFilteredStudents]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedStudentIds(new Set(classFilteredStudents.map((s) => s.id)));
  };

  const deselectAll = () => {
    setSelectedStudentIds(new Set());
  };

  const printableStudents = useMemo(() => {
    return classFilteredStudents.filter((s) => selectedStudentIds.has(s.id));
  }, [classFilteredStudents, selectedStudentIds]);

  // Handle direct browser print
  const handlePrint = () => {
    window.print();
  };

  // Generate downloadable PDF formatted for standard A4 sheets with high resolution
  const handleExportPDF = async () => {
    if (printableStudents.length === 0) return;
    setIsExportingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      if (layoutMode === '8_per_page') {
        // 2 columns x 4 rows = 8 cards per A4 page (Ukuran Kartu 2x4 Presisi)
        const cardsPerPage = 8;
        const cardWidth = (contentWidth - 6) / 2; // ~94mm
        const cardHeight = (contentHeight - 15) / 4; // ~66.5mm

        for (let i = 0; i < printableStudents.length; i++) {
          const student = printableStudents[i];
          const slotIndex = i % cardsPerPage;

          if (i > 0 && slotIndex === 0) {
            doc.addPage();
          }

          const col = slotIndex % 2;
          const row = Math.floor(slotIndex / 2);
          const x = margin + col * (cardWidth + 6);
          const y = margin + row * (cardHeight + 5);

          // Card Outer Border
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.6);
          doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

          // Header (Height 12mm)
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(x, y, cardWidth, 12, 2, 2, 'F');
          doc.rect(x, y + 8, cardWidth, 4, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text(settings.schoolName.toUpperCase(), x + cardWidth / 2, y + 5, { align: 'center', maxWidth: cardWidth - 4 });

          doc.setFontSize(5);
          doc.setFont('helvetica', 'normal');
          doc.text('KARTU PRESENSI QR RESMI PELAJAR', x + cardWidth / 2, y + 9.5, { align: 'center' });

          // Left side: Student details (width ~54mm)
          const leftWidth = 52;
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text(student.name, x + 3.5, y + 17.5, { maxWidth: leftWidth });

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`NIS: ${student.nis}`, x + 3.5, y + 23.5);
          doc.text(`Kelas: ${student.classRoom}  |  ${student.gender}`, x + 3.5, y + 28);
          if (student.parentPhone) {
            doc.text(`WA: ${student.parentPhone}`, x + 3.5, y + 32.5);
          }

          // Small Scan Instruction pill at bottom left
          doc.setFillColor(238, 242, 255);
          doc.roundedRect(x + 3.5, y + cardHeight - 7, leftWidth, 4.5, 1, 1, 'F');
          doc.setFontSize(5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(67, 56, 202);
          doc.text('Tunjukkan QR saat presensi', x + 3.5 + leftWidth / 2, y + cardHeight - 4, { align: 'center' });

          // Right side: High Contrast QR Code (32mm x 32mm)
          const qrSize = 32;
          const qrX = x + cardWidth - qrSize - 3.5;
          const qrY = y + 14.5;

          // QR Border / box
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.3);
          doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, 'FD');

          const qrUrl = qrMap[student.id];
          if (qrUrl) {
            doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          }

          // Bottom label for QR
          doc.setFontSize(4.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text('SCAN QR DI SINI', qrX + qrSize / 2, qrY + qrSize + 3.5, { align: 'center' });
        }
      } else if (layoutMode === '4_per_page') {
        // 2 columns x 2 rows = 4 cards per A4 page
        const cardsPerPage = 4;
        const cardWidth = (contentWidth - 8) / 2; // ~91mm
        const cardHeight = (contentHeight - 8) / 2; // ~134mm

        for (let i = 0; i < printableStudents.length; i++) {
          const student = printableStudents[i];
          const pageIndex = Math.floor(i / cardsPerPage);
          const slotIndex = i % cardsPerPage;

          if (i > 0 && slotIndex === 0) {
            doc.addPage();
          }

          const col = slotIndex % 2;
          const row = Math.floor(slotIndex / 2);
          const x = margin + col * (cardWidth + 8);
          const y = margin + row * (cardHeight + 8);

          // Card Outer Border with subtle rounded corner effect
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(79, 70, 229); // Indigo-600
          doc.setLineWidth(0.8);
          doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

          // Card Header
          doc.setFillColor(30, 41, 59); // Slate-800
          doc.roundedRect(x, y, cardWidth, 22, 3, 3, 'F');
          // Fix bottom corners of header
          doc.rect(x, y + 18, cardWidth, 4, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(settings.schoolName.toUpperCase(), x + cardWidth / 2, y + 7, { align: 'center' });

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.text(settings.schoolAddress || 'KARTU TANDA PELAJAR DIGITAL', x + cardWidth / 2, y + 12, { align: 'center' });

          doc.setFillColor(79, 70, 229);
          doc.roundedRect(x + cardWidth / 2 - 25, y + 15, 50, 5, 1, 1, 'F');
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text('KARTU PRESENSI QR RESMI', x + cardWidth / 2, y + 18.5, { align: 'center' });

          // Student Details Block
          let curY = y + 26;
          doc.setTextColor(15, 23, 42); // slate-900
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(student.name, x + cardWidth / 2, curY, { align: 'center' });

          curY += 5;
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105); // slate-600
          doc.text(`NIS: ${student.nis}  |  Kelas: ${student.classRoom}  |  ${student.gender}`, x + cardWidth / 2, curY, { align: 'center' });

          if (student.parentPhone) {
            curY += 4;
            doc.setFontSize(6.5);
            doc.text(`No. WA Ortu: ${student.parentPhone}`, x + cardWidth / 2, curY, { align: 'center' });
          }

          // Large High-Contrast QR Code Block (60mm x 60mm)
          const qrSize = 58;
          const qrX = x + (cardWidth - qrSize) / 2;
          const qrY = curY + 4;

          // QR container box
          doc.setFillColor(248, 250, 252); // Slate-50
          doc.setDrawColor(203, 213, 225); // Slate-300
          doc.setLineWidth(0.4);
          doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'FD');

          const qrUrl = qrMap[student.id];
          if (qrUrl) {
            doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          }

          // Bottom Instruction Pill
          const footerY = y + cardHeight - 8;
          doc.setFillColor(238, 242, 255); // Indigo-50
          doc.setDrawColor(199, 210, 254); // Indigo-200
          doc.roundedRect(x + 5, footerY - 4, cardWidth - 10, 8, 2, 2, 'FD');

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(67, 56, 202); // Indigo-700
          doc.text('Arahkan QR ke Kamera Presensi Sekolah', x + cardWidth / 2, footerY + 1, { align: 'center' });

          // Dashed Cutting Line between cards
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.2);
          doc.setLineDashPattern([2, 2], 0);
          if (col === 0) {
            doc.line(margin + cardWidth + 4, y, margin + cardWidth + 4, y + cardHeight);
          }
          if (row === 0) {
            doc.line(x, margin + cardHeight + 4, x + cardWidth, margin + cardHeight + 4);
          }
          doc.setLineDashPattern([], 0); // reset dash
        }
      } else if (layoutMode === '6_per_page') {
        // 2 columns x 3 rows = 6 cards per A4 page
        const cardsPerPage = 6;
        const cardWidth = (contentWidth - 6) / 2; // ~92mm
        const cardHeight = (contentHeight - 12) / 3; // ~88mm

        for (let i = 0; i < printableStudents.length; i++) {
          const student = printableStudents[i];
          const slotIndex = i % cardsPerPage;

          if (i > 0 && slotIndex === 0) {
            doc.addPage();
          }

          const col = slotIndex % 2;
          const row = Math.floor(slotIndex / 2);
          const x = margin + col * (cardWidth + 6);
          const y = margin + row * (cardHeight + 6);

          // Card Outer Border
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.6);
          doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

          // Header
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(x, y, cardWidth, 14, 2, 2, 'F');
          doc.rect(x, y + 10, cardWidth, 4, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(settings.schoolName.toUpperCase(), x + cardWidth / 2, y + 6, { align: 'center' });

          doc.setFontSize(5.5);
          doc.setFont('helvetica', 'normal');
          doc.text('KARTU TANDA PELAJAR DIGITAL', x + cardWidth / 2, y + 10.5, { align: 'center' });

          // Details left side, QR right side
          const leftWidth = 46;
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.text(student.name, x + 4, y + 21, { maxWidth: leftWidth });

          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`NIS: ${student.nis}`, x + 4, y + 31);
          doc.text(`Kelas: ${student.classRoom}`, x + 4, y + 36);
          doc.text(`JK: ${student.gender}`, x + 4, y + 41);
          if (student.parentPhone) {
            doc.text(`WA: ${student.parentPhone}`, x + 4, y + 46);
          }

          // Large QR on the right (38mm x 38mm)
          const qrSize = 38;
          const qrX = x + cardWidth - qrSize - 4;
          const qrY = y + 17;

          const qrUrl = qrMap[student.id];
          if (qrUrl) {
            doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          }

          // Bottom Instruction
          doc.setFillColor(238, 242, 255);
          doc.rect(x, y + cardHeight - 6, cardWidth, 6, 'F');
          doc.setFontSize(5.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(67, 56, 202);
          doc.text('Tunjukkan QR Code ini ke kamera saat presensi masuk', x + cardWidth / 2, y + cardHeight - 2, { align: 'center' });
        }
      } else {
        // 1 large card per A4 page (Poster format)
        for (let i = 0; i < printableStudents.length; i++) {
          const student = printableStudents[i];
          if (i > 0) {
            doc.addPage();
          }

          const x = margin;
          const y = margin;
          const cardWidth = contentWidth;
          const cardHeight = contentHeight;

          // Outer Border
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(1.2);
          doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');

          // Header
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(x, y, cardWidth, 38, 4, 4, 'F');
          doc.rect(x, y + 30, cardWidth, 8, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(settings.schoolName.toUpperCase(), x + cardWidth / 2, y + 16, { align: 'center' });

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(settings.schoolAddress || 'KARTU TANDA PELAJAR DIGITAL', x + cardWidth / 2, y + 25, { align: 'center' });

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('KARTU PRESENSI QR RESMI SISWA', x + cardWidth / 2, y + 33, { align: 'center' });

          // Large Student Details
          let curY = y + 55;
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          doc.text(student.name, x + cardWidth / 2, curY, { align: 'center' });

          curY += 10;
          doc.setFontSize(13);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`NIS: ${student.nis}   |   Kelas: ${student.classRoom}   |   ${student.gender}`, x + cardWidth / 2, curY, { align: 'center' });

          // Giant QR Code (120mm x 120mm)
          const qrSize = 120;
          const qrX = x + (cardWidth - qrSize) / 2;
          const qrY = curY + 12;

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.8);
          doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4, 4, 'FD');

          const qrUrl = qrMap[student.id];
          if (qrUrl) {
            doc.addImage(qrUrl, 'PNG', qrX, qrY, qrSize, qrSize);
          }

          // Footer Notice
          const footerY = y + cardHeight - 16;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(67, 56, 202);
          doc.text('Arahkan QR Code ini ke kamera saat presensi masuk sekolah', x + cardWidth / 2, footerY, { align: 'center' });
        }
      }

      const safeClass = selectedClass.replace(/\s+/g, '_');
      const safeSchool = settings.schoolName.replace(/\s+/g, '_');
      doc.save(`Kartu_QR_Siswa_${safeSchool}_Kelas_${safeClass}_A4.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Terjadi kesalahan saat mengekspor PDF kartu siswa.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl relative my-auto animate-scale-up overflow-hidden">
        {/* Modal Top Control Bar (Non-Printable) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shadow-indigo-600/20 shrink-0">
              <i className="fa-solid fa-print"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Cetak Kartu QR Siswa (Format A4)
                </h3>
                {isWaliKelas && myHomeroom && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Wali Kelas {myHomeroom}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kartu didesain presisi untuk kertas A4 dengan QR Code berukuran besar agar cepat & mudah dipindai kamera.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingQR || isExportingPDF || printableStudents.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Unduh File PDF A4 Siap Cetak"
            >
              <i className={`fa-solid ${isExportingPDF ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
              <span>{isExportingPDF ? 'Membuat PDF...' : 'Unduh PDF A4'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isGeneratingQR || printableStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              title="Cetak langsung ke printer"
            >
              <i className="fa-solid fa-print"></i>
              <span>Cetak Sekarang</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
              title="Tutup"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Filters & Configuration Controls (Non-Printable) */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <i className="fa-solid fa-graduation-cap text-indigo-600 dark:text-indigo-400"></i>
              <span className="font-semibold text-slate-500 dark:text-slate-400">Kelas:</span>
              {isWaliKelas && myHomeroom ? (
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                  Kelas {myHomeroom} (Terkunci ke Kelas Anda)
                </span>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Semua" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    Semua Kelas ({students.length} siswa)
                  </option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Layout Mode Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <i className="fa-solid fa-table-cells text-indigo-600 dark:text-indigo-400"></i>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Format Lembar A4:</span>
              <select
                value={layoutMode}
                onChange={(e) => setLayoutMode(e.target.value as CardLayoutMode)}
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
              >
                <option value="8_per_page" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  8 Kartu per A4 (Format 2x4 Presisi ID Card - Rekomendasi)
                </option>
                <option value="4_per_page" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  4 Kartu per A4 (Format 2x2 - QR Ekstra Besar)
                </option>
                <option value="6_per_page" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  6 Kartu per A4 (Format 2x3 - Ukuran Badge Saku)
                </option>
                <option value="1_per_page" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  1 Kartu per A4 (Format Poster Besar)
                </option>
              </select>
            </div>

            {/* Search filter within class */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Terpilih: <strong>{printableStudents.length}</strong> dari {classFilteredStudents.length} siswa
            </span>
            <button
              onClick={selectAll}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Pilih Semua
            </button>
            <button
              onClick={deselectAll}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              Batal Pilih
            </button>
          </div>
        </div>

        {/* Scrollable Printable Cards Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
          {isGeneratingQR ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl animate-spin">
                <i className="fa-solid fa-spinner"></i>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Menghasilkan Kode QR Beresolusi Tinggi...
              </p>
              <p className="text-xs text-slate-500">
                Memproses kode QR agar tajam dan mudah dipindai di berbagai perangkat.
              </p>
            </div>
          ) : printableStudents.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-xl">
                <i className="fa-solid fa-id-card-clip"></i>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Tidak ada kartu yang dipilih</p>
              <p className="text-xs text-slate-400">
                Centang siswa di atas atau ubah filter kelas untuk melihat kartu yang ingin dicetak.
              </p>
            </div>
          ) : (
            <div id="printable-cards-container" className="space-y-6">
              {/* CSS for direct Print dialog */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-cards-container,
                  #printable-cards-container * {
                    visibility: visible;
                  }
                  #printable-cards-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    background: white !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                  .page-break {
                    page-break-after: always;
                    break-after: page;
                  }
                  .card-item {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  @page {
                    size: A4 portrait;
                    margin: 8mm;
                  }
                }
              `}</style>

              {/* Grid Layout of Cards */}
              <div
                className={`grid gap-4 sm:gap-6 ${
                  layoutMode === '8_per_page'
                    ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                    : layoutMode === '4_per_page'
                    ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                    : layoutMode === '6_per_page'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 max-w-xl mx-auto'
                }`}
              >
                {printableStudents.map((student, idx) => {
                  const isChecked = selectedStudentIds.has(student.id);
                  const qrUrl = qrMap[student.id];

                  return (
                    <div
                      key={student.id}
                      className={`card-item bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-2xl shadow-md overflow-hidden relative transition-all text-slate-900 dark:text-white ${
                        (idx + 1) % (layoutMode === '8_per_page' ? 8 : layoutMode === '4_per_page' ? 4 : layoutMode === '6_per_page' ? 6 : 1) === 0
                          ? 'page-break'
                          : ''
                      }`}
                    >
                      {/* Checkbox selector in top-right for toggling */}
                      <button
                        onClick={() => toggleStudent(student.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs cursor-pointer shadow-xs no-print"
                        title={isChecked ? 'Batalkan cetak siswa ini' : 'Pilih siswa ini'}
                      >
                        {isChecked ? (
                          <i className="fa-solid fa-check text-indigo-600 dark:text-indigo-400 font-bold"></i>
                        ) : null}
                      </button>

                      {/* Card Header with School Name */}
                      <div className="bg-slate-900 text-white px-3 py-2 text-center border-b border-indigo-500/30 relative">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <div className="w-4 h-4 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[9px]">
                            <i className="fa-solid fa-graduation-cap"></i>
                          </div>
                          <h4 className="font-extrabold text-xs tracking-wider uppercase text-indigo-200 truncate max-w-[260px]">
                            {settings.schoolName}
                          </h4>
                        </div>
                        <p className="text-[8.5px] text-slate-400 truncate">
                          {settings.schoolAddress || 'KARTU PRESENSI PELAJAR RESMI'}
                        </p>
                      </div>

                      {/* Card Body: Compact 2x4 Layout vs Standard Layout */}
                      {layoutMode === '8_per_page' ? (
                        <div className="p-3 flex items-center justify-between gap-3">
                          {/* Student Details Left */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {student.name}
                            </h5>
                            <div className="flex flex-col gap-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                                NIS: {student.nis}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                                  Kelas {student.classRoom}
                                </span>
                                <span className="text-[10px] text-slate-500">{student.gender}</span>
                              </div>
                              {student.parentPhone && (
                                <span className="text-[9.5px] text-slate-400 truncate">
                                  WA: {student.parentPhone}
                                </span>
                              )}
                            </div>
                            <div className="pt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">
                                <i className="fa-solid fa-qrcode text-[9px]"></i> Pindai saat presensi
                              </span>
                            </div>
                          </div>

                          {/* QR Code Right */}
                          <div className="shrink-0 flex flex-col items-center p-1.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                            {qrUrl ? (
                              <img
                                src={qrUrl}
                                alt={`QR Code ${student.name}`}
                                className="w-24 h-24 rounded-md bg-white p-1 border border-slate-900 shadow-xs"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-md bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                                Memuat QR...
                              </div>
                            )}
                            <span className="text-[8.5px] font-bold text-slate-500 mt-1">SCAN QR</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {/* Student Name & NIS Banner */}
                          <div className="text-center">
                            <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                              {student.name}
                            </h5>
                            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400">
                                NIS: {student.nis}
                              </span>
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Kelas: {student.classRoom}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {student.gender}
                              </span>
                            </div>
                          </div>

                          {/* Extra Large High-Contrast QR Code */}
                          <div className="flex flex-col items-center justify-center p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                            {qrUrl ? (
                              <img
                                src={qrUrl}
                                alt={`QR Code ${student.name}`}
                                className={`rounded-lg bg-white p-1.5 border-2 border-slate-900 shadow-md ${
                                  layoutMode === '1_per_page'
                                    ? 'w-48 h-48 sm:w-64 sm:h-64'
                                    : layoutMode === '4_per_page'
                                    ? 'w-36 h-36 sm:w-44 sm:h-44'
                                    : 'w-28 h-28'
                                }`}
                              />
                            ) : (
                              <div className="w-36 h-36 rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                                Memuat QR...
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-1">
                              <i className="fa-solid fa-camera text-indigo-600 dark:text-indigo-400 text-xs"></i>
                              <span>Arahkan ke Kamera Presensi</span>
                            </span>
                          </div>

                          {/* Footer Details: WhatsApp & Cut Line indicator */}
                          {student.parentPhone && (
                            <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                              <span>Kontak Wali Siswa: <strong className="font-mono text-slate-700 dark:text-slate-200">{student.parentPhone}</strong></span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual Cutting Guide Line */}
                      <div className="border-b-2 border-dashed border-slate-300 dark:border-slate-700 relative">
                        <span className="absolute right-2 -bottom-2.5 bg-white dark:bg-slate-900 px-1 text-[8px] text-slate-400 flex items-center gap-0.5">
                          <i className="fa-solid fa-scissors"></i> Gunting di sini
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
