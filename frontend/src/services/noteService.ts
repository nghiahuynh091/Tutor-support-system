import api from "@/lib/api";

export interface Note {
  id: number;
  note_title: string;
  note_information: string;
  class_id: number;
  session_id: number;
  created_at: string;
  updated_at: string;
  session_date?: string;
  session_status?: string;
}

export const noteService = {
  /**
   * Get a note by ID
   */
  getNoteById: async (noteId: number): Promise<Note | null> => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return response.data.note || null;
    } catch (error) {
      console.error(`Failed to fetch note ${noteId}:`, error);
      throw error;
    }
  },

  /**
   * Get all notes for a specific session
   */
  getNotesBySession: async (
    classId: number,
    sessionId: number
  ): Promise<Note[]> => {
    try {
      const response = await api.get(
        `/notes/session/${classId}/${sessionId}`
      );
      return response.data.notes || [];
    } catch (error) {
      console.error(
        `Failed to fetch notes for session ${classId}/${sessionId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get all notes for a specific class
   */
  getNotesByClass: async (classId: number): Promise<Note[]> => {
    try {
      const response = await api.get(`/notes/class/${classId}`);
      return response.data.notes || [];
    } catch (error) {
      console.error(`Failed to fetch notes for class ${classId}:`, error);
      throw error;
    }
  },
};
