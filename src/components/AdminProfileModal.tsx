import React, { useState } from 'react';
import { Teacher, SystemSettings } from '../types';

interface AdminProfileModalProps {
  currentTeacher: Teacher;
  settings: SystemSettings;
  onUpdateTeacher: (updated: Teacher) => void;
  onUpdateSettings: (updated: SystemSettings) => void;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  currentTeacher,
  settings,
  onUpdateTeacher,
  onUpdateSettings,
  onClose,
}) => {
  // Admin Data Form
  const [name, setName] = useState(currentTeacher.name);
  const [nip, setNip] = useState(currentTeacher.nip || '');
  const [email, setEmail] = useState(currentTeacher.email);
  const [subject, setSubject] = useState(currentTeacher.subject);

  // School & Headmaster Data Form (for official reports / signature)
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolAddress, setSchoolAddress] = useState(settings.schoolAddress);
  const [schoolCity, setSchoolCity] = useState(settings.schoolCity || 'Jakarta Selatan');
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [lateCutoffTime, setLateCutoffTime] = useState(settings.lateCutoffTime);
  const [headmasterName, setHeadmasterName] = useState(settings.headmasterName || 'Drs. H. Mulyadi, M.Pd');
  const [headmasterNip, setHeadmasterNip] = useState(settings.headmasterNip || '19680512 199403 1 005');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Update current admin profile
    onUpdateTeacher({
      ...currentTeacher,
      name: name.trim(),
      nip: nip.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim() || 'Administrator Sekolah',
    });

    // Update School Settings
    onUpdateSettings({
      ...settings,
      schoolName: schoolName.trim() || 'SD NEGERI INDONESIA',
      schoolAddress: schoolAddress.trim(),
      schoolCity: schoolCity.trim() || 'Jakarta',
      academicYear: academicYear.trim() || '2025/2026',
      lateCutoffTime,
      headmasterName: headmasterName.trim(),
      headmasterNip: headmasterNip.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8 animate-scale-up space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer rounded-full hover:bg-slate-100 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
            <i className="fa-solid fa-user-gear"></i>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Edit Profil Admin & Identitas Sekolah</h3>
            <p className="text-xs text-slate-500">
              Ganti data default menjadi identitas asli Anda dan sekolah tujuan sebelum digunakan/dijual.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Profil Pribadi Admin */}
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-amber-700"></i>
              <span>Profil Pribadi Administrator</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Admin & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: MOH. FADLI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIP Admin (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="contoh: 199903202025211020"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Login Admin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: Fadli46046@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jabatan / Bagian
                </label>
                <input
                  type="text"
                  placeholder="contoh: Kurikulum & Administrasi / Kepala Sekolah / IT"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Sekolah & Jadwal */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-school text-indigo-600"></i>
              <span>Identitas Sekolah & Batas Waktu Masuk</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Sekolah / Instansi
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: SD NEGERI 1 INDONESIA"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kota / Kabupaten Sekolah
                </label>
                <input
                  type="text"
                  placeholder="contoh: Jakarta Selatan / Surabaya"
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  placeholder="contoh: 2025/2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Jam Batas Masuk (Presensi)
                </label>
                <input
                  type="time"
                  value={lateCutoffTime}
                  onChange={(e) => setLateCutoffTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alamat Sekolah
                </label>
                <input
                  type="text"
                  placeholder="contoh: Jl. Merdeka No. 10"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Data Kepala Sekolah untuk Tanda Tangan Laporan */}
          <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-file-signature text-indigo-700"></i>
              <span>Data Kepala Sekolah (Pengesahan Laporan PDF)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Kepala Sekolah & Gelar
                </label>
                <input
                  type="text"
                  placeholder="contoh: Drs. H. Mulyadi, M.Pd"
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  placeholder="contoh: 19680512 199403 1 005"
                  value={headmasterNip}
                  onChange={(e) => setHeadmasterNip(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i>
              <span>Simpan Profil Admin & Data Sekolah</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
