import React, { useEffect, useState } from 'react';
import { Student, SystemSettings } from '../types';
import { createStudentQRPayload, generateQRCodeDataURL } from '../utils/qr';

interface StudentCardModalProps {
  student: Student;
  settings: SystemSettings;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  settings,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = createStudentQRPayload(student);
    generateQRCodeDataURL(payload).then((url) => setQrDataUrl(url));
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Siswa_${student.nis}_${student.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-2 cursor-pointer no-print"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4 no-print">
          <i className="fa-solid fa-id-card text-indigo-600"></i>
          <span>Pratinjau Kartu Pelajar Digital</span>
        </h3>

        {/* Printable Student Card Container */}
        <div className="print-area bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-2 border-indigo-500/40 p-5 shadow-2xl relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Header / School Crest */}
          <div className="border-b-2 border-indigo-500/30 pb-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h4 className="font-black tracking-wider uppercase text-sm text-indigo-200">
                {settings.schoolName}
              </h4>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">{settings.schoolAddress}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold tracking-widest uppercase border border-indigo-500/30">
              KARTU TANDA PELAJAR DIGITAL
            </span>
          </div>

          {/* Card Body: Photo, Info, and QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Student Photo */}
            <div className="flex flex-col items-center justify-center">
              <img
                src={student.photo || student.avatarUrl}
                alt={student.name}
                className="w-24 h-28 object-cover rounded-xl border-2 border-indigo-400 shadow-md ring-2 ring-indigo-500/20"
              />
              <span className="mt-1.5 text-[9px] font-mono text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                {student.gender}
              </span>
            </div>

            {/* Student Details */}
            <div className="sm:col-span-2 space-y-2 text-left">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                  Nama Lengkap
                </span>
                <span className="font-extrabold text-sm text-white block leading-tight">
                  {student.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                    NIS
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-400">
                    {student.nis}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                    Kelas
                  </span>
                  <span className="font-bold text-xs text-emerald-400">
                    {student.classRoom}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                  Kontak Ortu
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {student.parentPhone}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-slate-200 block flex items-center justify-center sm:justify-start gap-1.5">
                <i className="fa-solid fa-qrcode text-indigo-400"></i>
                <span>KODE QR PRESENSI RESMI</span>
              </span>
              <p className="text-[10px] text-slate-400 max-w-[220px] mt-0.5">
                Pindai kode QR ini dengan kamera scanner presensi saat siswa tiba di sekolah.
              </p>
            </div>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR ${student.name}`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-white p-1.5 bg-white shadow-xl ring-2 ring-indigo-500/30 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                Memuat QR...
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-5 no-print">
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-download text-indigo-600"></i>
            <span>Unduh QR</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-print"></i>
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
