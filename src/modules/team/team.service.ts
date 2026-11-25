const VAQUEROS_TEAM_ID = 14291;

async function getVaquerosMatches(): Promise<Match[]> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const matchdays = Array.from({ length: 34 }, (_, i) => i + 1);

  const results = await Promise.all(
    matchdays.map(async matchday => {
      const params = new URLSearchParams({
        season: "77",
        division: "15",
        tournament: "15",
        category: "64",
      });

      const response = await fetch(
        `${LA_LIGA_URL}/matches/matchday/${matchday}?${params}`,
        {
          headers: {
            "X-API-Key": apiKey,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error consultando jornada ${matchday}: ${response.status}`
        );
      }

      return (await response.json()) as Match[];
    })
  );

  return results
    .flat()
    .filter(
      match =>
        match.home_team_id === VAQUEROS_TEAM_ID ||
        match.away_team_id === VAQUEROS_TEAM_ID
    );
}

async function getMatch(type: MatchType): Promise<MatchLandingResponse | null> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const result = await fetch(
    `${LA_LIGA_URL}/clubs/${VAQUEROS_TEAM_ID}/matches/${type}?tournament=15&division=15&season=77`,
    {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!result.ok) {
    throw new Error(`Error Liga Premier: ${result.status}`);
  }

  return result.json();
}

async function getClubs(): Promise<Club[]> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const response = await fetch(`${LA_LIGA_URL}/clubs/?division=15`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error Liga Premier: ${response.status}`);
  }

  return response.json();
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function addClubInfo(team: MatchLandingTeam, clubs: Club[]): MatchLandingClub {
  const club = clubs.find(
    club => normalizeName(club.name) === normalizeName(team.name)
  );

  return {
    ...team,
    id: club?.id ?? (team.code === "VAC" ? VAQUEROS_TEAM_ID : null),
    logo: club?.logo ?? null,
    category: club?.category ?? "",
    subCategory: club?.subCategory ?? "",
  };
}

async function getMatchLineups(
  matchId: number,
  teamId: number,
  substitute: number
): Promise<Player[]> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const params = new URLSearchParams({
    team_id: String(teamId),
    ...(substitute === 1 ? { substitute: String(substitute) } : {}),
  });

  const response = await fetch(
    `${LA_LIGA_URL}/matches/${matchId}/lineups?${params}`,
    {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error obteniendo alineación del equipo ${teamId}: ${response.status}`
    );
  }

  return response.json();
}

async function getMatchTechnicalStaff(
  matchId: number,
  teamId: number
): Promise<TechnicalStaff[]> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const params = new URLSearchParams({
    team_id: String(teamId),
  });

  const response = await fetch(
    `${LA_LIGA_URL}/matches/${matchId}/technical-staff?${params}`,
    {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error obteniendo cuerpo técnico del equipo ${teamId}: ${response.status}`
    );
  }

  return response.json();
}

async function getMatchTimeline(
  matchId: number,
  localTeamId: number,
  awayTeamId: number
): Promise<MatchEvent[]> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const params = new URLSearchParams({
    id_local: String(localTeamId),
    id_visita: String(awayTeamId),
  });

  const response = await fetch(
    `${LA_LIGA_URL}/matches/${matchId}/timeline?${params}`,
    {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error obteniendo timeline del partido ${matchId}: ${response.status}`
    );
  }

  return response.json();
}

async function getMatchInfo(matchId: number): Promise<MatchInfo> {
  const apiKey = process.env.LIGA_PREMIER_API_KEY;
  const LA_LIGA_URL = process.env.LA_LIGA_URL;

  if (!apiKey) {
    throw new Error("Falta LIGA_PREMIER_API_KEY");
  }

  const response = await fetch(`${LA_LIGA_URL}/matches/${matchId}`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error obteniendo información del partido ${matchId}: ${response.status}`
    );
  }

  return response.json();
}

export class TeamService {
  public async findAll() {
    try {
      const matches = await getVaquerosMatches();
      console.log("Partidos de Vaqueros obtenidos:", matches);
      return matches;
    } catch (error) {
      console.error("Error al obtener los partidos de Vaqueros:", error);
    }
  }

  public async getMatchesLanding() {
    try {
      const [nextMatch, lastMatch, clubs] = await Promise.all([
        getMatch("next"),
        getMatch("last"),
        getClubs(),
      ]);

      const enrichMatch = (match: MatchLandingResponse | null) => {
        if (!match) return null;

        return {
          ...match,
          home: addClubInfo(match.home, clubs),
          away: addClubInfo(match.away, clubs),
        };
      };

      return {
        next: enrichMatch(nextMatch),
        last: enrichMatch(lastMatch),
      };
    } catch (error) {
      console.error("Error al obtener los partidos de Vaqueros:", error);
      throw error;
    }
  }

  public async getMatchData(
    matchId: number,
    localTeamId: number,
    awayTeamId: number
  ) {
    try {
      const [
        match,
        startingLocal,
        startingAway,
        substitutesLocal,
        substitutesAway,
        staffLocal,
        staffAway,
        timeline,
      ] = await Promise.all([
        getMatchInfo(matchId),
        getMatchLineups(matchId, localTeamId, 0),
        getMatchLineups(matchId, awayTeamId, 0),
        getMatchLineups(matchId, localTeamId, 1),
        getMatchLineups(matchId, awayTeamId, 1),
        getMatchTechnicalStaff(matchId, localTeamId),
        getMatchTechnicalStaff(matchId, awayTeamId),
        getMatchTimeline(matchId, localTeamId, awayTeamId),
      ]);

      const data = {
        match,
        home: {
          id: localTeamId,
          starters: startingLocal,
          substitutes: substitutesLocal,
          staff: staffLocal,
        },
        away: {
          id: awayTeamId,
          starters: startingAway,
          substitutes: substitutesAway,
          staff: staffAway,
        },
        timeline,
      };

      return data;
    } catch (error) {
      console.error("Error al obtener los partidos de Vaqueros:", error);
      throw error;
    }
  }
}
