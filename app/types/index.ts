export interface Match {
  id: number;
  code: string;
  time: string;
  home: string;
  away: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
}
export interface Bet {
  match: string;
  market: string;
  option: string;
  odds: number;
  stake: number;
}