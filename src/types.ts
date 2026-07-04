export interface TimetableEntry {
  id: string;
  subject: string;
  dayOfWeek: string; // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  room?: string;
  color: string;
  notes?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  notes?: string;
  dateAdded: string;
}

export interface SharedNote {
  id: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  dateShared: string;
  likes: number;
  likedBy: string[]; // email list
  tags: string[];
}

export interface CircleMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: string;
}

export interface LearningCircle {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  members: string[]; // email list
  notes: SharedNote[];
  messages: CircleMessage[];
  creatorEmail: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyFlashcard {
  front: string;
  back: string;
  category?: string;
}

export interface StudyPack {
  topic: string;
  playlist: {
    title: string;
    url: string;
    description: string;
    duration: string;
  }[];
  websites: {
    title: string;
    url: string;
    description: string;
  }[];
  roadmap: {
    step: number;
    title: string;
    description: string;
    duration: string;
  }[];
  quiz: QuizQuestion[];
  flashcards: StudyFlashcard[];
}

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
}

export interface StudyRoadmap {
  id: string;
  topic: string;
  description: string;
  steps: RoadmapStep[];
  dateCreated: string;
  progressPercent: number;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'Onsite';
  stipend: string;
  description: string;
  requirements: string[];
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  notes?: string;
  dateApplied?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
}
