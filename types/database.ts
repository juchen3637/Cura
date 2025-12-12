export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          location: string | null;
          phone: string | null;
          links: string[];
          role: "guest" | "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          location?: string | null;
          phone?: string | null;
          links?: string[];
          role?: "guest" | "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          location?: string | null;
          phone?: string | null;
          links?: string[];
          role?: "guest" | "user" | "admin";
          updated_at?: string;
        };
      };
      experiences: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          role: string;
          location: string | null;
          start_date: string;
          end_date: string | null;
          bullets: string[];
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          role: string;
          location?: string | null;
          start_date: string;
          end_date?: string | null;
          bullets?: string[];
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company?: string;
          role?: string;
          location?: string | null;
          start_date?: string;
          end_date?: string | null;
          bullets?: string[];
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      education: {
        Row: {
          id: string;
          user_id: string;
          institution: string;
          degree: string;
          location: string | null;
          start_date: string | null;
          end_date: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          institution: string;
          degree: string;
          location?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          institution?: string;
          degree?: string;
          location?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          link: string | null;
          bullets: string[];
          tags: string[];
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          link?: string | null;
          bullets?: string[];
          tags?: string[];
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          link?: string | null;
          bullets?: string[];
          tags?: string[];
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      skill_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          skills: string[];
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          skills?: string[];
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          skills?: string[];
          display_order?: number;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          resume_data: any;
          job_description: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          resume_data: any;
          job_description?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          resume_data?: any;
          job_description?: string | null;
          is_favorite?: boolean;
          updated_at?: string;
        };
      };
      suggestions: {
        Row: {
          id: string;
          resume_id: string | null;
          user_id: string;
          section_type: string;
          section_id: string | null;
          suggestion_type: string;
          original_text: string | null;
          suggested_text: string;
          status: string;
          created_at: string;
          applied_at: string | null;
        };
        Insert: {
          id?: string;
          resume_id?: string | null;
          user_id: string;
          section_type: string;
          section_id?: string | null;
          suggestion_type: string;
          original_text?: string | null;
          suggested_text: string;
          status?: string;
          created_at?: string;
          applied_at?: string | null;
        };
        Update: {
          section_type?: string;
          section_id?: string | null;
          suggestion_type?: string;
          original_text?: string | null;
          suggested_text?: string;
          status?: string;
          applied_at?: string | null;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          api_type: "ai_analyze" | "ai_build" | "pdf_import";
          call_count: number;
          month_year: string;
          last_call_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_type: "ai_analyze" | "ai_build" | "pdf_import";
          call_count?: number;
          month_year: string;
          last_call_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          call_count?: number;
          last_call_at?: string | null;
          updated_at?: string;
        };
      };
      ai_tasks: {
        Row: {
          id: string;
          user_id: string;
          mode: "analyze" | "build";
          job_title: string;
          company: string;
          job_description: string;
          resume_data: any | null;
          status: "pending" | "running" | "completed" | "failed";
          result: any | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: "analyze" | "build";
          job_title: string;
          company: string;
          job_description: string;
          resume_data?: any | null;
          status?: "pending" | "running" | "completed" | "failed";
          result?: any | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "running" | "completed" | "failed";
          result?: any | null;
          error?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
