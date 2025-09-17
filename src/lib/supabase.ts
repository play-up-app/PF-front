import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Créer le client Supabase avec configuration realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10 // Limiter les événements pour éviter le spam
    }
  }
});

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          team_a_id: string;
          team_b_id: string;
          court_number: number;
          schedule_time: string;
          actual_start_time: string | null;
          actual_end_time: string | null;
          status: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
          team_a_score: number;
          team_b_score: number;
          winner_team_id: string | null;
          phase: string;
          round_number: string;
          match_number_in_round: string;
          sets_data: Array<{set_number: number, team_a: number, team_b: number}>;
          referee_id: string | null;
          current_set: number;
          current_set_score: {
            team_a: number;
            team_b: number;
          };
          metadata: {
            ai_match_id: string;
            poule_id: string;
            original_team_names: {
              team_a: string;
              team_b: string;
            };
          };
          created_at: string;
          updated_at: string;
          created_by: string;
          last_modified_by: string;
          source_ai_match_id: string | null;
          created_from_ai: boolean;
          last_score_update_at: string | null;
          last_score_update_by: string | null;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          team_a_id: string;
          team_b_id: string;
          court_number: number;
          schedule_time: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          status?: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
          team_a_score?: number;
          team_b_score?: number;
          winner_team_id?: string | null;
          phase: string;
          round_number: string;
          match_number_in_round: string;
          sets_data?: Array<{set_number: number, team_a: number, team_b: number}>;
          referee_id?: string | null;
          current_set?: number;
          current_set_score?: {
            team_a: number;
            team_b: number;
          };
          metadata: {
            ai_match_id: string;
            poule_id: string;
            original_team_names: {
              team_a: string;
              team_b: string;
            };
          };
          created_at?: string;
          updated_at?: string;
          created_by: string;
          last_modified_by: string;
          source_ai_match_id?: string | null;
          created_from_ai?: boolean;
          last_score_update_at?: string | null;
          last_score_update_by?: string | null;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          team_a_id?: string;
          team_b_id?: string;
          court_number?: number;
          schedule_time?: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          status?: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
          team_a_score?: number;
          team_b_score?: number;
          winner_team_id?: string | null;
          phase?: string;
          round_number?: string;
          match_number_in_round?: string;
          sets_data?: Array<{set_number: number, team_a: number, team_b: number}>;
          referee_id?: string | null;
          current_set?: number;
          current_set_score?: {
            team_a: number;
            team_b: number;
          };
          metadata?: {
            ai_match_id: string;
            poule_id: string;
            original_team_names: {
              team_a: string;
              team_b: string;
            };
          };
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          last_modified_by?: string;
          source_ai_match_id?: string | null;
          created_from_ai?: boolean;
          last_score_update_at?: string | null;
          last_score_update_by?: string | null;
        };
      };
    };
  };
}

export type Match = Database['public']['Tables']['matches']['Row'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];
