export interface Tournament {
  id: string;
  name: string;
  teams: number;
  courts: number;
  status: 'ready' | 'draft';
  start_date: string;
  start_time: string;
}

export interface MatchIA {
  terrain: number;
  equipe_a: string;
  equipe_b: string;
  duration: number ;
  debut_horaire: string;
  fin_horaire: string;
  phase: string
}


export interface Match {
  id: string;
  tournament_id: string;
  team_a_id: string;
  team_b_id: string;
  court_number: number;
  schedule_time: string;
  actual_start_time: string;
  actual_end_time: string;
  duration?: number;
  status: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  team_a_score: number;
  team_b_score: number;
  winner_team_id: string;
  phase: string
  round_number: string;
  match_number_in_round: string;
  sets_data: Array<{set_number: number, team_a: number, team_b: number}>;
  referee_id: string;
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
  source_ai_match_id: string;
  created_from_ai: boolean;
  last_score_update_at: string;
  last_score_update_by: string;
}

export interface TournamentDetail {
    id: string, 
    name: string,
    description: string, 
    courts_available: string, 
    match_duration_minutes: number, 
    break_duration_minutes: number,
    constraints: object,
    organizer_id: string,
    status: 'draft' | 'ready' | 'in_progress' | 'completed' | 'cancelled',
    created_at: string,
    updated_at: string,
    start_date: string, 
    start_time: string, 
    max_teams: number,
    registered_teams: number,
    tournament_type: 'poules_elimination' | 'round_robin' | 'elimination_directe' | 'double_elimination'
}

export interface AIPlanning {
    type_tournoi: 'poules_elimination' | 'round_robin' | 'elimination_directe' | 'double_elimination'
    
    // Round Robin
    // matchs_round_robin: List[RoundRobinMatch] = []
    
    // Poules + Elimination
    poules: Poule[]
    phase_elimination_apres_poules: PhaseElimination
    
    // # Autres types (à développer plus tard)
    // rounds_elimination: Dict[str, Any] = {}
    // winner_bracket: Dict[str, Any] = {}
    // loser_bracket: Dict[str, Any] = {}
    // grande_finale: Dict[str, Any] = {}
    
    // Commun
    final_ranking: any[]
    commentaires: string
    total_matches?: number
}

interface Poule {
  matchs: Match[];
  equipes: string[];
  poule_id: string;
  nom_poule: string;
}

interface PhaseElimination {
  finale: Match;
  quarts: Match[];
  demi_finales: Match[];
}

export interface Member {
  name: string;
  email: string;
  role: 'player' | 'captain';
  position: string;
  status: 'active' | 'inactive';
}

export interface Team {
  id: string;
  name: string;
  tournament: string;
  // description: string;
  tournamentId: string;
  // captainId: string;
  contactEmail: string;
  // contactPhone: string
  status: 'registered' | 'confirmed' | 'disqualified' | 'withdrawn';
  skillLevel: 'debutant' | 'amateur' | 'confirme' | 'expert' | 'professionnel';
  members: Member[];
}

export interface NewTournament {
  id: string;
  name: string;
  description: string;
  tournament_type: 'poules_elimination' | 'round_robin' | 'elimination_directe' | 'double_elimination';
  start_date: string;
  start_time: string;
  max_teams: number;
  match_duration_minutes: number;
  break_duration_minutes: number;
  courts_available: number;
  status: 'draft' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  organizer_id: string;
  constraints: object;
  created_at: string;
  updated_at: string;
  registered_teams: number;
}