// BookedGame type for booked games feature
// All fields must match the structure used in Supabase and the app

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
  user_info:{} | any
  status: "upcoming" | "completed" | "cancelled";
}
