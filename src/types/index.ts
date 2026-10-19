/** Firestore-ready domain types. No data is fabricated in the UI. */

export type Branch =
  | "B.Tech - Computer Science & Engineering"
  | "B.Tech - CSE (Artificial Intelligence & Data Science)"
  | "B.Tech - CSE (Artificial Intelligence & Machine Learning)"
  | "B.Tech - CSE (Artificial Intelligence  Robotics)"
  | "B.Tech - CSE (Cyber Security)"
  | "B.Tech - Electronics & Communication Engineering"
  | "B.Tech - Electrical and Electronics Engineering"
  | "B.Tech - Mechanical Engineering"
  | "B.Tech - Civil Engineering"
  | "B.Tech - Bioinformatics"
  | "B.B.A. - Management Studies"
  | "B.C.A. - Computer Applications";
export type Year = "1" | "2" | "3" | "4";
export type MeetingStatus = "Upcoming" | "Completed" | "Cancelled";
export type EventStatus = "Active" | "Inactive";

/** Firestore collection: `students` (document id = Firebase Auth uid). */
export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: Branch | string;
  year: Year | string;
  section: string;
  status: "Active" | "Disabled";
  registeredAt: string; // ISO string from Firestore Timestamp
}

/** Firestore collection: `meetings`. */
export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  classroom: string;
  speaker: string;
  status: MeetingStatus;
}

export interface LearningEvent {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  registrationDeadline: string;
  capacity: number;
  registrationCount: number;
  active: boolean;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  phone?: string;
  branch?: string;
  year?: string;
  section?: string;
  source?: "student" | "public";
  registeredAt: string;
}

/** Firestore collection: `admins` (authorization enforced by security rules). */
export interface Admin {
  id: string;
  email: string;
  name?: string;
}

/** Firestore collection: `notificationTokens` (document id = Firebase Auth uid). */
export interface NotificationToken {
  userId: string;
  token: string;
  createdAt: string; // ISO string from Firestore Timestamp
  updatedAt: string; // ISO string from Firestore Timestamp
  enabled: boolean;
}

/** Firestore collection: `notifications`. */
export interface Notification {
  id: string;
  title: string;
  message: string;
  url?: string;
  sentBy: string; // admin uid
  sentAt: string; // ISO string from Firestore Timestamp
  recipientCount: number;
  status: "sent" | "failed" | "pending";
}

export interface RegistrationInput {
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  section: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
