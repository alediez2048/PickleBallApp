// Game history type for PickleBallApp

export interface GameHistory {
  id: string;
  date: string;
  result: "win" | "loss";
  score: string;
  opponent: string;
}
