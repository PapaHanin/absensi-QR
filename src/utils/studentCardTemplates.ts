import jsPDF from 'jspdf';
import { Student, SystemSettings } from '../types';
import { SCHOOL_LOGO_DATA_URI, SchoolLogo } from './schoolLogo';
import { TUT_WURI_HANDAYANI_DATA_URI } from './tutWuriHandayaniLogo';
import { HEADMASTER_DEFAULT_BARCODE_DATA_URI } from './headmasterBarcode';

export type CardTemplateId = 'seraphic' | 'nusantara' | 'pelita';

export interface CardTemplateInfo {
  id: CardTemplateId;
  name: string;
  tagline: string;
  schoolNamePrompt: string;
  subtitlePrompt: string;
  departmentText: string;
  schoolAddressText: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    lanyard: string;
    lanyardPattern?: string;
  };
  sampleStudent: {
    name: string;
    nis: string;
    nisn: string;
    classRoom: string;
    program?: string;
    ttl: string;
    gender: string;
    religion: string;
    address: string;
    photoUrl: string;
    schoolName: string;
    departmentText: string;
    schoolAddressText: string;
    subtitle: string;
    academicYear: string;
    validityText: string;
    headmasterName: string;
    headmasterNip: string;
    cityDateText: string;
  };
}

