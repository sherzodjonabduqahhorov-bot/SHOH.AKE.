import React, { useState, useMemo } from "react";
import { SavedRecord } from "../types";
import { getLocalDateStr, getLocalTimeStr, formatUzDate } from "../utils/dateUtils";
import { RecordDetailModal } from "./RecordDetailModal";
import { PinCodeModal } from "./PinCodeModal";
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Trash2,
  Car,
  X,
  FileSpreadsheet,
  CheckCircle2,
  CalendarDays,
  Flame,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  ListOrdered,
  Eye,
  Info,
  RotateCcw,
} from "lucide-react";

interface DailyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SavedRecord[];
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
  onAddRecord?: (rec: SavedRecord) => void;
  onLoadIntoEditor?: (rec: SavedRecord) => void;
  onOpenPinModal?: (action: () => void) => void;
}

export const DailyStatsModal: React.FC<DailyStatsModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
  onOpenPinModal,
  onDeleteRecord,
  onAddRecord,
  onLoadIntoEditor,
}) => {
  const [activeTab, setActiveTab] = useState<"days" | "all" | "add">("days");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDays, setExpandedDays] = useState<{ [date: string]: boolean }>({});
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<SavedRecord | null>(null);

  // State for Delete PIN (0203) confirmation
  const [deletePendingAction, setDeletePendingAction] = useState<{
    type: "single" | "all";
    recordId?: string;
    recordInfo?: string;
  } | null>(null);

  // Form state for adding custom record manually
  const [manualDate, setManualDate] = useState<string>(getLocalDateStr());
  const [manualTime, setManualTime] = useState<string>(getLocalTimeStr());
  const [manualDocNo, setManualDocNo] = useState<string>("");
  const [manualPlate, setManualPlate] = useState<string>("");
  const [manualOwner, setManualOwner] = useState<string>("");
  const [manualModel, setManualModel] = useState<string>("");
  const [manualBalloons, setManualBalloons] = useState<number>(2);

  const todayStr = getLocalDateStr();

  // Group records by date (YYYY-MM-DD)
  const recordsByDate = useMemo(() => {
    const map: { [date: string]: SavedRecord[] } = {};
    records.forEach((rec) => {
      const d = rec.dateStr || todayStr;
      if (!map[d]) {
        map[d] = [];
      }
      map[d].push(rec);
    });
    return map;
  }, [records, todayStr]);

  const availableDates = Object.keys(recordsByDate).sort((a, b) => (b > a ? 1 : -1));

  // Today count
  const todayRecords = recordsByDate[todayStr] || [];
  const todayCount = todayRecords.length;

  // Total count
  const totalCount = records.length;

  // Peak day calculation
  let peakDay = { date: "", count: 0 };
  availableDates.forEach((d) => {
    if (recordsByDate[d].length > peakDay.count) {
      peakDay = { date: d, count: recordsByDate[d].length };
    }
  });

  const toggleDayExpanded = (date: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [date]: prev[date] === undefined ? false : !prev[date],
    }));
  };

  // Filtered records for full list
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const plate = (r.davlatRagBelgisi || "").toLowerCase();
        const owner = (r.avtoulovEgasi || "").toLowerCase();
        const docNo = (r.docNo || "").toLowerCase();
        const model = (r.atbRusumi || "").toLowerCase();
        const time = (r.timeStr || "").toLowerCase();
        const date = (r.dateStr || "").toLowerCase();
        return (
          plate.includes(q) ||
          owner.includes(q) ||
          docNo.includes(q) ||
          model.includes(q) ||
          time.includes(q) ||
          date.includes(q)
        );
      }
      return true;
    });
  }, [records, searchQuery]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRecord) return;

    const newRec: SavedRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      dateStr: manualDate || todayStr,
      timeStr: manualTime || getLocalTimeStr(),
      docNo: manualDocNo || "—",
      davlatRagBelgisi: manualPlate.toUpperCase() || "—",
      avtoulovEgasi: manualOwner || "Noma'lum",
      atbRusumi: manualModel || "—",
      balloonsCount: manualBalloons || 2,
    };

    onAddRecord(newRec);
    // Reset form
    setManualPlate("");
    setManualOwner("");
    setManualDocNo("");
    setManualModel("");
    setActiveTab("days");
  };

  const exportToCsv = () => {
    if (records.length === 0) return;
    const headers = "Sana,Vaqt (Soat:Daqiqa),Guvohnoma No,Davlat Raqami,Avtoulov Egasi,Rusumi,Ballonlar Soni\n";
    const rows = records
      .map(
        (r) =>
          `"${r.dateStr}","${r.timeStr}","${r.docNo}","${r.davlatRagBelgisi}","${r.avtoulovEgasi}","${r.atbRusumi}","${r.balloonsCount}"`
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `kushon_kunlik_va_soatlik_hisobot_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <CalendarDays size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-wide flex items-center gap-2">
                  Har Kunlik & Soatlik Hisobotlar
                  <span className="bg-orange-500/30 text-orange-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-400/30">
                    Hisobot Jurnali
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Har bir qatordagi avtomobil ustiga bossangiz, uning to'liq ma'lumotlari ochiladi
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

          {/* Top Summary Cards */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Today Card */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-orange-500 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                <Flame size={13} /> Bugun (1 kunda)
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{todayCount}</span>
                <span className="text-xs font-semibold text-slate-500">ta mashina</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium truncate">
                {formatUzDate(todayStr)}
              </div>
            </div>

            {/* Total All Time Card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Award size={13} /> Jami barcha vaqt
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
                <span className="text-xs font-semibold text-slate-500">ta guvohnoma</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-500" /> Barcha kunlar
              </div>
            </div>

            {/* Days Count Card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar size={13} /> Ishlangan kunlar
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{availableDates.length}</span>
                <span className="text-xs font-semibold text-slate-500">kun</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                O'rtacha: {availableDates.length > 0 ? (totalCount / availableDates.length).toFixed(1) : 0} ta/kun
              </div>
            </div>

            {/* Peak Day Card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <TrendingUp size={13} /> Eng ko'p kun
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{peakDay.count}</span>
                <span className="text-xs font-semibold text-slate-500">ta rekord</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-medium truncate">
                {peakDay.date ? formatUzDate(peakDay.date) : "—"}
              </div>
            </div>
          </div>

          {/* View Tabs & Search Bar */}
          <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab("days")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                  activeTab === "days"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers size={14} className={activeTab === "days" ? "text-orange-600" : ""} />
                Kunlar bo'yicha ({availableDates.length} kun)
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListOrdered size={14} className={activeTab === "all" ? "text-orange-600" : ""} />
                Soatlik jurnal ({records.length} ta)
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                  activeTab === "add"
                    ? "bg-white text-orange-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Plus size={14} className="text-orange-600" />
                + Qo'lda yozuv kiritish
              </button>
            </div>

            {/* Search Input */}
            {activeTab !== "add" && (
              <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[200px]">
                <div className="relative w-full">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Raqam, egasi yoki soat bo'yicha..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportToCsv}
                disabled={records.length === 0}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer"
                title="Excel (CSV) formatida barcha kunlik hisobotni yuklab olish"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                Excelga yuklash
              </button>
              {records.length > 0 && (
                <button
                  onClick={() => {
                    setDeletePendingAction({
                      type: "all",
                      recordInfo: "Barcha hisobot tarixini",
                    });
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold px-2 py-1.5 rounded-lg transition text-xs cursor-pointer"
                  title="PIN (0203) bilan tozalash"
                >
                  <Trash2 size={13} />
                  Tozalash
                </button>
              )}
            </div>
          </div>

          {/* Hint bar */}
          <div className="px-5 py-2 bg-orange-50/70 border-b border-orange-100 text-[11px] text-orange-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <Info size={13} className="text-orange-600 shrink-0" />
              <span>
                Avtomobil qatori yoki <b>Guvohnoma raqami</b> ustiga bossangiz, uning qanday o'tkazilgani to'liq ochiladi.
              </span>
            </div>
            <span className="text-[10px] text-orange-700 hidden sm:inline-block">
              (Batafsil ko'rish & Qayta chop etish)
            </span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100/60">
            {activeTab === "add" ? (
              /* TAB 3: MANUAL ENTRY FORM */
              <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Yangi hisobot yozuvini qo'lda kiritish</h3>
                    <p className="text-xs text-slate-500">Bugungi yoki oldingi kunlardagi mashinalarni hisobga qo'shish</p>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar size={13} className="text-orange-500" /> Sana (Chisla):
                      </label>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock size={13} className="text-orange-500" /> Soati (Vaqt):
                      </label>
                      <input
                        type="time"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Davlat Raqami:</label>
                      <input
                        type="text"
                        placeholder="Masalan: 50 A 123 AA"
                        value={manualPlate}
                        onChange={(e) => setManualPlate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold uppercase text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Guvohnoma No:</label>
                      <input
                        type="text"
                        placeholder="Masalan: 1666284"
                        value={manualDocNo}
                        onChange={(e) => setManualDocNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Avtoulov Egasi:</label>
                      <input
                        type="text"
                        placeholder="Masalan: Karimov Alisher"
                        value={manualOwner}
                        onChange={(e) => setManualOwner(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Rusumi:</label>
                      <input
                        type="text"
                        placeholder="Masalan: Cobalt / Nexia 3 / Lacetti"
                        value={manualModel}
                        onChange={(e) => setManualModel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ballonlar soni:</label>
                    <select
                      value={manualBalloons}
                      onChange={(e) => setManualBalloons(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value={1}>1 ta ballon</option>
                      <option value={2}>2 ta ballon</option>
                      <option value={3}>3 ta ballon</option>
                      <option value={4}>4 ta ballon</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("days")}
                      className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={15} />
                      Hisobotga qo'shish
                    </button>
                  </div>
                </form>
              </div>
            ) : records.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400 mb-3">
                  <Car size={32} />
                </div>
                <p className="text-sm font-bold text-slate-600">Hozircha hisobotlar mavjud emas</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  Guvohnomani chop etsangiz yoki <b>"+ Qo'lda yozuv kiritish"</b> orqali kiritsangiz, bu yerda sanasi va soati bilan to'liq chiqadi.
                </p>
              </div>
            ) : activeTab === "days" ? (
              /* TAB 1: DAY BY DAY GROUPED ACCORDION VIEW */
              <div className="space-y-3">
                {availableDates.map((dateStr) => {
                  const dayRecords = recordsByDate[dateStr] || [];
                  const isToday = dateStr === todayStr;
                  const isExpanded = expandedDays[dateStr] !== false; // Default expanded

                  // Filter day records if search is active
                  const visibleInDay = searchQuery.trim()
                    ? dayRecords.filter((r) => {
                        const q = searchQuery.toLowerCase();
                        return (
                          (r.davlatRagBelgisi || "").toLowerCase().includes(q) ||
                          (r.avtoulovEgasi || "").toLowerCase().includes(q) ||
                          (r.docNo || "").toLowerCase().includes(q) ||
                          (r.atbRusumi || "").toLowerCase().includes(q) ||
                          (r.timeStr || "").toLowerCase().includes(q)
                        );
                      })
                    : dayRecords;

                  if (searchQuery.trim() && visibleInDay.length === 0) return null;

                  return (
                    <div
                      key={dateStr}
                      className={`bg-white rounded-xl border transition shadow-xs overflow-hidden ${
                        isToday ? "border-orange-400 ring-1 ring-orange-400/20" : "border-slate-200"
                      }`}
                    >
                      {/* Day Header Row */}
                      <div
                        onClick={() => toggleDayExpanded(dateStr)}
                        className="px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer select-none transition border-b border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {formatUzDate(dateStr)}
                              {isToday && (
                                <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                  BUGUN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Sana: <b>{dateStr}</b></span>
                              <span>•</span>
                              <span>Birinchi avto: <b>{dayRecords[dayRecords.length - 1]?.timeStr || "—"} da</b></span>
                              <span>•</span>
                              <span>Oxirgi avto: <b>{dayRecords[0]?.timeStr || "—"} da</b></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] text-slate-500 font-semibold block">1 kunda jami:</span>
                            <span className="text-sm sm:text-base font-extrabold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                              {dayRecords.length} ta avtomobil
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Day Records Table */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3 w-10 text-center">№</th>
                                <th className="py-2.5 px-3">Soati (Vaqti)</th>
                                <th className="py-2.5 px-3">Guvohnoma No</th>
                                <th className="py-2.5 px-3">Davlat Raqami</th>
                                <th className="py-2.5 px-3">Avtoulov Egasi</th>
                                <th className="py-2.5 px-3">Rusumi</th>
                                <th className="py-2.5 px-3 text-center">Ballon</th>
                                <th className="py-2.5 px-3 text-center">Ko'rish</th>
                                <th className="py-2.5 px-3 text-right w-10">O'chirish</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {visibleInDay.map((r, idx) => (
                                <tr
                                  key={r.id}
                                  onClick={() => setSelectedRecordForDetail(r)}
                                  className="hover:bg-orange-50/70 transition group cursor-pointer"
                                  title="Batafsil ma'lumotlarini ko'rish uchun bosing"
                                >
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-orange-300">
                                      <Clock size={11} className="text-orange-500" />
                                      {r.timeStr}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 group-hover:underline">
                                    {r.docNo || "—"}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-black text-slate-900 uppercase">
                                    {r.davlatRagBelgisi && r.davlatRagBelgisi !== "—" ? (
                                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-orange-300">
                                        {r.davlatRagBelgisi}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-slate-800">
                                    {r.avtoulovEgasi || "—"}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">
                                    {r.atbRusumi || "—"}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                      {r.balloonsCount} ta
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRecordForDetail(r);
                                      }}
                                      className="inline-flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold px-2 py-1 rounded text-[11px] transition shadow-2xs cursor-pointer"
                                      title="Barcha ma'lumotlarini ochish"
                                    >
                                      <Eye size={12} />
                                      Ko'rish
                                    </button>
                                  </td>
                                  <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletePendingAction({
                                          type: "single",
                                          recordId: r.id,
                                          recordInfo: `№ ${r.docNo} (${r.davlatRagBelgisi || "Avtomobil"})`,
                                        });
                                      }}
                                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                                      title="O'chirish (PIN: 0203)"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TAB 2: FULL CHRONOLOGICAL JOURNAL TABLE */
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">№</th>
                      <th className="p-3">Sana (Chisla)</th>
                      <th className="p-3">Soati</th>
                      <th className="p-3">Guvohnoma No</th>
                      <th className="p-3">Davlat Raqami</th>
                      <th className="p-3">Avtoulov Egasi</th>
                      <th className="p-3">Rusumi</th>
                      <th className="p-3 text-center">Ballon</th>
                      <th className="p-3 text-center">Ko'rish</th>
                      <th className="p-3 text-right w-10">O'chirish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((r, idx) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRecordForDetail(r)}
                        className="hover:bg-orange-50/70 transition group cursor-pointer"
                        title="Batafsil ma'lumotlarini ko'rish uchun bosing"
                      >
                        <td className="p-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar size={12} className="text-orange-500" />
                            {formatUzDate(r.dateStr)}
                          </div>
                          {r.dateStr === todayStr && (
                            <span className="text-[10px] font-bold text-orange-600 block mt-0.5">
                              Bugun
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-orange-300">
                            <Clock size={11} className="text-orange-500" />
                            {r.timeStr}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-700 group-hover:underline">
                          {r.docNo || "—"}
                        </td>
                        <td className="p-3 font-mono font-black text-slate-900 uppercase">
                          {r.davlatRagBelgisi && r.davlatRagBelgisi !== "—" ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-orange-300">
                              {r.davlatRagBelgisi}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {r.avtoulovEgasi || "—"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {r.atbRusumi || "—"}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {r.balloonsCount} ta
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecordForDetail(r);
                            }}
                            className="inline-flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold px-2.5 py-1 rounded text-[11px] transition shadow-2xs cursor-pointer"
                            title="Barcha ma'lumotlarini ochish"
                          >
                            <Eye size={12} />
                            Ko'rish
                          </button>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletePendingAction({
                                type: "single",
                                recordId: r.id,
                                recordInfo: `№ ${r.docNo} (${r.davlatRagBelgisi || "Avtomobil"})`,
                              });
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                            title="O'chirish (PIN: 0203)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Hisobot xulosasi:</span>
              <span>Bugun (1 kunda): <b>{todayCount} ta</b></span>
              <span>•</span>
              <span>Jami barcha kunlar: <b>{totalCount} ta</b></span>
            </div>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      <RecordDetailModal
        record={selectedRecordForDetail}
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onLoadIntoEditor={(rec) => {
          if (onLoadIntoEditor) {
            onLoadIntoEditor(rec);
            onClose();
          }
        }}
      />

      {/* Delete PIN Confirmation Modal (PIN: 0203) */}
      <PinCodeModal
        isOpen={!!deletePendingAction}
        requiredPin="0203"
        title="O'chirish PIN Kodi"
        description={
          deletePendingAction?.type === "all"
            ? "Barcha hisobotlar tarixini butunlay o'chirish uchun PIN kodni (0203) kiriting:"
            : `${deletePendingAction?.recordInfo || "Tanlangan yozuv"}ni o'chirish uchun PIN kodni (0203) kiriting:`
        }
        onClose={() => setDeletePendingAction(null)}
        onSuccess={() => {
          if (!deletePendingAction) return;
          if (deletePendingAction.type === "single" && deletePendingAction.recordId) {
            onDeleteRecord(deletePendingAction.recordId);
          } else if (deletePendingAction.type === "all") {
            onClearHistory();
          }
          setDeletePendingAction(null);
        }}
      />
    </>
  );
};
