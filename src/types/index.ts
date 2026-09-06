export type UserRole = 'siswa' | 'guru' | 'admin';

export interface UserProgress {
  materi: number;
  video: number;
  lkpd: number;
  evaluasi: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  class?: string;
  nip?: string;
  avatar: string;
  sessionToken?: string | null;
  deviceId?: string | null;
  progress?: UserProgress;
  readAnnouncements?: string[];
}

export interface Material {
  id: string;
  title: string;
  badge: string;
  content: string;
  fraction?: [number, number];
}

export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  url: string;
  desc?: string;
}

export interface LKPDItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pdfFilename: string;
  pdfUrl?: string;
  objectives: string;
}

export interface LKPDSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  lkpdId: string;
  photoUrl: string;
  date: string;
  aiScore: number;
  aiFeedback: string;
  teacherScore: number | null;
  teacherFeedback: string;
  status: 'Terkumpul' | 'Dinilai';
}

export interface EssayQuestion {
  id: string;
  title: string;
  prompt: string;
  sampleAnswer?: string;
  discussion: string;
  weight: number;
}

export interface AntiCheatLogRecord {
  timestamp: string;
  incident: string;
  durationSeconds: number;
}

export interface AntiCheatReport {
  switchCount: number;
  totalLeaveSeconds: number;
  log: AntiCheatLogRecord[];
}

export interface EvaluationSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  date: string;
  score: number;
  textAnswers: Record<string, string>;
  photoProof: string;
  antiCheat: AntiCheatReport;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  isImportant?: boolean;
}

export interface Reflection {
  id: string;
  studentName: string;
  date: string;
  emoji: string;
  easy: string;
  challenge: string;
}

export interface DatabaseState {
  system: {
    version: string;
    appName: string;
    school: string;
    subject: string;
  };
  settings: {
    soundEnabled: boolean;
    darkMode: boolean;
  };
  users: User[];
  materials: Material[];
  videos: VideoLesson[];
  lkpdList: LKPDItem[];
  lkpdSubmissions: LKPDSubmission[];
  evaluationQuestions: EssayQuestion[];
  evaluationSubmissions: EvaluationSubmission[];
  announcements: Announcement[];
  reflections: Reflection[];
}
