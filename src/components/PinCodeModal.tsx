import React, { useState, useEffect, useRef } from "react";
import { Lock, KeyRound, X, AlertCircle, ShieldCheck } from "lucide-react";

interface PinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  requiredPin?: string;
}

export const PinCodeModal: React.FC<PinCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Xavfsizlik PIN Kodi",
  description = "Kunlik hisobotlar jurnalini ochish uchun 4 xonali PIN kodni kiriting:",
  requiredPin = "0991",
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const REQUIRED_PIN = requiredPin;

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === REQUIRED_PIN) {
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
      setPin("");
      inputRef.current?.focus();
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        if (nextPin === REQUIRED_PIN) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 100);
        } else {
          setTimeout(() => {
            setError(true);
            setPin("");
          }, 100);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">PIN kod bilan himoyalangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed font-medium">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* PIN Display boxes */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-13 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono transition-all ${
                      error
                        ? "border-red-500 bg-red-50 text-red-600 animate-shake"
                        : isFilled
                        ? "border-orange-500 bg-orange-50/70 text-orange-600 shadow-xs scale-105"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    {isFilled ? "•" : ""}
                  </div>
                );
              })}
            </div>

            {/* Invisible input for hardware keyboard input */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
                setError(false);
                if (val.length === 4) {
                  if (val === REQUIRED_PIN) {
                    setTimeout(() => {
                      onSuccess();
                      onClose();
                    }, 100);
                  } else {
                    setTimeout(() => {
                      setError(true);
                      setPin("");
                    }, 100);
                  }
                }
              }}
              className="opacity-0 absolute -z-10"
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-3">
                <AlertCircle size={14} />
                Noto'g'ri PIN kod! Qaytadan kiriting.
              </div>
            )}

            {/* Numeric Keypad for direct on-screen clicks / touch */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  className="h-12 rounded-xl bg-slate-100 hover:bg-orange-100 hover:text-orange-700 active:bg-orange-200 font-bold text-slate-800 text-lg transition flex items-center justify-center cursor-pointer shadow-2xs select-none"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPin("");
                  setError(false);
                }}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition flex items-center justify-center cursor-pointer select-none"
              >
                Tozalash
              </button>
              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="h-12 rounded-xl bg-slate-100 hover:bg-orange-100 hover:text-orange-700 active:bg-orange-200 font-bold text-slate-800 text-lg transition flex items-center justify-center cursor-pointer shadow-2xs select-none"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-base font-bold transition flex items-center justify-center cursor-pointer select-none"
              >
                ⌫
              </button>
            </div>

            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound size={14} />
                Tasdiqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
