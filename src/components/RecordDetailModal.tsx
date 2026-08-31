import React from "react";
import { SavedRecord } from "../types";
import { formatUzDate } from "../utils/dateUtils";
import {
  Car,
  Calendar,
  Clock,
  FileText,
  User,
  Shield,
  Layers,
  X,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";

interface RecordDetailModalProps {
  record: SavedRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadIntoEditor?: (rec: SavedRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onLoadIntoEditor,
}) => {
  if (!isOpen || !record) return null;

  const snap = record.docSnapshot;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Car size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  O'tkazilgan Avtomobil Ma'lumotlari
                </h3>
                <span className="bg-orange-500/30 text-orange-300 text-xs font-semibold px-2 py-0.5 rounded-md border border-orange-400/30 font-mono">
                  № {record.docNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Sana: <b>{formatUzDate(record.dateStr)}</b></span>
                <span>•</span>
                <span>Soat: <b>{record.timeStr}</b> da</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Yopish"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {/* Main Info Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FileText size={14} className="text-orange-500" />
              Asosiy Guvohnoma Ma'lumotlari
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Davlat Raqami:</span>
                <span className="text-sm font-black text-slate-900 font-mono tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                  {record.davlatRagBelgisi || snap?.davlatRagBelgisi || "—"}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Guvohnoma Raqami:</span>
                <span className="text-sm font-bold text-blue-700 font-mono inline-block mt-0.5">
                  № {record.docNo}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Avtoulov Egasi:</span>
                <span className="text-xs font-bold text-slate-900 inline-block mt-0.5">
                  {record.avtoulovEgasi || snap?.avtoulovEgasi || "Noma'lum"}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Avtomobil Rusumi:</span>
                <span className="text-xs font-bold text-slate-900 inline-block mt-0.5">
                  {record.atbRusumi || snap?.atbRusumi || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Shield size={14} className="text-orange-500" />
              Texnik Ko'rsatkichlar & Sinov Natijasi
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Ko'rik Sanasi:</span>
                <span className="font-bold text-slate-800">
                  {snap?.issueDate || record.dateStr}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Amal Qilish Muddati:</span>
                <span className="font-bold text-slate-800">
                  {snap?.expireDate || "3 yil"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Ballonlar Soni:</span>
                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block">
                  {record.balloonsCount || snap?.balloons.length || 1} ta ballon
                </span>
              </div>

              {snap && (
                <>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Ishlab Chiqarilgan Yili:</span>
                    <span className="font-medium text-slate-800">{snap.ishlabChiqarYili || "—"}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Dvigatel Raqami:</span>
                    <span className="font-mono text-slate-800">{snap.dvigatelRaqami || "—"}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Kuzov / Shassi:</span>
                    <span className="font-mono text-slate-800">{snap.kuzovRaqami || snap.shassiRaqami || "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Balloon Rows if snapshot exists */}
          {snap && snap.balloons && snap.balloons.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Layers size={14} className="text-orange-500" />
                Ballonlar Jadvali
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 border-b border-r border-slate-200 text-center w-8">№</th>
                      <th className="p-2 border-b border-r border-slate-200">Davlat</th>
                      <th className="p-2 border-b border-r border-slate-200">Turi</th>
                      <th className="p-2 border-b border-r border-slate-200">Raqam</th>
                      <th className="p-2 border-b border-r border-slate-200">Sig'imi</th>
                      <th className="p-2 border-b border-r border-slate-200">Og'irligi</th>
                      <th className="p-2 border-b border-slate-200">Sinov Sanasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {snap.balloons.map((b, i) => (
                      <tr key={b.id || i} className="hover:bg-slate-50">
                        <td className="p-2 text-center font-bold text-slate-400 border-r border-slate-200">
                          {i + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200">{b.davlat || "—"}</td>
                        <td className="p-2 border-r border-slate-200">{b.turi || "—"}</td>
                        <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-200">
                          {b.raqamLabel || "—"}
                        </td>
                        <td className="p-2 border-r border-slate-200">{b.sigimi || "—"}</td>
                        <td className="p-2 border-r border-slate-200">{b.ogirligi || "—"}</td>
                        <td className="p-2 text-slate-600">
                          {b.sanasi1} - {b.sanasi2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Sinovdan muvaffaqiyatli o'tgan</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Ko'rik va sinov natijalari guvohnomada tasdiqlangan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Vaqt: <b className="text-slate-800">{record.dateStr} {record.timeStr}</b>
          </div>

          <div className="flex items-center gap-2">
            {onLoadIntoEditor && (
              <button
                type="button"
                onClick={() => {
                  onLoadIntoEditor(record);
                  onClose();
                }}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                title="Ushbu avtomobil ma'lumotlarini tahrirlash yoki qayta chop etish uchun ekranga yuklash"
              >
                <RotateCcw size={14} />
                Ekranga yuklash (Qayta chop etish)
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
