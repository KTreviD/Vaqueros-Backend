interface Match {
  id: number;
  match_status_id: number;
  match_status: string;
  home_team_id: number;
  away_team_id: number;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  home_image: string;
  away_image: string;
  match_date: string;
  match_time: string;
  matchday_name: string;
  stadium_name: string;
}

type MatchType = "next" | "last";

type MatchLandingTeam = {
  code: string;
  name: string;
  score?: number;
};

type MatchLandingResponse = {
  jornada: string;
  home: MatchLandingTeam;
  away: MatchLandingTeam;
  condition?: string;
  date?: string;
  dateLabel?: string;
  venue?: string;
  result?: string;
  resultLabel?: string;
  highlight?: string;
};

type Club = {
  id: number;
  name: string;
  logo: string;
  category: string;
  subCategory: string;
};

type MatchLandingClub = MatchLandingTeam & {
  id: number | null;
  logo: string | null;
  category: string;
  subCategory: string;
};

interface Player {
  player_id: number;
  name: string;
  team_id: number;
  shirt: number;
  starter: 0 | 1;
  position: string;
  position_id: number;
  captain: 0 | 1;
  minutes_played: number;
  minute_enters: number;
  minute_leaves: number;
}

interface MatchEvent {
  id: string;
  minute: number;
  extraTime: number | null;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | string;
  team: "local" | "visita";
  playerName: string | null;
  playerOut: string | null;
  playerIn: string | null;
  description: string | null;
}

interface TechnicalStaff {
  technical_staff_id: number;
  name: string;
  team_id: number;
  position_id: number;
  position: string;
  abbr: string;
}

interface MatchInfo {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team: string;
  away_team: string;
  home_image: string;
  away_image: string;
  home_color: string;
  away_color: string;
  match_status_id: number;
  match_status: string;
  sheet_status_id: number;
  sheet_status: string;
  sheet_status_description: string;
  league: string;
  category: string;
  sub_category: string;
  home_goals: number;
  away_goals: number;
  home_penalties: number;
  away_penalties: number;
  center_referee_id: number;
  center_referee: string;
  assistant_referee_1_id: number;
  assistant_referee_1: string;
  assistant_referee_2_id: number;
  assistant_referee_2: string;
  fourth_official_id: number;
  fourth_official: string;
  match_date: string;
  match_long_date: string;
  match_time: string;
  match_time_local: string;
  matchday_number: number;
  matchday_name: string;
  matchday_short_name: string;
  stadium_id: number;
  stadium_name: string;
}