export const CARD_TEMPLATES: Record<CardTemplateId, CardTemplateInfo> = {
  seraphic: {
    id: 'seraphic',
    name: 'Standar Nasional (Biru Kemdikbud)',
    tagline: 'Format resmi nasional dengan logo Tut Wuri Handayani, KOP dinas & biodata lengkap',
    schoolNamePrompt: 'UPTD SMP NEGERI 1 TELADAN',
    subtitlePrompt: 'KARTU TANDA PELAJAR',
    departmentText: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    schoolAddressText: 'Jl. Merdeka Belajar No. 45, Telp. (021) 7890123',
    colors: {
      primary: '#0b4a94', // Kemdikbud deep blue
      secondary: '#1e40af', // Royal blue
      accent: '#eab308', // Gold / amber
      bg: '#ffffff',
      text: '#0f172a',
      lanyard: '#0b4a94',
      lanyardPattern: '#eab308',
    },
    sampleStudent: {
      name: 'ANDINI PUTRI PRATIWI',
      nis: '231456',
      nisn: '0081234567',
      classRoom: 'VII-A',
      ttl: 'Jakarta, 14 Mei 2011',
      gender: 'Perempuan',
      religion: 'Islam',
      address: 'Jl. Melati No. 12, RT 03/RW 04',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      schoolName: 'UPTD SMP NEGERI 1 TELADAN',
      departmentText: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      schoolAddressText: 'Jl. Merdeka Belajar No. 45, Telp. (021) 7890123',
      subtitle: 'KARTU TANDA PELAJAR',
      academicYear: '2024/2025',
      validityText: 'Berlaku Selama Menjadi Siswa Aktif',
      headmasterName: 'Drs. H. Mulyadi, M.Pd',
      headmasterNip: 'NIP. 19680512 199403 1 005',
      cityDateText: 'Jakarta, 15 Juli 2024',
    },
  },
  nusantara: {
    id: 'nusantara',
    name: 'Klasik Hijau Zamrud (Formal Akademik)',
    tagline: 'Format resmi klasik berkelas dengan logo Tut Wuri Handayani & stempel legalitas',
    schoolNamePrompt: 'SMA NEGERI 1 NUSANTARA',
    subtitlePrompt: 'KARTU IDENTITAS SISWA & ABSENSI',
    departmentText: 'DINAS PENDIDIKAN PEMUDA DAN OLAHRAGA',
    schoolAddressText: 'Jl. Ki Hajar Dewantara No. 18, Telp. (022) 6543210',
    colors: {
      primary: '#14532d', // Forest emerald green
      secondary: '#15803d', // Green
      accent: '#ca8a04', // Gold crest
      bg: '#fdfbf7', // Warm ivory cream
      text: '#0f172a',
      lanyard: '#15803d',
      lanyardPattern: '#ca8a04',
    },
    sampleStudent: {
      name: 'BAGUS PRADANA KUSUMA',
      nis: '12108876',
      nisn: '0078901234',
      classRoom: 'XI MIPA 2',
      ttl: 'Bandung, 22 Agustus 2008',
      gender: 'Laki-laki',
      religion: 'Islam',
      address: 'Jl. Pahlawan No. 78, RT 01/RW 02',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      schoolName: 'SMA NEGERI 1 NUSANTARA',
      departmentText: 'DINAS PENDIDIKAN PEMUDA DAN OLAHRAGA',
      schoolAddressText: 'Jl. Ki Hajar Dewantara No. 18, Telp. (022) 6543210',
      subtitle: 'KARTU IDENTITAS SISWA & ABSENSI',
      academicYear: '2024/2025',
      validityText: 'Berlaku Selama Menjadi Siswa Aktif',
      headmasterName: 'Dr. Irwan Setiawan, M.Pd',
      headmasterNip: 'NIP. 19740815 200003 1 002',
      cityDateText: 'Bandung, 15 Juli 2024',
    },
  },
  pelita: {
    id: 'pelita',
    name: 'Smart Card Kontemporer (Dark Slate & Cyan)',
    tagline: 'Format smart card presisi modern dengan logo Tut Wuri Handayani & akses digital',
    schoolNamePrompt: 'SMK DIGITAL PELITA BANGSA',
    subtitlePrompt: 'SMART STUDENT CARD & DIGITAL ACCESS',
    departmentText: 'CABANG DINAS PENDIDIKAN WILAYAH I',
    schoolAddressText: 'Jl. Cendekia Mandiri No. 9, Telp. (031) 8765432',
    colors: {
      primary: '#0f172a', // Slate Navy
      secondary: '#0284c7', // Cyan
      accent: '#f97316', // Orange
      bg: '#ffffff',
      text: '#0f172a',
      lanyard: '#0284c7',
      lanyardPattern: '#f97316',
    },
    sampleStudent: {
      name: 'SARAH ELIZA CHANDRA',
      nis: '2209123',
      nisn: '0065432189',
      classRoom: 'X RPL 1',
      program: 'REKAYASA PERANGKAT LUNAK',
      ttl: 'Surabaya, 10 Oktober 2008',
      gender: 'Perempuan',
      religion: 'Kristen',
      address: 'Jl. Dharmawangsa No. 25',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      schoolName: 'SMK DIGITAL PELITA BANGSA',
      departmentText: 'CABANG DINAS PENDIDIKAN WILAYAH I',
      schoolAddressText: 'Jl. Cendekia Mandiri No. 9, Telp. (031) 8765432',
      subtitle: 'SMART STUDENT CARD & DIGITAL ACCESS',
      academicYear: '2024/2025',
      validityText: 'Berlaku Selama Menjadi Siswa Aktif',
      headmasterName: 'Bambang Trianto, S.Kom., M.T.',
      headmasterNip: 'NIP. 19800214 200604 1 008',
      cityDateText: 'Surabaya, 15 Juli 2024',
    },
  },
};

export const CR80_WIDTH_MM = 53.98;
export const CR80_HEIGHT_MM = 85.60;

/**
 * Draws an exact standard ISO/IEC 7810 ID-1 (CR80) vertical student card in jsPDF
 * Card size: 53.98 mm width x 85.60 mm height
 * Complete with official Indonesian school KOP, Tut Wuri Handayani logo, full student details,
 * official school stamp, QR code for attendance, and Headmaster signature validation.
 */
