import api from '@/lib/api';

// API response types (matching backend response)
export interface SessionApiResponse {
  class_id: number;
  session_id: number;
  session_date: string;
  session_status: string;
  location: string | null;
  start_time: number;
  end_time: number;
  week_day: number;
  created_at?: string;
  updated_at?: string;
  semester: string | number;
  class_status?: string;
  subject_name: string;
  subject_code: string;
  tutor_name: string;
  tutor_email?: string;
  meeting_link?: string | null;
  description?: string | null;
}

// Frontend calendar session interface
export interface CalendarSession {
  id: string;
  class_id: string;
  subject_name: string;
  subject_code: string;
  class_code: string;
  tutor_name: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  meeting_link: string | null;
  status: "scheduled" | "completed" | "cancelled";
}

// Convert period number to time string (e.g., 1 -> "06:00", 2 -> "07:00")
const periodToTime = (period: number): string => {
  const hour = period + 5;
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Map API session status to frontend status
const mapSessionStatus = (
  apiStatus: string
): "scheduled" | "completed" | "cancelled" => {
  const status = apiStatus?.toLowerCase();
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "scheduled";
};

// Transform API session to CalendarSession
const transformSession = (session: SessionApiResponse): CalendarSession => {
  return {
    id: session.session_id.toString(),
    class_id: session.class_id.toString(),
    subject_name: session.subject_name,
    subject_code: session.subject_code,
    class_code: `CC${session.class_id.toString().padStart(2, "0")}`,
    tutor_name: session.tutor_name,
    date: new Date(session.session_date),
    start_time: periodToTime(session.start_time),
    end_time: periodToTime(session.end_time),
    location: session.location || "TBA",
    description: session.description || `Session for ${session.subject_name}`,
    meeting_link: session.meeting_link || null,
    status: mapSessionStatus(session.session_status),
  };
};

export const sessionService = {
  /**
   * Get all sessions for the logged-in mentee
   */
  getMenteeSessions: async (): Promise<CalendarSession[]> => {
    try {
      const response = await api.get("/sessions/mentee/all");
      const sessions: SessionApiResponse[] = response.data.sessions || [];
      return sessions.map(transformSession);
    } catch (error) {
      console.error("Failed to fetch mentee sessions:", error);
      throw error;
    }
  },

  /**
   * Get all sessions for the logged-in tutor
   */
  getTutorSessions: async (): Promise<CalendarSession[]> => {
    try {
      const response = await api.get("/sessions/tutor/all");
      const sessions: SessionApiResponse[] = response.data.sessions || [];
      return sessions.map(transformSession);
    } catch (error) {
      console.error("Failed to fetch tutor sessions:", error);
      throw error;
    }
  },

  /**
   * Get sessions for a specific class
   */
  getSessionsByClass: async (classId: number): Promise<CalendarSession[]> => {
    try {
      const response = await api.get(`/sessions/tutor/class/${classId}`);
      const sessions: SessionApiResponse[] = response.data.sessions || [];
      return sessions.map(transformSession);
    } catch (error) {
      console.error(`Failed to fetch sessions for class ${classId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single session by class ID and session ID
   */
  getSessionById: async (
    classId: number,
    sessionId: number
  ): Promise<CalendarSession | null> => {
    try {
      const response = await api.get(`/sessions/${classId}/${sessionId}`);
      if (response.data.session) {
        return transformSession(response.data.session);
      }
      return null;
    } catch (error) {
      console.error(
        `Failed to fetch session ${sessionId} for class ${classId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Filter sessions by date range
   */
  filterSessionsByDateRange: (
    sessions: CalendarSession[],
    startDate: Date,
    endDate: Date
  ): CalendarSession[] => {
    return sessions.filter((session) => {
      const sessionDate = session.date;
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  },
};
