import React, { useState, useEffect, useRef } from "react";
import { DocumentState, BalloonRow, SavedRecord } from "./types";
import { TOP_QR_DEFAULT, BALLOON_QR_DEFAULT, STAMP_QR_DEFAULT } from "./assets/defaultImages";
import { DailyStatsModal } from "./components/DailyStatsModal";
import { PinCodeModal } from "./components/PinCodeModal";
import { getLocalDateStr, getLocalTimeStr, formatUzDate } from "./utils/dateUtils";
import {
  Printer,
  Plus,
  Edit3,
  Check,
  ExternalLink,
  Download,
  FileText,
  X,
  Sparkles,
  HelpCircle,
  BarChart3,
  RotateCcw,
  Save,
  Lock,
} from "lucide-react";
import {
  directPrint,
  downloadPrintableHtml,
  openBlobPrintWindow,
  generatePrintableHtml,
} from "./utils/printDocument";

const STORAGE_KEY = "kushon-texnik-guvohnoma-data-v2";
const STATS_STORAGE_KEY = "kushon-texnik-daily-records-v1";


function computeOneYearLater(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear() + 1;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}.${month}.${year}`;
}

const initialDefaultData: DocumentState = {
  docNo: "1666283",
  issueDate: "2026-08-23",
  expireDate: "23.08.2027",
  avtoulovEgasi: "",
  pinfl: "",
  atbRusumi: "",
  davlatRagBelgisi: "",
  ishlabChiqarYili: "",
  dvigatelRaqami: "",
  shassiRaqami: "",
  kuzovRaqami: "",
  km: "300000",
  ruleGuvohnomaNo: "1666283",
  ruleTamgaNo: "98550-1_695_09",
  topQr: TOP_QR_DEFAULT,
  footerKorxona: "KUSHON TEXNIK KO'RIK",
  footerManzil: "Manzil: Kosonsoy tuman, Xumxona zapravkasi o'rnida",
  footerTelefon: "+9989-77-131-55-55",
  footerBuyurtmachi: "",
  footerShaxsi: "Tursonov Sherzod",
  stampQr: STAMP_QR_DEFAULT,
  balloons: [
    {
      id: 1,
      davlat: "Uzbekiston",
      turi: "CNG",
      qrImg: BALLOON_QR_DEFAULT,
      raqamLabel: "",
      sigimi: "",
      ogirligi: "",
      sanasi1: "",
      sanasi2: "",
    },
    {
      id: 2,
      davlat: "Uzbekiston",
      turi: "CNG",
      qrImg: BALLOON_QR_DEFAULT,
      raqamLabel: "",
      sigimi: "",
      ogirligi: "",
      sanasi1: "",
      sanasi2: "",
    },
  ],
};

export default function App() {
  const [data, setData] = useState<DocumentState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialDefaultData,
          ...parsed,
          topQr: parsed.topQr || TOP_QR_DEFAULT,
          stampQr: parsed.stampQr || STAMP_QR_DEFAULT,
          balloons: Array.isArray(parsed.balloons) && parsed.balloons.length > 0
            ? parsed.balloons.map((b: BalloonRow, i: number) => ({
                ...b,
                id: i + 1,
                qrImg: b.qrImg || BALLOON_QR_DEFAULT,
              }))
            : initialDefaultData.balloons,
        };
      }
    } catch (e) {
      console.error("Failed to parse localStorage data", e);
    }
    return initialDefaultData;
  });

  const [editMode, setEditMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState<"A4" | "A3">("A4");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Daily records list
  const [records, setRecords] = useState<SavedRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse daily records", e);
    }
    return [];
  });

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Failed to save daily records", e);
    }
  }, [records]);

  // Compute today's count using local timezone date
  const todayStr = getLocalDateStr();
  const todayCount = records.filter((r) => (r.dateStr || todayStr) === todayStr).length;

  // Open daily stats protected by PIN (0991)
  const handleOpenStats = () => {
    setShowPinModal(true);
  };

  // Function to register/sync a document in daily records
  const registerCurrentDoc = (forceNew = false) => {
    const dateStr = getLocalDateStr();
    const timeStr = getLocalTimeStr();
    const docId = data.docNo ? data.docNo.trim() : "—";
    const plate = data.davlatRagBelgisi ? data.davlatRagBelgisi.trim().toUpperCase() : "—";
    const owner = data.avtoulovEgasi ? data.avtoulovEgasi.trim() : "Noma'lum";

    const newRecord: SavedRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      dateStr,
      timeStr,
      docNo: docId,
      avtoulovEgasi: owner,
      davlatRagBelgisi: plate,
      atbRusumi: data.atbRusumi || "—",
      balloonsCount: data.balloons.length,
      docSnapshot: JSON.parse(JSON.stringify(data)),
    };

    setRecords((prev) => {
      if (forceNew) {
        return [newRecord, ...prev];
      }
      // Look for existing record with same docNo and plate today
      const existingIndex = prev.findIndex(
        (r) => r.dateStr === dateStr && (r.docNo === docId || (plate !== "—" && r.davlatRagBelgisi === plate))
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          docNo: docId,
          avtoulovEgasi: owner,
          davlatRagBelgisi: plate,
          atbRusumi: data.atbRusumi || "—",
          balloonsCount: data.balloons.length,
          docSnapshot: JSON.parse(JSON.stringify(data)),
        };
        return copy;
      } else {
        return [newRecord, ...prev];
      }
    });
  };

  const handleLoadRecordIntoEditor = (rec: SavedRecord) => {
    if (rec.docSnapshot) {
      setData(rec.docSnapshot);
      showToast(`№ ${rec.docNo} (${rec.davlatRagBelgisi}) ma'lumotlari ekranga yuklandi!`);
    } else {
      setData((prev) => ({
        ...prev,
        docNo: rec.docNo !== "—" ? rec.docNo : prev.docNo,
        davlatRagBelgisi: rec.davlatRagBelgisi !== "—" ? rec.davlatRagBelgisi : prev.davlatRagBelgisi,
        avtoulovEgasi: rec.avtoulovEgasi !== "Noma'lum" ? rec.avtoulovEgasi : prev.avtoulovEgasi,
        atbRusumi: rec.atbRusumi !== "—" ? rec.atbRusumi : prev.atbRusumi,
      }));
      showToast(`№ ${rec.docNo} ma'lumotlari yuklandi!`);
    }
  };

  const handleManualAddRecord = () => {
    registerCurrentDoc(true);
    showToast(`Hisobga qo'shildi! (Bugun: ${todayCount + 1} ta)`);
  };

  const handleClearHistory = () => {
    setRecords([]);
    showToast("Hisobot tarixi tozalandi");
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast("Yozuv o'chirildi");
  };

  const handleAddCustomRecord = (newRec: SavedRecord) => {
    setRecords((prev) => [newRec, ...prev]);
    showToast(`Yangi yozuv hisobotga kiritildi!`);
  };

  const handleResetForNewCar = () => {
    // First save current vehicle into records if it had info
    if (data.avtoulovEgasi || data.davlatRagBelgisi) {
      registerCurrentDoc(false);
    }

    // Increment document number if possible
    let nextDocNo = data.docNo;
    const num = parseInt(data.docNo.replace(/\D/g, ""), 10);
    if (!isNaN(num)) {
      nextDocNo = String(num + 1);
    }

    setData((prev) => ({
      ...prev,
      docNo: nextDocNo,
      ruleGuvohnomaNo: nextDocNo,
      avtoulovEgasi: "",
      pinfl: "",
      atbRusumi: "",
      davlatRagBelgisi: "",
      ishlabChiqarYili: "",
      dvigatelRaqami: "",
      shassiRaqami: "",
      kuzovRaqami: "",
      km: "300000",
      footerBuyurtmachi: "",
      balloons: [
        {
          id: 1,
          davlat: "Uzbekiston",
          turi: "CNG",
          qrImg: BALLOON_QR_DEFAULT,
          raqamLabel: "",
          sigimi: "",
          ogirligi: "",
          sanasi1: "",
          sanasi2: "",
        },
        {
          id: 2,
          davlat: "Uzbekiston",
          turi: "CNG",
          qrImg: BALLOON_QR_DEFAULT,
          raqamLabel: "",
          sigimi: "",
          ogirligi: "",
          sanasi1: "",
          sanasi2: "",
        },
      ],
    }));

    showToast(`Keyingi mashinaga o'tildi (№${nextDocNo})`);
  };

  // File upload state for replacing QR codes
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUploadTargetRef = useRef<{ type: "top" | "stamp" | "balloon"; index?: number } | null>(null);

  // Auto-sync active document into today's count in real-time
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.docNo || data.davlatRagBelgisi || data.avtoulovEgasi) {
        registerCurrentDoc(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    data.docNo,
    data.davlatRagBelgisi,
    data.avtoulovEgasi,
    data.atbRusumi,
    data.balloons.length,
  ]);

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error("Storage error:", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const toggleEditMode = () => {
    setEditMode((prev) => {
      const next = !prev;
      if (next) {
        showToast("Istalgan maydon yoki QR rasmga bosib, o'zgartiring");
      }
      return next;
    });
  };

  const handleFieldChange = (field: keyof DocumentState, value: string) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "issueDate") {
        next.expireDate = computeOneYearLater(value);
      }
      if (field === "docNo") {
        next.ruleGuvohnomaNo = value;
      }
      return next;
    });
  };

  const handleBalloonChange = (index: number, field: keyof BalloonRow, value: string) => {
    setData((prev) => {
      const updated = [...prev.balloons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, balloons: updated };
    });
  };

  const addBalloonRow = () => {
    setData((prev) => {
      const newRow: BalloonRow = {
        id: prev.balloons.length + 1,
        davlat: "Uzbekiston",
        turi: "CNG",
        qrImg: BALLOON_QR_DEFAULT,
        raqamLabel: "",
        sigimi: "",
        ogirligi: "",
        sanasi1: "",
        sanasi2: "",
      };
      return { ...prev, balloons: [...prev.balloons, newRow] };
    });
    showToast("Yangi qator qo'shildi");
  };

  const deleteBalloonRow = (index: number) => {
    if (data.balloons.length <= 1) {
      alert("Kamida bitta qator qolishi kerak.");
      return;
    }
    setData((prev) => {
      const filtered = prev.balloons.filter((_, i) => i !== index);
      const reindexed = filtered.map((b, i) => ({ ...b, id: i + 1 }));
      return { ...prev, balloons: reindexed };
    });
    showToast("Qator o'chirildi");
  };

  const triggerQrUpload = (type: "top" | "stamp" | "balloon", index?: number) => {
    currentUploadTargetRef.current = { type, index };
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const target = currentUploadTargetRef.current;
    if (!target) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target.type === "top") {
        setData((prev) => ({ ...prev, topQr: result }));
      } else if (target.type === "stamp") {
        setData((prev) => ({ ...prev, stampQr: result }));
      } else if (target.type === "balloon" && target.index !== undefined) {
        setData((prev) => {
          const balloons = [...prev.balloons];
          if (balloons[target.index!]) {
            balloons[target.index!] = { ...balloons[target.index!], qrImg: result };
          }
          return { ...prev, balloons };
        });
      }
      showToast("Rasm yangilandi");
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = (paperSize: "A4" | "A3") => {
    registerCurrentDoc(true);
    setSelectedPaperSize(paperSize);
    setShowPrintModal(true);
    showToast(`${paperSize} chop etish ochildi (Bugungi hisobga qo'shildi)`);
    directPrint(paperSize);
  };

  const handleDownloadHtml = (paperSize: "A4" | "A3") => {
    registerCurrentDoc(true);
    downloadPrintableHtml(data, paperSize);
    showToast(`Hujjat ${paperSize} yuklab olindi (Bugungi hisobga qo'shildi)`);
  };

  const handleOpenInNewTab = (paperSize: "A4" | "A3") => {
    registerCurrentDoc(true);
    showToast("Yangi toza sahifada ochilmoqda...");
    openBlobPrintWindow(data, paperSize);
  };

  return (
    <div className="app-container" id="appRoot">
      {/* Hidden file input for uploading QR images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* High Density Industrial Brand Header */}
      <header className="high-density-header" id="brandHeader">
        <div className="brand" id="brandLogoGroup">
          <div className="brand-badge" id="brandBadge">K</div>
          <div>
            <span className="brand-title">Kushon Texnik</span>
            <span className="brand-subtitle">Industrial Machinery & Gas Solutions</span>
          </div>
        </div>
        
        {/* Right Header Stats & Actions */}
        <div className="header-meta flex items-center gap-3" id="headerMeta">
          {/* Daily Counter Live Widget Button */}
          <button
            type="button"
            id="dailyStatsHeaderBtn"
            onClick={handleOpenStats}
            className="flex items-center gap-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-300 hover:text-orange-200 px-3 py-1.5 rounded-lg transition text-xs font-bold shadow-xs cursor-pointer"
            title="Har kunlik va soatlik hisobotlar jurnalini ochish (PIN: 0991)"
          >
            <Lock size={13} className="text-orange-400" />
            <BarChart3 size={15} className="text-orange-400" />
            <span>Kunlik hisobotlar:</span>
            <span className="bg-orange-500 text-slate-950 px-1.5 py-0.2 rounded font-black text-xs">
              Bugun: {todayCount} ta
            </span>
            {records.length > todayCount && (
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
                (Jami: {records.length} ta)
              </span>
            )}
          </button>

          <div className="header-status-badge" id="systemStatusBadge">
            <span className="status-dot"></span>
            Tizim Faol
          </div>
          <span className="text-slate-400 text-xs hidden lg:inline">Kosonsoy, Namangan</span>
        </div>
      </header>

      {/* High Density Toolbar Controls */}
      <div className="toolbar-wrapper" id="toolbarWrapper">
        <div className="toolbar" id="mainToolbar">
          <div className="flex items-center gap-3">
            <h1 id="toolbarHeading" className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
              Texnik Ko'rik Guvohnomasi
            </h1>
            
            {/* Quick Record Badge in Toolbar */}
            <button
              type="button"
              onClick={handleOpenStats}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-orange-400 hover:text-orange-300 font-bold px-2.5 py-1 rounded border border-slate-700 transition cursor-pointer"
              title="Har kunlik va soatlik hisobotlar jurnalini ochish (PIN: 0991)"
            >
              <Lock size={12} className="text-orange-400" />
              <BarChart3 size={13} />
              <span>Hisobot: Bugun <b>{todayCount}</b> ta | Jami <b>{records.length}</b> ta</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap" id="toolbarActions">
            {/* Quick manual record count button */}
            <button
              type="button"
              id="manualAddCountBtn"
              onClick={handleManualAddRecord}
              className="doc-btn highlight"
              title="Ushbu mashinani hozirgi sana va vaqt bilan hisobotga yozib qo'yish"
            >
              <Save size={13} />
              + Hisobga olish
            </button>

            {/* New Car Reset */}
            <button
              type="button"
              id="newCarResetBtn"
              onClick={handleResetForNewCar}
              className="doc-btn"
              title="Keyingi yangi mashinaga o'tish (raqamni 1 taga oshirib, yangi forma ochadi)"
            >
              <RotateCcw size={13} />
              Keyingi mashina (+)
            </button>

            <button
              type="button"
              id="toggleEditModeBtn"
              onClick={toggleEditMode}
              className={`doc-btn secondary ${editMode ? "btn-active" : ""}`}
              title="Tahrirlash rejimini yoqish/o'chirish"
            >
              {editMode ? <Check size={13} /> : <Edit3 size={13} />}
              {editMode ? "Tahrirlash Rejimi" : "O'zgartirish"}
            </button>
            <button
              type="button"
              id="addRowBtn"
              onClick={addBalloonRow}
              className="doc-btn secondary"
              title="Gaz balloni qatorini qo'shish"
            >
              <Plus size={13} />
              Qator qo'shish
            </button>
            <button
              type="button"
              id="printA4Btn"
              onClick={() => handlePrint("A4")}
              className="doc-btn secondary"
              title="A4 formatida to'g'ridan-to'g'ri chop etish"
            >
              <Printer size={13} />
              Chop etish (A4)
            </button>
            <button
              type="button"
              id="printA3Btn"
              onClick={() => handlePrint("A3")}
              className="doc-btn secondary"
              title="A3 formatida chop etish"
            >
              <Printer size={13} />
              Chop etish (A3)
            </button>
            <button
              type="button"
              id="openTabPrintBtn"
              onClick={() => handleOpenInNewTab("A4")}
              className="doc-btn secondary"
              title="Alohida toza oynada ochish"
            >
              <ExternalLink size={13} />
              Yangi oynada
            </button>
            <button
              type="button"
              id="downloadHtmlBtn"
              onClick={() => handleDownloadHtml("A4")}
              className="doc-btn secondary"
              title="Chop etish faylini (.html) kompyuterga yuklab olish"
            >
              <Download size={13} />
              Yuklab olish
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Sheet Viewport */}
      <div className="document-viewport" id="documentViewport">
        <div className="sheet" id="printableSheet">
        {/* Top-left corner mark */}
        <div className="corner-mark" id="cornerMark">
          ( 1 )
        </div>

        {/* Top-right QR Code */}
        <div className="qr-corner" id="topQrContainer">
          <img
            id="topQrImg"
            className={`top-qr-img editable-qr ${editMode ? "pulse-hint" : ""}`}
            src={data.topQr}
            alt="Top QR"
            title="QR kodni almashtirish uchun bosing"
            onClick={() => triggerQrUpload("top")}
          />
        </div>

        {/* Header Titles */}
        <div className="header-row" id="docHeader">
          <div className="ilova" id="ilovaLabel">
            ILOVA D (MAJBURIY)
          </div>
          <div className="title-main" id="titleMain">
            GUVOHNOMA
          </div>
          <div className="doc-no" id="docNoRow">
            <span>№</span>
            <input
              type="text"
              id="docNo"
              value={data.docNo}
              onChange={(e) => {
                const val = e.target.value;
                setData((prev) => ({
                  ...prev,
                  docNo: val,
                  ruleGuvohnomaNo: val,
                }));
              }}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>
          <div className="issue-date-row" id="issueDateRow">
            <span>Berilgan sana:</span>&nbsp;
            <input
              type="date"
              id="issueDate"
              className={`issue-date-input ${editMode ? "pulse-hint" : ""}`}
              value={data.issueDate}
              onChange={(e) => handleFieldChange("issueDate", e.target.value)}
            />
            &nbsp;&nbsp;<span className="text-slate-400">|</span>&nbsp;&nbsp;
            <span>Tugagan sana:</span>&nbsp;
            <input
              type="text"
              id="expireDate"
              className={`issue-date-input ${editMode ? "pulse-hint" : ""}`}
              value={data.expireDate}
              onChange={(e) => handleFieldChange("expireDate", e.target.value)}
              placeholder="16.08.2027"
              title="Tugagan sanani tahrirlashingiz mumkin"
            />
          </div>
        </div>

        {/* Section banner */}
        <div className="section-banner-title" id="sectionBannerTitle">
          ATB* GA O'RNATILGAN GAZBALON(LAR)JINI SINOVDAN O'TGANI HAQIDA MA'LUMOT
        </div>

        {/* Vehicle & Owner Info Table */}
        <table className="info" id="vehicleInfoTable">
          <tbody>
            <tr id="infoRow1">
              <td style={{ width: "65%" }}>
                <span className="label">Avtoulov egasi</span>
                <input
                  type="text"
                  id="avtoulovEgasi"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.avtoulovEgasi}
                  onChange={(e) => handleFieldChange("avtoulovEgasi", e.target.value)}
                />
              </td>
              <td style={{ width: "35%" }}>
                <span className="label">PINFL</span>
                <input
                  type="text"
                  id="pinfl"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.pinfl}
                  onChange={(e) => handleFieldChange("pinfl", e.target.value)}
                />
              </td>
            </tr>
            <tr id="infoRow2">
              <td>
                <span className="label">ATB* rusumi</span>
                <input
                  type="text"
                  id="atbRusumi"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.atbRusumi}
                  onChange={(e) => handleFieldChange("atbRusumi", e.target.value)}
                />
              </td>
              <td>
                <span className="label">Davlat rag. belgisi</span>
                <input
                  type="text"
                  id="davlatRagBelgisi"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.davlatRagBelgisi}
                  onChange={(e) => handleFieldChange("davlatRagBelgisi", e.target.value)}
                />
              </td>
            </tr>
            <tr id="infoRow3">
              <td>
                <span className="label">Ishlab chiqar. yili</span>
                <input
                  type="text"
                  id="ishlabChiqarYili"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.ishlabChiqarYili}
                  onChange={(e) => handleFieldChange("ishlabChiqarYili", e.target.value)}
                />
              </td>
              <td>
                <span className="label">Dvigatel raqami</span>
                <input
                  type="text"
                  id="dvigatelRaqami"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.dvigatelRaqami}
                  onChange={(e) => handleFieldChange("dvigatelRaqami", e.target.value)}
                />
              </td>
            </tr>
            <tr id="infoRow4">
              <td>
                <span className="label">Shassi raqami</span>
                <input
                  type="text"
                  id="shassiRaqami"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.shassiRaqami}
                  onChange={(e) => handleFieldChange("shassiRaqami", e.target.value)}
                />
              </td>
              <td>
                <span className="label">Kuzov raqami</span>
                <input
                  type="text"
                  id="kuzovRaqami"
                  className={`cell-input strong-fill ${editMode ? "pulse-hint" : ""}`}
                  value={data.kuzovRaqami}
                  onChange={(e) => handleFieldChange("kuzovRaqami", e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mileage line */}
        <div className="weight-line" id="mileageRow">
          <span className="font-bold underline">Bosib o'tgan yo'li</span>
          <input
            type="text"
            id="km"
            className={`km ${editMode ? "pulse-hint" : ""}`}
            value={data.km}
            onChange={(e) => handleFieldChange("km", e.target.value)}
          />
          <span className="font-bold">KM</span>
        </div>

        {/* Regulatory rule citation */}
        <div className="rule-box-wrapper" id="regulatoryRuleText">
          <div className="rule-header-title">
            ATB* jamlanmasi meyoriy hujjatlar talabiga javob beradi
          </div>
          <div className="rule-text">
            Avtoulov <strong className="font-bold">CTG*</strong> tizimi bilan to'liq jixozlangan va qabul qilish - topshirish guvohnomaga №{" "}
            <input
              type="text"
              id="ruleGuvohnomaNo"
              className={`cell-input code ${editMode ? "pulse-hint" : ""}`}
              style={{ width: "105px", textAlign: "center", display: "inline-block", fontWeight: "bold" }}
              value={data.ruleGuvohnomaNo}
              onChange={(e) => handleFieldChange("ruleGuvohnomaNo", e.target.value)}
            />{" "}
            va javob beradi tamg'a №{" "}
            <input
              type="text"
              id="ruleTamgaNo"
              className={`cell-input code ${editMode ? "pulse-hint" : ""}`}
              style={{ width: "160px", textAlign: "center", display: "inline-block", fontWeight: "bold" }}
              value={data.ruleTamgaNo}
              onChange={(e) => handleFieldChange("ruleTamgaNo", e.target.value)}
            />{" "}
            "JAMLANMA" bo'yicha <strong className="font-bold">CTG*</strong> tizimlari{" "}
            <strong className="font-bold">TsH64</strong> - 19855069075:2014
          </div>
        </div>

        {/* Balloon table title */}
        <div className="table-caption" id="balloonTableCaption">
          O'rnatilgan<br />
          gaz<br />
          balon(lar)i<br />
          haqida<br />
          ma'lumot
        </div>

        {/* Gas Balloons Dynamic Table */}
        <table className="balloons" id="balloonsTable">
          <thead>
            <tr>
              <th style={{ width: "34px" }}>№</th>
              <th>Ishlab chiqargan davlat</th>
              <th style={{ width: "80px" }}>Turi</th>
              <th style={{ width: "115px" }}>Balon(lar) raqami</th>
              <th style={{ width: "75px" }}>Sig'imi (L)</th>
              <th style={{ width: "80px" }}>Og'irligi (kg)</th>
              <th style={{ width: "105px" }}>Sinovdan o'tkazilgan sanasi</th>
              <th style={{ width: "105px" }}>Sinovdan o'tkazilgan sana</th>
              <th style={{ width: "38px" }} className="print:hidden">
                Amal
              </th>
            </tr>
          </thead>
          <tbody id="balloonsTbody">
            {data.balloons.map((balloon, index) => (
              <tr key={balloon.id} id={`balloonRow_${balloon.id}`}>
                <td>{balloon.id}</td>
                <td>
                  <input
                    type="text"
                    value={balloon.davlat}
                    onChange={(e) => handleBalloonChange(index, "davlat", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={balloon.turi}
                    onChange={(e) => handleBalloonChange(index, "turi", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td className="qr-cell">
                  <div className="qr-box">
                    <img
                      className={`balloon-qr-img editable-qr ${editMode ? "pulse-hint" : ""}`}
                      src={balloon.qrImg}
                      alt={`Balloon ${balloon.id} QR`}
                      title="QR kodni almashtirish uchun bosing"
                      onClick={() => triggerQrUpload("balloon", index)}
                    />
                  </div>
                  <input
                    type="text"
                    className={`qr-num-input ${editMode ? "pulse-hint" : ""}`}
                    placeholder="raqam"
                    value={balloon.raqamLabel}
                    onChange={(e) => handleBalloonChange(index, "raqamLabel", e.target.value)}
                    title="Ballon raqami yoki kodi"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={balloon.sigimi}
                    onChange={(e) => handleBalloonChange(index, "sigimi", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={balloon.ogirligi}
                    onChange={(e) => handleBalloonChange(index, "ogirligi", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={balloon.sanasi1}
                    onChange={(e) => handleBalloonChange(index, "sanasi1", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={balloon.sanasi2}
                    onChange={(e) => handleBalloonChange(index, "sanasi2", e.target.value)}
                    className={editMode ? "pulse-hint" : ""}
                  />
                </td>
                <td className="print:hidden">
                  <button
                    type="button"
                    className="row-del-btn"
                    onClick={() => deleteBalloonRow(index)}
                    title="Qatorni o'chirish"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Details */}
        <div className="footer-grid" id="footerGrid">
          <div className="flabel">
            <span className="underline-text">Gazbalon(lar)ni</span>
            <span className="underline-text">sinovdan o'tkazgan</span>
            <span className="underline-text">korxona:</span>
          </div>
          <div className="fval-box">
            <input
              type="text"
              id="footerKorxona"
              value={data.footerKorxona}
              onChange={(e) => handleFieldChange("footerKorxona", e.target.value)}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>

          <div className="flabel">
            <span className="underline-text">Manzil:</span>
          </div>
          <div className="fval-box">
            <input
              type="text"
              id="footerManzil"
              value={data.footerManzil}
              onChange={(e) => handleFieldChange("footerManzil", e.target.value)}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>

          <div className="flabel">
            <span className="underline-text">Telefon:</span>
          </div>
          <div className="fval-box">
            <input
              type="text"
              id="footerTelefon"
              value={data.footerTelefon}
              onChange={(e) => handleFieldChange("footerTelefon", e.target.value)}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>

          <div className="flabel">
            <span className="underline-text">Buyurtmachi:</span>
          </div>
          <div className="fval-box">
            <input
              type="text"
              id="footerBuyurtmachi"
              value={data.footerBuyurtmachi}
              onChange={(e) => handleFieldChange("footerBuyurtmachi", e.target.value)}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>

          <div className="flabel">
            <span className="underline-text">Gazbalon(lar)ni</span>
            <span className="underline-text">sinovdan o'tkazgan</span>
            <span className="underline-text">shaxsi:</span>
          </div>
          <div className="fval-box">
            <input
              type="text"
              id="footerShaxsi"
              value={data.footerShaxsi}
              onChange={(e) => handleFieldChange("footerShaxsi", e.target.value)}
              className={editMode ? "pulse-hint" : ""}
            />
          </div>
        </div>

        {/* Stamp and Signature section */}
        <div className="stamp-row" id="stampSection">
          <div className="stamp-box" id="stampBox">
            <img
              id="stampQrImg"
              className={`stamp-qr-img editable-qr red-qr ${editMode ? "pulse-hint" : ""}`}
              src={data.stampQr}
              alt="Stamp QR"
              title="QR kodni almashtirish uchun bosing"
              onClick={() => triggerQrUpload("stamp")}
            />
          </div>
        </div>
        </div>
      </div>

      {/* Print Helper Modal */}
      {showPrintModal && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          id="printModalOverlay"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg max-w-md w-full shadow-2xl overflow-hidden p-5"
            id="printModalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <Printer size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                    Chop etish ({selectedPaperSize})
                  </h3>
                  <p className="text-xs text-slate-400">Kerakli usulni tanlang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2.5">
              {/* Option 1: Direct Browser Print */}
              <button
                type="button"
                onClick={() => {
                  directPrint(selectedPaperSize);
                }}
                className="w-full flex items-center justify-between p-3 rounded-md bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Printer size={18} />
                  <div>
                    <div className="text-sm leading-snug">Brauzerda Chop Etish</div>
                    <div className="text-xs text-slate-900/80 font-medium">To'g'ridan-to'g'ri chop etish dialogi</div>
                  </div>
                </div>
                <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono">Ctrl + P</span>
              </button>

              {/* Option 2: Open in clean Tab */}
              <button
                type="button"
                onClick={() => {
                  handleOpenInNewTab(selectedPaperSize);
                }}
                className="w-full flex items-center justify-between p-3 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-semibold transition text-left hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={18} className="text-sky-400" />
                  <div>
                    <div className="text-sm">Alohida Yangi Oynada Ochish</div>
                    <div className="text-xs text-slate-400">To'liq toza varaqda ochiladi</div>
                  </div>
                </div>
                <span className="text-xs text-sky-400 font-medium">Ochish →</span>
              </button>

              {/* Option 3: Download HTML */}
              <button
                type="button"
                onClick={() => {
                  handleDownloadHtml(selectedPaperSize);
                }}
                className="w-full flex items-center justify-between p-3 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-semibold transition text-left hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-emerald-400" />
                  <div>
                    <div className="text-sm">Fayl Sifatida Yuklab Olish (.html)</div>
                    <div className="text-xs text-slate-400">100% toza chop etish uchun tayyor fayl</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium">Yuklash ↓</span>
              </button>
            </div>

            <div className="mt-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle size={14} className="text-orange-400 shrink-0 mt-0.5" />
              <span>
                <strong>Maslahat:</strong> Agar brauzerda chop etish oynasi ochilmasa, <strong>"Yuklab olish"</strong> tugmasini bosing va faylni ochib <strong>Ctrl+P</strong> bosing.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Daily Statistics & Records Modal */}
      <DailyStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        records={records}
        onClearHistory={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
        onAddRecord={handleAddCustomRecord}
        onLoadIntoEditor={handleLoadRecordIntoEditor}
        onOpenPinModal={(action) => {
          setShowPinModal(true);
        }}
      />

      {/* PIN Code Verification Modal (PIN: 0991) */}
      <PinCodeModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowStatsModal(true);
        }}
      />

      {/* Floating notification toast */}
      <div className={`edit-toast ${toastMessage ? "show" : ""}`} id="editToast">
        {toastMessage}
      </div>
    </div>
  );
}
