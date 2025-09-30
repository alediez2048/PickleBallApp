import type { Location } from "./locations";
import type { Game } from "./games";

export interface BookedGame {
  id: string;
  game_id: string;
  date: string;
  time: string;
  court_name: string;
  location_id: string | null;
  skill_rating: number;
  price: number;
  user_id: string;
  user_info: {} | any;
  status: "upcoming" | "completed" | "cancelled";
  location?: Location;
  game?: Game;
}