export const drawCR80CardPDF = (
  doc: jsPDF,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  student: Student,
  settings: SystemSettings,
  photoDataUrl: string | undefined,
  qrDataUrl: string | undefined,
  templateId: CardTemplateId = 'seraphic',
  useSamplePromptData: boolean = false
) => {
  const template = CARD_TEMPLATES[templateId] || CARD_TEMPLATES.seraphic;

  // Values resolution: Sample Prompt vs Real School Data
  const sample = template.sampleStudent;
  const isSample = useSamplePromptData || !student;

  const studentName = isSample ? sample.name : student.name.toUpperCase();
  const studentNis = isSample ? sample.nis : student.nis;
  const studentNisn = isSample
    ? sample.nisn
    : student.nisn || (student.nis ? `008${student.nis.slice(0, 7)}` : '0081234567');
  const studentClass = isSample ? sample.classRoom : student.classRoom;
  const schoolName = isSample
    ? sample.schoolName
    : settings.schoolName?.toUpperCase() || 'UPTD SMP NEGERI 1 TELADAN';
  const departmentText = isSample
    ? sample.departmentText
    : settings.schoolCity
    ? `DINAS PENDIDIKAN KOTA ${settings.schoolCity.toUpperCase()}`
    : 'DINAS PENDIDIKAN DAN KEBUDAYAAN';
  const schoolAddress = isSample
    ? sample.schoolAddressText
    : settings.schoolAddress || 'Jl. Pendidikan No. 10, Telp. (021) 7890123';
  const academicYear = isSample ? sample.academicYear : settings.academicYear;
  const headmaster = isSample
    ? sample.headmasterName
    : settings.headmasterName || 'Drs. H. Mulyadi, M.Pd';
  const headmasterNip = isSample
    ? sample.headmasterNip
    : settings.headmasterNip || 'NIP. 19680512 199403 1 005';
  const cityDateText = isSample
    ? sample.cityDateText
    : `${settings.schoolCity || 'Jakarta'}, 15 Juli 2024`;
  const studentTTL = isSample
    ? sample.ttl
    : student.birthPlace && student.birthDate
    ? `${student.birthPlace}, ${student.birthDate}`
    : student.gender === 'Laki-laki'
    ? 'Jakarta, 12 Agustus 2011'
    : 'Bandung, 14 Mei 2011';
  const studentGender = isSample
    ? sample.gender
    : student.gender || 'Perempuan';
  const studentReligion = isSample
    ? sample.religion
    : student.religion || 'Islam';
  const studentAddress = isSample
    ? sample.address
    : student.address || (student.classRoom ? `Komp. Sekolah RT 02/RW 03` : 'Jl. Mawar No. 8');
  const validityText = isSample
    ? sample.validityText
    : settings.cardValidityYear
    ? `Masa Berlaku: s/d ${settings.cardValidityYear}`
    : 'Berlaku Selama Menjadi Siswa Aktif';

  // Base CR80 Card Rounded Rectangle (Corner radius standard 3.18mm)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, cardWidth, cardHeight, 3.18, 3.18, 'FD');

  // Colors depending on template
  const primaryRGB =
    templateId === 'seraphic'
      ? [11, 74, 148] // Navy Kemdikbud
      : templateId === 'nusantara'
      ? [20, 83, 45] // Emerald
      : [15, 23, 42]; // Slate

  const accentRGB =
    templateId === 'seraphic'
      ? [234, 179, 8] // Amber
      : templateId === 'nusantara'
      ? [202, 138, 4] // Gold
      : [2, 132, 199]; // Cyan

  // 1. TOP ACCENT STRIP
  doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.rect(x, y, cardWidth, 2.5, 'F');
  doc.setFillColor(accentRGB[0], accentRGB[1], accentRGB[2]);
  doc.rect(x, y + 2.5, cardWidth, 0.5, 'F');

  // 2. KOP RESMI SEKOLAH
  // Logo Resmi Sekolah SDN Kecil Ogomojolo on the left
  const logoX = x + 2.5;
  const logoY = y + 3.8;
  const logoW = 6.8;
  const logoH = 8.6;
  try {
    doc.addImage(SCHOOL_LOGO_DATA_URI, 'PNG', logoX, logoY, logoW, logoH);
  } catch {
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.circle(logoX + logoW / 2, logoY + logoH / 2, logoW / 2, 'F');
  }

  // Teks KOP Instansi (Dinas & Sekolah)
  const kopTextX = x + 11.5;
  const kopMaxWidth = cardWidth - 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.8);
  doc.setTextColor(71, 85, 105);
  doc.text(departmentText, kopTextX + kopMaxWidth / 2, y + 5.5, { align: 'center', maxWidth: kopMaxWidth });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);
  doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.text(schoolName, kopTextX + kopMaxWidth / 2, y + 8.2, { align: 'center', maxWidth: kopMaxWidth });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(3.0);
  doc.setTextColor(100, 116, 139);
  doc.text(schoolAddress, kopTextX + kopMaxWidth / 2, y + 10.5, { align: 'center', maxWidth: kopMaxWidth });

  // Garis KOP Ganda
  doc.setDrawColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.setLineWidth(0.4);
  doc.line(x + 2, y + 12.2, x + cardWidth - 2, y + 12.2);

  doc.setDrawColor(accentRGB[0], accentRGB[1], accentRGB[2]);
  doc.setLineWidth(0.18);
  doc.line(x + 2, y + 12.8, x + cardWidth - 2, y + 12.8);

  // 3. BANNER JUDUL KARTU RESMI
  const titleY = y + 14.0;
  doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.roundedRect(x + 2.5, titleY, cardWidth - 5, 4.2, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(255, 255, 255);
  const cardTitle =
    templateId === 'seraphic'
      ? 'KARTU TANDA PELAJAR'
      : templateId === 'nusantara'
      ? 'KARTU IDENTITAS SISWA'
      : 'SMART STUDENT CARD';
  doc.text(cardTitle, x + cardWidth / 2, titleY + 2.8, { align: 'center' });

  // 4. PASFOTO FORMAL 3x4 DENGAN STEMPEL BASAH
  const photoW = 14;
  const photoH = 18;
  const photoX = x + 3.0;
  const photoY = titleY + 5.5;

  // Frame Foto
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(photoX, photoY, photoW, photoH, 0.8, 0.8, 'FD');

  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, 'JPEG', photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6);
    } catch {
      doc.setFillColor(226, 232, 240);
      doc.rect(photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6, 'F');
    }
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(photoX + 0.3, photoY + 0.3, photoW - 0.6, photoH - 0.6, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.5);
    doc.text('FOTO 3X4', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  }

  // Stempel Basah Sekolah (Lingkaran menimpa pojok kanan bawah foto)
  const stampX = photoX + photoW - 1.5;
  const stampY = photoY + photoH - 1.5;
  doc.setDrawColor(67, 56, 202); // Ungu / Indigo Stempel
  doc.setLineWidth(0.3);
  doc.circle(stampX, stampY, 4.2, 'S');
  doc.setLineWidth(0.15);
  doc.circle(stampX, stampY, 3.6, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(1.8);
  doc.setTextColor(67, 56, 202);
  doc.text('RESMI', stampX, stampY + 0.6, { align: 'center' });

  // 5. TABEL BIODATA SISWA LENGKAP
  const tableX = x + 18.5;
  const colColonX = tableX + 11.5;
  const colValX = tableX + 13.0;
  const maxValW = cardWidth - (colValX - x) - 2.5;
  let curY = photoY + 2.5;
  const rowGap = 2.55;

  const rows = [
    { label: 'NIS/NISN', val: `${studentNis} / ${studentNisn}` },
    { label: 'Nama', val: studentName },
    { label: 'TTL', val: studentTTL },
    { label: 'J. Kelamin', val: studentGender },
    { label: 'Agama', val: studentReligion },
    { label: 'Kelas', val: studentClass },
    { label: 'Alamat', val: studentAddress },
  ];

  rows.forEach((row, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(3.2);
    doc.setTextColor(71, 85, 105);
    doc.text(row.label, tableX, curY);

    doc.setTextColor(148, 163, 184);
    doc.text(':', colColonX, curY);

    if (idx === 1) {
      // Nama: Bold & dark
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.5);
      doc.setTextColor(15, 23, 42);
    } else if (idx === 0 || idx === 5) {
      // NIS / Kelas: Bold primary color
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.2);
      doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(3.0);
      doc.setTextColor(30, 41, 59);
    }
    doc.text(row.val, colValX, curY, { maxWidth: maxValW });

    curY += rowGap;
  });

  // 6. QR CODE ABSENSI & PENGESAHAN KEPALA SEKOLAH
  const boxY = y + 46.5;
  const boxH = 24.5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(x + 2.5, boxY, cardWidth - 5, boxH, 1.5, 1.5, 'FD');

  // QR Code Box on Left
  const qrSize = 14.5;
  const qrX = x + 4.2;
  const qrY = boxY + 2.2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.setLineWidth(0.35);
  doc.roundedRect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1, 0.8, 0.8, 'FD');

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch {
      doc.rect(qrX, qrY, qrSize, qrSize);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.2);
  doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.text('PINDAI ABSENSI', qrX + qrSize / 2, qrY + qrSize + 3.0, { align: 'center' });

  // Kolom Pengesahan Kepala Sekolah on Right
  const signCenterX = x + 35.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(3.0);
  doc.setTextColor(100, 116, 139);
  doc.text(cityDateText, signCenterX, boxY + 3.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.3);
  doc.setTextColor(15, 23, 42);
  doc.text('Kepala Sekolah,', signCenterX, boxY + 6.8, { align: 'center' });

  // Barcode Tanda Tangan Elektronik (TTE) Kepala Sekolah
  const barcodeSize = 8.5;
  const barcodeX = signCenterX - barcodeSize / 2;
  const barcodeY = boxY + 7.5;
  const headmasterBarcodeUri = settings.headmasterBarcodeUrl || HEADMASTER_DEFAULT_BARCODE_DATA_URI;

  try {
    doc.addImage(headmasterBarcodeUri, 'PNG', barcodeX, barcodeY, barcodeSize, barcodeSize);
  } catch {
    doc.setDrawColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(barcodeX, barcodeY, barcodeSize, barcodeSize, 0.4, 0.4, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(2.2);
    doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.text('TTE RESMI', signCenterX, barcodeY + barcodeSize / 2 + 0.6, { align: 'center' });
  }

  // Nama & NIP
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.3);
  doc.setTextColor(15, 23, 42);
  doc.text(headmaster, signCenterX, boxY + 17.5, { align: 'center', maxWidth: 22 });
  // Underline nama kepala sekolah
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.2);
  doc.line(signCenterX - 9, boxY + 18.2, signCenterX + 9, boxY + 18.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(2.7);
  doc.setTextColor(71, 85, 105);
  doc.text(headmasterNip, signCenterX, boxY + 21.0, { align: 'center', maxWidth: 24 });

  // 7. KETENTUAN TATA TERTIB & FOOTER
  const footerY = y + 72.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(x + 3, footerY, x + cardWidth - 3, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(2.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Ketentuan: 1. Kartu ini bukti sah siswa. 2. Wajib dibawa saat presensi & perpus. 3. Hilang lapor sekolah.', x + cardWidth / 2, footerY + 2.5, { align: 'center', maxWidth: cardWidth - 6 });

  // Bottom Color Bar with Validity
  doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
  doc.roundedRect(x + 2.5, footerY + 4.8, cardWidth - 5, 3.8, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.2);
  doc.setTextColor(255, 255, 255);
  doc.text(`TAHUN AJARAN ${academicYear}`, x + 4.5, footerY + 7.4);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentRGB[0], accentRGB[1], accentRGB[2]);
  doc.text(validityText, x + cardWidth - 4.5, footerY + 7.4, { align: 'right' });

  // Outer Crisp Stroke
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, cardWidth, cardHeight, 3.18, 3.18, 'D');
};
