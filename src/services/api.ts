import { NewTournament } from '@/types/planning';

const BDD_BASE_URL = import.meta.env.VITE_BDD_SERVICE_URL;
const PLANNING_BASE_URL = import.meta.env.VITE_PLANNING_SERVICE_URL;
const TEAM_BASE_URL = import.meta.env.VITE_TEAM_SERVICE_URL;

const TOURNAMENT_BASE_URL = import.meta.env.VITE_TOURNAMENT_SERVICE_URL;
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL_NEW;
const MATCH_BASE_URL = import.meta.env.VITE_MATCH_SERVICE_URL;
// Types pour les réponses API
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Service pour les tournois
export const tournamentService = {
  async getTournaments() {
    try {
      const response = await fetch(`${TOURNAMENT_BASE_URL}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any[]> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la récupération des tournois:", error.message);
      throw error;
    }
  },

  async createTournament(tournamentData: any) {
    try {
      console.log("tournamentData", tournamentData);
      const response = await fetch(`${TOURNAMENT_BASE_URL}/organizer`, 
        {
          method: "POST",
          headers: {
            "accept": "application/json", 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(tournamentData),
          credentials: 'include' // Pour envoyer les cookies d'authentification
        }
      );

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const responseJson: ApiResponse<NewTournament> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la création du tournoi:", error.message);
      throw error;
    }
  },

  async getTournamentById(id: string) {
    try {
      const response = await fetch(`${TOURNAMENT_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la récupération du tournoi:", error.message);
      throw error;
    }
  },

  async getTeamsByTournament(tournamentId: string) {
    try {
      const response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/teams`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error.message);
      throw error;
    }
  },

  async updateTournamentStatus(tournamentId: string, status: string) {
    try {
      let response;
      switch (status) {
        case "ready":
          response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/publish`, {
            method: "PATCH",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
            }
          });
          break;
        case "draft":
          response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/draft`, {
            method: "PATCH",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
            }
          });
          break;
        case "in_progress":
          response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/start`, {
            method: "PATCH",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
            }
          });
          break;
        case "completed":
          response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/finish`, {
            method: "PATCH",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
            }
          });
          break;
      }
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const responseJson: ApiResponse<any> = await response.json();

      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du tournoi:", error.message);
      throw error;
    }
  },

  async updateRegisteredTeamsCount(tournamentId: string) {
    try {
      const response = await fetch(`${TOURNAMENT_BASE_URL}/${tournamentId}/update-registered-teams-count`, {
        method: "PATCH",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compteur d'équipes inscrites:", error.message);
      throw error;
    }
  }
};

// Service pour les plannings
export const planningService = {
  async getPlanningByTournament(tournamentId: string) {
    try {
      const response = await fetch(`${PLANNING_BASE_URL}/planning/tournament/${tournamentId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la récupération du planning:", error.message);
      throw error;
    }
  },

  async generatePlanning(tournamentId: string) {
    try {
      const response = await fetch(`${PLANNING_BASE_URL}/planning/generate`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tournament_id: tournamentId })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error.message);
      throw error;
    }
  }
};

// Service pour les utilisateurs
export const usersService = {
  async getUserByEmail(email: string, retryCount = 0) {
    try {
      const response = await fetch(`${BDD_BASE_URL}/users/?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();

      // Si l'utilisateur n'est pas trouvé mais une invitation a été envoyée
      if (!responseJson.data && responseJson.message.includes("invitation envoyée")) {
        
        // Attendre 2 secondes et réessayer (maximum 3 tentatives)
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getUserByEmail(email, retryCount + 1);
        } else {
          throw new Error(`Impossible de récupérer l'utilisateur ${email} après plusieurs tentatives`);
        }
      }

      return responseJson.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${email}:`, error.message);
      throw error;
    }
  }
};

// Service pour les équipes
export const teamsService = {
  async getTeams() {
    try {
      const response = await fetch(`${TEAM_BASE_URL}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any[]> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error.message);
      throw error;
    }
  },

  async getTeamsWithMembers() {
    try {
      const response = await fetch(`${TEAM_BASE_URL}?limit=50`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any[]> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes avec membres:", error.message);
      throw error;
    }
  },

  async createTeam(tournament_id: string, teamData: any) {
    try {
      const response = await fetch(`${TEAM_BASE_URL}/tournament/${tournament_id}`, {
          method: "POST",
          headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
          },
          body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'équipe:", error.message);
      throw error;
    }
  },

  async addPlayersToTeam(teamId: string, players: any[]) {
    try {
      const response = await fetch(`${TEAM_BASE_URL}/${teamId}/members`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          players: players
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout des joueurs à l'équipe:", error.message);
      throw error;
    }
  },

  async deleteTeam(teamId: string) {
    try {
      const response = await fetch(`${TEAM_BASE_URL}/${teamId}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipe:", error.message);
      throw error;
    }
  },

  async importTeamsFromExcel(tournamentId: string, excelFile: File) {
    try {
      const formData = new FormData();
      formData.append("excelFile", excelFile, excelFile.name);

      const response = await fetch(`${TEAM_BASE_URL}/tournament/${tournamentId}/import-teams`, {
        method: "POST",
        body: formData,
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error("Erreur lors de l'import des équipes depuis Excel:", error.message);
      throw error;
    }
  },

  async deleteAllTeamsFromTournament(tournamentId: string) {
    try {
      const response = await fetch(`${TEAM_BASE_URL}/tournament/${tournamentId}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les équipes:", error.message);
      throw error;
    }
  }
}; 


// service pour authentification 
export const authService = {
  async register(email: string, password: string, userRole: string) {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, role: userRole })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error.message);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      localStorage.setItem('access_token', responseJson.data.user.access_token);
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.message);
      throw error;
    }
  },

  async getUser() {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/user`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
      throw error;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      localStorage.removeItem('access_token');
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error.message);
      throw error;
    }
  }
  
};


// service pour les matchs 
export const matchService = {
  async getMatchsByTournamentId(tournamentId: string) {
    try {
      const response = await fetch(`${MATCH_BASE_URL}/tournament/${tournamentId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des matchs:", error.message);
      throw error;
    }
  },

  async updateMatchStatus(matchId: string, status: string) {
    try {
      const response = await fetch(`${MATCH_BASE_URL}/${matchId}/status`, {
        method: "PATCH",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du match:", error.message);
      throw error;
    }
  },

  async getMatchById(matchId: string) {
    try {
      const response = await fetch(`${MATCH_BASE_URL}/${matchId}`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
  
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du match:", error.message);
      throw error;
    }
  },

  async createMatchsFromAi(tournamentId: string) {
    try {
      const response = await fetch(`${MATCH_BASE_URL}/from-ai/tournament/${tournamentId}`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la création des matchs:", error.message);
      throw error;
    }
  },

  async deleteMatchsFromAi(tournamentId: string) {
    try {
      const response = await fetch(`${MATCH_BASE_URL}/from-ai/tournament/${tournamentId}`, {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseJson: ApiResponse<any> = await response.json();
      return responseJson;
    } catch (error) {
      console.error("Erreur lors de la suppression des matchs:", error.message);
      throw error;
    }
  }
}
