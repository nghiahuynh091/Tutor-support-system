import api from '@/lib/api';

export interface ClassData {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description?: string | null;
  tutor_id: string;
  tutor_name: string;
  tutor_email?: string;
  capacity: number;
  current_enrolled: number;
  num_of_weeks: number | null;
  location: string | null;
  meeting_link?: string | null;
  registration_deadline: string | null;
  week_day: string;
  start_time: number;
  end_time: number;
  semester: string | number;
  class_status?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateClassPayload {
  subject_id: number;
  semester: number;
  week_day: string;
  start_time: number;
  end_time: number;
  location: string;
  capacity: number;
  num_of_weeks: number;
  registration_deadline: string;
}

export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

export interface GroupedSubject extends Subject {
  classes: ClassData[];
}

export const classService = {
  /**
   * Get all classes
   */
  getAllClasses: async (): Promise<ClassData[]> => {
    const response = await api.get('/classes/');
    return response.data.classes || [];
  },

  /**
   * Get class by ID
   */
  getClassById: async (classId: number): Promise<ClassData> => {
    const response = await api.get(`/classes/${classId}`);
    return response.data.class;
  },

  /**
   * Get classes by subject ID
   */
  getClassesBySubject: async (subjectId: number): Promise<ClassData[]> => {
    const response = await api.get(`/classes/subject/${subjectId}`);
    return response.data.classes || [];
  },

  /**
   * Get classes by tutor ID (requires auth)
   */
  getClassesByTutor: async (tutorId: string): Promise<ClassData[]> => {
    const response = await api.get(`/classes/tutor/${tutorId}`);
    return response.data.classes || [];
  },

  /**
   * Create a new class (tutor only)
   */
  createClass: async (payload: CreateClassPayload): Promise<{ success: boolean; class?: ClassData; error?: string }> => {
    try {
      const response = await api.post('/classes/', payload);
      return {
        success: true,
        class: response.data.class
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create class'
      };
    }
  },

  /**
   * Delete a class (tutor only)
   */
  deleteClass: async (classId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.delete(`/classes/${classId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete class'
      };
    }
  },

  /**
   * Group classes by subject
   */
  groupClassesBySubject: (classes: ClassData[]): GroupedSubject[] => {
    const subjectsMap = new Map<number, GroupedSubject>();

    classes.forEach((cls) => {
      if (!subjectsMap.has(cls.subject_id)) {
        subjectsMap.set(cls.subject_id, {
          id: cls.subject_id,
          subject_name: cls.subject_name,
          subject_code: cls.subject_code,
          classes: []
        });
      }
      subjectsMap.get(cls.subject_id)!.classes.push(cls);
    });

    return Array.from(subjectsMap.values());
  }
};
