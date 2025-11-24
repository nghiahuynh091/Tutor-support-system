import api from '@/lib/api';

export interface Class {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_code?: string;
  description?: string | null;
  tutor_id: string;
  tutor_name: string;
  tutor_email?: string;
  tutor_faculty?: string;
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

export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  classes: Class[];
}

export interface ConflictDetail {
  conflicting_class_id: number;
  conflicting_semester: string;
  conflicting_week_day: string;
  conflicting_start_time: number;
  conflicting_end_time: number;
  conflicting_location: string;
  conflicting_subject: string;
  conflicting_subject_code: string;
  conflicting_tutor_name: string;
  new_class_id: number;
  new_semester: string;
  new_week_day: string;
  new_start_time: number;
  new_end_time: number;
  new_location: string;
  new_subject: string;
  new_subject_code: string;
  new_tutor_name: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    class_id: number;
    mentee_id: string;
    registration_log: string;
  };
  error?: string;
  conflicts?: ConflictDetail[];
}

export const registrationService = {
  /**
   * Get all available classes
   */
  getAllClasses: async (): Promise<Class[]> => {
    const response = await api.get('/classes/');
    // Backend trả về { success: true, classes: [...], count: number }
    return response.data.classes || [];
  },

  /**
   * Get all classes grouped by subject
   */
  getClassesBySubject: async (): Promise<Subject[]> => {
    const classes = await registrationService.getAllClasses();
    
    // Group classes by subject
    const subjectsMap = new Map<number, Subject>();
    
    classes.forEach((cls: Class) => {
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
  },

  /**
   * Get mentee's registered classes
   */
  getMyRegistrations: async (menteeId: string): Promise<Class[]> => {
    const response = await api.get(`/registrations/mentee/${menteeId}`);
    // Backend trả về { success: true, registrations: [...], count: number }
    return response.data.registrations || [];
  },

  /**
   * Register for a class
   */
  register: async (classId: number, menteeId: string): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/registrations/register', {
        class_id: classId,
        mentee_id: menteeId
      });
      return response.data;
    } catch (error: any) {
      // Handle error response from backend
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.detail || error.response.data.error || 'Registration failed',
          conflicts: error.response.data.conflicts
        };
      }
      throw error;
    }
  },

  /**
   * Cancel registration
   */
  cancel: async (classId: number, menteeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post('/registrations/cancel', {
        class_id: classId,
        mentee_id: menteeId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Cancellation failed'
      };
    }
  },

  /**
   * Check for time conflicts
   */
  checkConflict: async (menteeId: string, classId: number) => {
    const response = await api.get('/registrations/check-conflict', {
      params: {
        mentee_id: menteeId,
        class_id: classId
      }
    });
    return response.data;
  },

  /**
   * Reschedule to different class
   */
  reschedule: async (
    oldClassId: number,
    newClassId: number,
    menteeId: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const response = await api.post('/registrations/reschedule', {
        old_class_id: oldClassId,
        new_class_id: newClassId,
        mentee_id: menteeId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Reschedule failed'
      };
    }
  }
};