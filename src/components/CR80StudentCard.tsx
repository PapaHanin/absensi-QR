import React from 'react';
import { Student, SystemSettings } from '../types';
import { CardTemplateId, CARD_TEMPLATES } from '../utils/studentCardTemplates';
import { SchoolLogo } from '../utils/schoolLogo';
import { TutWuriHandayaniLogo } from '../utils/tutWuriHandayaniLogo';
import { HeadmasterBarcode } from '../utils/headmasterBarcode';

interface CR80StudentCardProps {
  templateId: CardTemplateId;
  student?: Student;
  settings: SystemSettings;
  qrUrl?: string;
  photoUrl?: string;
  useSamplePromptData?: boolean;
  showLanyard?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showCheckbox?: boolean;
  className?: string;
}

export const CR80StudentCard: React.FC<CR80StudentCardProps> = ({
  templateId,
  student,
  settings,
  qrUrl,
  photoUrl,
  useSamplePromptData = false,
  showLanyard = true,
  isSelected = true,
  onToggleSelect,
  showCheckbox = false,
  className = '',
}) => {
  const template = CARD_TEMPLATES[templateId] || CARD_TEMPLATES.seraphic;

  // Resolve values: Sample Prompt vs Real School Data
  const sample = template.sampleStudent;
  const isSample = useSamplePromptData || !student;

  const displayName = isSample ? sample.name : student.name.toUpperCase();
  const displayNis = isSample ? sample.nis : student.nis;
  const displayNisn = isSample
    ? sample.nisn
    : student.nisn || (student.nis ? `008${student.nis.slice(0, 7)}` : '0081234567');
  const displayClass = isSample ? sample.classRoom : student.classRoom;
  const displaySchool = isSample
    ? sample.schoolName
    : settings.schoolName?.toUpperCase() || 'SDN KECIL OGOMOJOLO';
  const displayDepartment = isSample
    ? sample.departmentText
    : settings.schoolCity
    ? `DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN ${settings.schoolCity.toUpperCase()}`
    : 'DINAS PENDIDIKAN DAN KEBUDAYAAN KAB. PARIGI MOUTONG';
  const displaySchoolAddress = isSample
    ? sample.schoolAddressText
    : settings.schoolAddress || 'Desa Ogomojolo, Kec. Palasa, Kab. Parigi Moutong';
  const displayYear = isSample ? sample.academicYear : settings.academicYear;
  const displayPhoto = isSample
    ? sample.photoUrl
    : photoUrl || student?.photo || student?.avatarUrl || sample.photoUrl;
  const displayHeadmaster = isSample
    ? sample.headmasterName
    : settings.headmasterName || 'Kepala Sekolah SDN Kecil Ogomojolo';
  const displayHeadmasterNip = isSample
    ? sample.headmasterNip
    : settings.headmasterNip || 'NIP. 19750810 200501 1 008';
  const displayCityDate = isSample
    ? sample.cityDateText
    : `${settings.schoolCity || 'Ogomojolo'}, 15 Juli 2024`;
  const displayTTL = isSample
    ? sample.ttl
    : student.ttl
    ? student.ttl
    : student.birthPlace && student.birthDate
    ? `${student.birthPlace}, ${student.birthDate}`
    : student.birthPlace
    ? student.birthPlace
    : student.gender === 'Laki-laki'
    ? 'Ogomojolo, 12 Agustus 2014'
    : 'Palasa, 14 Mei 2014';
  const displayGender = isSample
    ? sample.gender
    : student.gender || 'Perempuan';
  const displayReligion = isSample
    ? sample.religion
    : student.religion || 'Islam';
  const displayAddress = isSample
    ? sample.address
    : student.address || 'Desa Ogomojolo, Kec. Palasa';
  const displayValidity = isSample
    ? sample.validityText
    : settings.cardValidityYear
    ? `Masa Berlaku: s/d ${settings.cardValidityYear}`
    : 'Berlaku Selama Menjadi Siswa Aktif';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 0. Optional Lanyard Strap & Clip (Matching Colors from Prompt) */}
      {showLanyard && (
        <div className="flex flex-col items-center -mb-2 z-20 pointer-events-none no-print">
          {/* Lanyard Fabric Loop */}
          <div
            className="w-8 h-10 shadow-inner flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundColor: template.colors.lanyard,
            }}
          >
            {template.colors.lanyardPattern && (
              <div
                className="w-1.5 h-full opacity-80"
                style={{ backgroundColor: template.colors.lanyardPattern }}
              />
            )}
          </div>
          {/* Metallic Clip & Punch Slot */}
          <div className="w-5 h-3 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-300 rounded-xs shadow-xs border border-slate-400 -mt-0.5 z-10 flex items-center justify-center">
            <div className="w-2.5 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      )}

      {/* 1. Base CR80 Card (Physical ISO 7810: 53.98 x 85.60 mm - Portrait) */}
      <div
        className="cr80-card relative bg-white text-slate-900 border border-slate-300/80 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between"
        style={{
          width: '280px',
          height: '445px', // Exact aspect ratio 53.98mm : 85.60mm
          maxWidth: '100%',
        }}
      >
        {/* Checkbox Selector (Non-Printable) */}
        {showCheckbox && onToggleSelect && (
          <button
            type="button"
            onClick={onToggleSelect}
            className="absolute top-2.5 right-2.5 z-40 w-6 h-6 rounded-lg bg-white/95 border border-slate-300 flex items-center justify-center text-xs cursor-pointer shadow-md no-print hover:bg-white transition-transform active:scale-95"
            title={isSelected ? 'Batalkan cetak siswa ini' : 'Pilih siswa ini'}
          >
            {isSelected && (
              <i
                className="fa-solid fa-check font-black"
                style={{ color: template.colors.primary }}
              />
            )}
          </button>
        )}

        {/* ========================================================================= */}
        {/* TEMPLATE 1: STANDAR NASIONAL (BIRU KEMDIKBUD + TUT WURI HANDAYANI)       */}
        {/* ========================================================================= */}
        {templateId === 'seraphic' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-white p-2.5 pt-2 overflow-hidden">
            {/* Watermark Logo Resmi Sekolah di Tengah Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
              <SchoolLogo size={160} />
            </div>

            {/* Top Navy & Gold Accent Borders */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-blue-700 to-amber-500 z-10" />

            {/* KOP RESMI SEKOLAH */}
            <div className="relative z-10 pt-1 pb-1">
              <div className="flex items-center gap-2">
                {/* Logo Resmi Sekolah SDN Kecil Ogomojolo */}
                <div className="shrink-0 p-0.5">
                  <SchoolLogo size={32} title="Logo Resmi SDN Kecil Ogomojolo" />
                </div>

                {/* Teks KOP Instansi */}
                <div className="flex-1 text-center min-w-0 pr-1">
                  <h6 className="text-[7px] font-black text-slate-700 tracking-wider uppercase leading-none">
                    {displayDepartment}
                  </h6>
                  <h4 className="text-[9.5px] font-black text-blue-950 uppercase tracking-tight leading-tight mt-0.5 truncate">
                    {displaySchool}
                  </h4>
                  <p className="text-[6.5px] text-slate-500 font-medium leading-tight truncate">
                    {displaySchoolAddress}
                  </p>
                </div>
              </div>

              {/* Garis KOP Ganda (Tebal & Tipis) */}
              <div className="mt-1 space-y-0.5">
                <div className="w-full h-[1.5px] bg-blue-950" />
                <div className="w-full h-[0.5px] bg-amber-500" />
              </div>
            </div>

            {/* BANNER JUDUL KARTU */}
            <div className="relative z-10 mx-auto w-full py-0.5 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-white rounded-md text-center shadow-2xs">
              <h5 className="text-[8.5px] font-black tracking-wider uppercase drop-shadow-xs">
                KARTU TANDA PELAJAR
              </h5>
              <p className="text-[6px] text-amber-300 font-bold uppercase tracking-widest -mt-0.5">
                NOMOR INDUK SISWA NASIONAL (NISN) & ABSENSI
              </p>
            </div>

            {/* PROFIL & BIODATA SISWA (Tabel Rapi dengan Titik Dua) */}
            <div className="relative z-10 flex gap-2 items-start mt-1 px-0.5">
              {/* Pasfoto Resmi 3x4 dengan Stempel Basah Dinas */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative p-0.5 bg-white border-2 border-blue-900 rounded-md shadow-xs overflow-hidden">
                  <div className="w-16 h-20 bg-slate-100 rounded-xs overflow-hidden flex items-center justify-center">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-user text-xl text-slate-400" />
                    )}
                  </div>

                  {/* STEMPEL RESMI BASAH SEKOLAH (Menimpa sudut foto seperti kartu asli) */}
                  <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full border-2 border-indigo-700/80 bg-indigo-500/10 backdrop-blur-[0.5px] flex flex-col items-center justify-center pointer-events-none rotate-[-12deg]">
                    <div className="w-9 h-9 rounded-full border border-dashed border-indigo-700/80 flex flex-col items-center justify-center text-center p-0.5">
                      <span className="text-[4px] font-black text-indigo-900 tracking-tighter uppercase leading-none">
                        SEKOLAH
                      </span>
                      <i className="fa-solid fa-star text-[4px] text-indigo-700 my-0.5" />
                      <span className="text-[4px] font-black text-indigo-900 tracking-tighter uppercase leading-none">
                        RESMI
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Biodata Siswa */}
              <div className="flex-1 min-w-0 text-[8px] space-y-0.5 text-slate-800 leading-tight">
                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">NIS / NISN</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-mono font-bold text-blue-950 truncate">
                    {displayNis} / {displayNisn}
                  </span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">Nama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-black text-[8.5px] text-slate-950 uppercase truncate">
                    {displayName}
                  </span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">TTL</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium truncate">{displayTTL}</span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">J. Kelamin</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayGender}</span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">Agama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayReligion}</span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">Kelas</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-blue-900">{displayClass}</span>
                </div>

                <div className="grid grid-cols-[55px_6px_1fr] items-baseline">
                  <span className="font-semibold text-slate-600">Alamat</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-[7.5px] line-clamp-1">{displayAddress}</span>
                </div>
              </div>
            </div>

            {/* QR CODE ABSENSI & LEGALITAS KEPALA SEKOLAH */}
            <div className="relative z-10 flex items-center justify-between gap-2 mt-1 px-1 bg-slate-50/90 p-1.5 rounded-lg border border-slate-200">
              {/* QR Code Presisi Absensi */}
              <div className="flex flex-col items-center">
                <div className="p-1 bg-white border border-blue-900 rounded-md shadow-2xs">
                  <div className="w-14 h-14 bg-white flex items-center justify-center overflow-hidden">
                    {qrUrl ? (
                      <img src={qrUrl} alt={`QR ${displayName}`} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400">
                        QR Code
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[6.5px] font-black text-blue-900 uppercase tracking-tight mt-0.5">
                  PINDAI ABSENSI
                </span>
              </div>

              {/* Pengesahan Kepala Sekolah */}
              <div className="flex-1 text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[6.5px] text-slate-600 font-medium">
                  {displayCityDate}
                </p>
                <p className="text-[7px] font-bold text-slate-800">
                  Kepala Sekolah,
                </p>

                {/* Barcode Tanda Tangan Elektronik (TTE) Kepala Sekolah */}
                <div className="my-0.5 flex flex-col items-center justify-center">
                  <HeadmasterBarcode
                    customBarcodeUrl={settings.headmasterBarcodeUrl}
                    size={38}
                    className="shrink-0"
                  />
                  <span className="text-[5px] font-black text-blue-900 tracking-tighter uppercase leading-none mt-0.5">
                    TTE RESMI KEPSEK
                  </span>
                </div>

                {/* Nama Kepala Sekolah & NIP */}
                <p className="text-[7.5px] font-black text-slate-950 underline leading-tight truncate max-w-[130px]">
                  {displayHeadmaster}
                </p>
                <p className="text-[6.5px] font-mono text-slate-600 leading-none mt-0.5">
                  {displayHeadmasterNip}
                </p>
              </div>
            </div>

            {/* KETENTUAN TATA TERTIB & FOOTER */}
            <div className="relative z-10 mt-1 border-t border-slate-200 pt-1 text-center">
              <p className="text-[6px] text-slate-500 leading-tight">
                <strong>Ketentuan:</strong> 1. Kartu ini bukti sah siswa. 2. Wajib dibawa saat presensi & kegiatan sekolah. 3. Jika hilang harap lapor ke pihak sekolah.
              </p>
              <div className="flex items-center justify-between text-[6.5px] font-bold text-blue-900 mt-0.5 px-1">
                <span>TA {displayYear}</span>
                <span className="text-amber-700">{displayValidity}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TEMPLATE 2: KLASIK HIJAU ZAMRUD (FORMAL AKADEMIK + STEMPEL & TTD)        */}
        {/* ========================================================================= */}
        {templateId === 'nusantara' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-[#fdfbf7] p-2.5 pt-1.5 overflow-hidden border-4 border-emerald-900/10">
            {/* Watermark Lambang Sekolah di Tengah Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
              <SchoolLogo size={160} />
            </div>

            {/* Top Emerald Header Ribbon */}
            <div className="relative z-10 -mx-2.5 -mt-1.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-2 pb-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                {/* Logo Resmi Sekolah SDN Kecil Ogomojolo */}
                <div className="shrink-0 p-0.5 bg-white/10 rounded-md border border-amber-300/40">
                  <SchoolLogo size={30} title="Logo Resmi SDN Kecil Ogomojolo" />
                </div>

                <div className="flex-1 text-center min-w-0 pr-1">
                  <h6 className="text-[6.5px] font-bold text-emerald-200 uppercase tracking-wider leading-none">
                    {displayDepartment}
                  </h6>
                  <h4 className="text-[9px] font-black text-amber-300 uppercase tracking-tight leading-tight mt-0.5 truncate">
                    {displaySchool}
                  </h4>
                  <p className="text-[6px] text-emerald-100 font-normal leading-tight truncate">
                    {displaySchoolAddress}
                  </p>
                </div>
              </div>

              {/* Gold Ornamental Divider */}
              <div className="mt-1 flex items-center justify-center gap-1">
                <div className="flex-1 h-[0.5px] bg-amber-400/60" />
                <i className="fa-solid fa-diamond text-[4px] text-amber-300" />
                <div className="flex-1 h-[0.5px] bg-amber-400/60" />
              </div>
            </div>

            {/* BANNER JUDUL KARTU */}
            <div className="relative z-10 text-center my-0.5">
              <h5 className="text-[8.5px] font-black text-emerald-950 tracking-wider uppercase">
                KARTU IDENTITAS SISWA & ABSENSI
              </h5>
              <p className="text-[6px] text-emerald-800 font-bold uppercase tracking-widest">
                TAHUN AJARAN {displayYear}
              </p>
            </div>

            {/* BIODATA LENGKAP & PASFOTO DENGAN STEMPEL */}
            <div className="relative z-10 flex gap-2 items-start px-0.5">
              {/* Foto Siswa Berbingkai Emas-Hijau */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative p-0.5 bg-white border-2 border-emerald-800 rounded-md shadow-xs overflow-hidden">
                  <div className="w-16 h-20 bg-slate-100 rounded-xs overflow-hidden flex items-center justify-center">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-user text-xl text-slate-400" />
                    )}
                  </div>

                  {/* STEMPEL BASAH HIJAU/UNGU RESMI */}
                  <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full border-2 border-emerald-700/85 bg-emerald-500/10 backdrop-blur-[0.5px] flex flex-col items-center justify-center pointer-events-none rotate-[-10deg]">
                    <div className="w-9 h-9 rounded-full border border-dashed border-emerald-700/85 flex flex-col items-center justify-center text-center p-0.5">
                      <span className="text-[4px] font-black text-emerald-950 tracking-tighter uppercase leading-none">
                        KARTU
                      </span>
                      <i className="fa-solid fa-check text-[4px] text-emerald-800 my-0.5" />
                      <span className="text-[4px] font-black text-emerald-950 tracking-tighter uppercase leading-none">
                        SAH
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biodata Tabel Two-Column */}
              <div className="flex-1 min-w-0 text-[8px] space-y-0.5 text-slate-800 leading-tight">
                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">NIS / NISN</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-mono font-bold text-slate-900 truncate">
                    {displayNis} / {displayNisn}
                  </span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">Nama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-black text-[8.5px] text-slate-950 uppercase truncate">
                    {displayName}
                  </span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">TTL</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium truncate">{displayTTL}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">J. Kelamin</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayGender}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">Agama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayReligion}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">Kelas</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-emerald-900">{displayClass}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-emerald-900">Alamat</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-[7.5px] line-clamp-1">{displayAddress}</span>
                </div>
              </div>
            </div>

            {/* QR CODE & PENGESAHAN KEPALA SEKOLAH */}
            <div className="relative z-10 flex items-center justify-between gap-2 mt-1 px-1 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200">
              {/* QR Code Presisi Absensi */}
              <div className="flex flex-col items-center">
                <div className="p-1 bg-white border border-emerald-900 rounded-md shadow-2xs">
                  <div className="w-14 h-14 bg-white flex items-center justify-center overflow-hidden">
                    {qrUrl ? (
                      <img src={qrUrl} alt={`QR ${displayName}`} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400">
                        QR Code
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[6.5px] font-black text-emerald-900 uppercase tracking-tight mt-0.5">
                  PINDAI ABSENSI
                </span>
              </div>

              {/* Pengesahan Kepala Sekolah */}
              <div className="flex-1 text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[6.5px] text-slate-600 font-medium">
                  {displayCityDate}
                </p>
                <p className="text-[7px] font-bold text-slate-800">
                  Kepala Sekolah,
                </p>

                {/* Barcode Tanda Tangan Elektronik (TTE) Kepala Sekolah */}
                <div className="my-0.5 flex flex-col items-center justify-center">
                  <HeadmasterBarcode
                    customBarcodeUrl={settings.headmasterBarcodeUrl}
                    size={38}
                    className="shrink-0"
                  />
                  <span className="text-[5px] font-black text-emerald-900 tracking-tighter uppercase leading-none mt-0.5">
                    TTE RESMI KEPSEK
                  </span>
                </div>

                {/* Nama Kepala Sekolah & NIP */}
                <p className="text-[7.5px] font-black text-slate-950 underline leading-tight truncate max-w-[130px]">
                  {displayHeadmaster}
                </p>
                <p className="text-[6.5px] font-mono text-slate-600 leading-none mt-0.5">
                  {displayHeadmasterNip}
                </p>
              </div>
            </div>

            {/* KETENTUAN TATA TERTIB & FOOTER */}
            <div className="relative z-10 mt-1 border-t border-emerald-200/80 pt-1 text-center">
              <p className="text-[6px] text-slate-500 leading-tight">
                <strong>Catatan:</strong> Wajib dibawa saat presensi sekolah & peminjaman perpustakaan. Bila hilang segera lapor TU.
              </p>
              <div className="flex items-center justify-between text-[6.5px] font-bold text-emerald-900 mt-0.5 px-1">
                <span>SEKOLAH FORMAL</span>
                <span className="text-amber-800">{displayValidity}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TEMPLATE 3: SMART CARD KONTEMPORER (DARK SLATE, CYAN & TUT WURI)          */}
        {/* ========================================================================= */}
        {templateId === 'pelita' && (
          <div className="w-full h-full flex flex-col justify-between relative bg-white p-2.5 pt-1.5 overflow-hidden">
            {/* Watermark Logo Resmi Sekolah di Tengah Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
              <SchoolLogo size={160} />
            </div>

            {/* Top Dark Slate Banner */}
            <div className="relative z-10 -mx-2.5 -mt-1.5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white p-2 pb-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                {/* Logo Resmi Sekolah SDN Kecil Ogomojolo */}
                <div className="shrink-0 p-0.5 bg-white/10 rounded-md border border-cyan-400/40">
                  <SchoolLogo size={30} title="Logo Resmi SDN Kecil Ogomojolo" />
                </div>

                <div className="flex-1 text-center min-w-0 pr-1">
                  <h6 className="text-[6.5px] font-extrabold text-cyan-300 uppercase tracking-widest leading-none">
                    {displayDepartment}
                  </h6>
                  <h4 className="text-[9px] font-black text-white uppercase tracking-tight leading-tight mt-0.5 truncate">
                    {displaySchool}
                  </h4>
                  <p className="text-[6px] text-slate-300 font-light leading-tight truncate">
                    {displaySchoolAddress}
                  </p>
                </div>
              </div>

              {/* Cyan & Orange Modern Line */}
              <div className="mt-1 flex items-center justify-center h-[1.5px] bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-500" />
            </div>

            {/* BANNER JUDUL SMART CARD */}
            <div className="relative z-10 flex items-center justify-between px-1 my-0.5">
              <span className="text-[8px] font-black text-slate-900 tracking-wider uppercase">
                SMART STUDENT ID & ATTENDANCE
              </span>
              <span className="text-[6.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300">
                ACTIVE
              </span>
            </div>

            {/* BIODATA LENGKAP & PASFOTO DENGAN CHIP ORNAMEN */}
            <div className="relative z-10 flex gap-2 items-start px-0.5">
              {/* Foto Siswa & Smart Chip */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative p-0.5 bg-white border-2 border-cyan-700 rounded-md shadow-xs overflow-hidden">
                  <div className="w-16 h-20 bg-slate-100 rounded-xs overflow-hidden flex items-center justify-center">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-user text-xl text-slate-400" />
                    )}
                  </div>

                  {/* Simulated Golden Smart Chip Icon */}
                  <div className="absolute top-1 left-1 w-3.5 h-3 rounded-xs bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-amber-700/60 flex items-center justify-center shadow-2xs pointer-events-none opacity-90">
                    <div className="w-2 h-1.5 border border-amber-800/40 rounded-3xs" />
                  </div>

                  {/* STEMPEL DINAS RESMI BULAT */}
                  <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full border-2 border-cyan-800/80 bg-cyan-500/10 backdrop-blur-[0.5px] flex flex-col items-center justify-center pointer-events-none rotate-[-8deg]">
                    <div className="w-9 h-9 rounded-full border border-dashed border-cyan-800/80 flex flex-col items-center justify-center text-center p-0.5">
                      <span className="text-[4px] font-black text-cyan-950 tracking-tighter uppercase leading-none">
                        SMART
                      </span>
                      <i className="fa-solid fa-qrcode text-[4px] text-cyan-800 my-0.5" />
                      <span className="text-[4px] font-black text-cyan-950 tracking-tighter uppercase leading-none">
                        VALID
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biodata Tabel Two-Column */}
              <div className="flex-1 min-w-0 text-[8px] space-y-0.5 text-slate-800 leading-tight">
                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">NIS / NISN</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-mono font-bold text-slate-900 truncate">
                    {displayNis} / {displayNisn}
                  </span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">Nama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-black text-[8.5px] text-slate-950 uppercase truncate">
                    {displayName}
                  </span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">TTL</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium truncate">{displayTTL}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">J. Kelamin</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayGender}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">Agama</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium">{displayReligion}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">Kelas</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-cyan-900">{displayClass}</span>
                </div>

                <div className="grid grid-cols-[52px_6px_1fr] items-baseline">
                  <span className="font-semibold text-cyan-900">Alamat</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-[7.5px] line-clamp-1">{displayAddress}</span>
                </div>
              </div>
            </div>

            {/* QR CODE & PENGESAHAN KEPALA SEKOLAH */}
            <div className="relative z-10 flex items-center justify-between gap-2 mt-1 px-1 bg-cyan-50/60 p-1.5 rounded-lg border border-cyan-200">
              {/* QR Code Presisi Absensi */}
              <div className="flex flex-col items-center">
                <div className="p-1 bg-white border border-cyan-800 rounded-md shadow-2xs">
                  <div className="w-14 h-14 bg-white flex items-center justify-center overflow-hidden">
                    {qrUrl ? (
                      <img src={qrUrl} alt={`QR ${displayName}`} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-400">
                        QR Code
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[6.5px] font-black text-cyan-900 uppercase tracking-tight mt-0.5">
                  SCAN ABSENSI
                </span>
              </div>

              {/* Pengesahan Kepala Sekolah */}
              <div className="flex-1 text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[6.5px] text-slate-600 font-medium">
                  {displayCityDate}
                </p>
                <p className="text-[7px] font-bold text-slate-800">
                  Kepala Sekolah,
                </p>

                {/* Barcode Tanda Tangan Elektronik (TTE) Kepala Sekolah */}
                <div className="my-0.5 flex flex-col items-center justify-center">
                  <HeadmasterBarcode
                    customBarcodeUrl={settings.headmasterBarcodeUrl}
                    size={38}
                    className="shrink-0"
                  />
                  <span className="text-[5px] font-black text-cyan-900 tracking-tighter uppercase leading-none mt-0.5">
                    TTE RESMI KEPSEK
                  </span>
                </div>

                {/* Nama Kepala Sekolah & NIP */}
                <p className="text-[7.5px] font-black text-slate-950 underline leading-tight truncate max-w-[130px]">
                  {displayHeadmaster}
                </p>
                <p className="text-[6.5px] font-mono text-slate-600 leading-none mt-0.5">
                  {displayHeadmasterNip}
                </p>
              </div>
            </div>

            {/* KETENTUAN TATA TERTIB & FOOTER */}
            <div className="relative z-10 mt-1 border-t border-slate-200 pt-1 text-center">
              <p className="text-[6px] text-slate-500 leading-tight">
                <strong>Ketentuan:</strong> Kartu digital resmi. Gunakan untuk tap absensi & pintu gerbang sekolah.
              </p>
              <div className="flex items-center justify-between text-[6.5px] font-bold text-slate-800 mt-0.5 px-1">
                <span className="font-mono">SN: 8892-{displayNis}</span>
                <span className="text-cyan-800">{displayValidity}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ISO Dimensions Tag */}
      <span className="text-[9.5px] font-mono text-slate-400 mt-1.5 no-print">
        Standar CR80: 85,60 × 53,98 mm • Logo Tut Wuri Handayani
      </span>
    </div>
  );
};
