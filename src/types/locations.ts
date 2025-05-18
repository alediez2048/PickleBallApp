export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  coordinates?: LocationCoordinates;
  image_url?: string;
  created_at: string; // ISO timestamp
}
