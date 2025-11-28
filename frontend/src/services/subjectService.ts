import api from '@/lib/api';

export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  description?: string | null;
  created_at?: string;
}

export const subjectService = {
  /**
   * Get all subjects
   */
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await api.get('/subjects/');
    return response.data.subjects || [];
  },

  /**
   * Get subject by ID
   */
  getSubjectById: async (subjectId: number): Promise<Subject> => {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data.subject;
  },

  /**
   * Create a new subject (admin only)
   */
  createSubject: async (data: { subject_name: string; subject_code: string; description?: string }): Promise<{ success: boolean; subject?: Subject; error?: string }> => {
    try {
      const response = await api.post('/subjects/', data);
      return {
        success: true,
        subject: response.data.subject
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create subject'
      };
    }
  }
};
