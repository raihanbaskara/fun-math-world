export type UserRole = 'siswa' | 'guru' | 'admin';

export interface UserProgress {
  materi: number;
  video: number;
  lkpd: number;
  latsol: number;
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
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  url: string;
  desc?: string;
}

export interface EssayQuestion {
  id: string;
  title: string;
  prompt: string;
  sampleAnswer?: string;
  discussion: string;
  weight: number;
}

export interface LKPDItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pdfFilename: string;
  pdfUrl?: string;
  objectives: string;
  questions: EssayQuestion[];
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

export interface LKPDEssayAnswer {
  textAnswer: string;
  photoUrl?: string;
  aiFeedback?: string;
  aiScore?: number;
}

export interface LKPDSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  lkpdId: string;
  photoUrl: string;
  photoUrls?: string[];
  answers?: Record<string, LKPDEssayAnswer>;
  date: string;
  aiScore: number;
  aiFeedback: string;
  teacherScore: number | null;
  teacherFeedback: string;
  antiCheat?: AntiCheatReport;
  status: 'Terkumpul' | 'Dinilai';
}

export interface LatsolQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface LatsolRoom {
  id: string;
  title: string;
  topic: string;
  badge: string;
  durationSeconds: number;
  isLockedByTeacher: boolean;
  questions: LatsolQuestion[];
}

export interface LatsolSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  roomId: string;
  roomTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: Record<string, number>;
  timeSpentSeconds: number;
  date: string;
  antiCheat?: AntiCheatReport;
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
  photoUrls?: string[];
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
  studentId?: string;
  studentName: string;
  studentClass?: string;
  date: string;
  emoji: string;
  easy: string;
  challenge: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: 'materi' | 'lkpd' | 'latsol' | 'evaluasi';
  topic: string;
  date: string;
  dueTime: string;
  status: 'Tersedia' | 'Segera' | 'Selesai';
  description: string;
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
  latsolRooms: LatsolRoom[];
  latsolSubmissions: LatsolSubmission[];
  evaluationQuestions: EssayQuestion[];
  evaluationSubmissions: EvaluationSubmission[];
  announcements: Announcement[];
  reflections: Reflection[];
  schedules: ScheduleItem[];
}
