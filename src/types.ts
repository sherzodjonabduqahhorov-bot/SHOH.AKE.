export interface BalloonRow {
  id: number;
  davlat: string;
  turi: string;
  qrImg: string;
  raqamLabel: string;
  sigimi: string;
  ogirligi: string;
  sanasi1: string;
  sanasi2: string;
}

export interface SavedRecord {
  id: string;
  timestamp: string; // ISO string or date
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  docNo: string;
  avtoulovEgasi: string;
  davlatRagBelgisi: string;
  atbRusumi: string;
  balloonsCount: number;
  docSnapshot?: DocumentState; // Full saved document snapshot
}

export interface DocumentState {
  docNo: string;
  issueDate: string;
  expireDate: string;
  avtoulovEgasi: string;
  pinfl: string;
  atbRusumi: string;
  davlatRagBelgisi: string;
  ishlabChiqarYili: string;
  dvigatelRaqami: string;
  shassiRaqami: string;
  kuzovRaqami: string;
  km: string;
  ruleGuvohnomaNo: string;
  ruleTamgaNo: string;
  topQr: string;
  footerKorxona: string;
  footerManzil: string;
  footerTelefon: string;
  footerBuyurtmachi: string;
  footerShaxsi: string;
  stampQr: string;
  balloons: BalloonRow[];
}
