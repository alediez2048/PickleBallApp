import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import * as locationsService from "@/services/locationsService";
import { Location } from "@/types/locations";

interface LocationsContextProps {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  getLocation: (id: string) => Promise<Location | null>;
  createLocation: (
    data: Omit<Location, "id" | "created_at">
  ) => Promise<Location | null>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
}

const LocationsContext = createContext<LocationsContextProps | undefined>(
  undefined
);

export const LocationsProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await locationsService.listLocations();
    if (error) setError(error.message);
    setLocations(data || []);
    setLoading(false);
  }, []);

  const getLocation = useCallback(async (id: string) => {
    const { data, error } = await locationsService.getLocation(id);
    if (error) setError(error.message);
    return data || null;
  }, []);

  const createLocation = useCallback(
    async (data: Omit<Location, "id" | "created_at">) => {
      const { data: created, error } =
        await locationsService.createLocation(data);
      if (error) {
        setError(error.message);
        return null;
      }
      await fetchLocations();
      return created?.[0] || null;
    },
    [fetchLocations]
  );

  const updateLocation = useCallback(
    async (id: string, updates: Partial<Location>) => {
      const { error } = await locationsService.updateLocation(id, updates);
      if (error) {
        setError(error.message);
        return false;
      }
      await fetchLocations();
      return true;
    },
    [fetchLocations]
  );

  const deleteLocation = useCallback(
    async (id: string) => {
      const { error } = await locationsService.deleteLocation(id);
      if (error) {
        setError(error.message);
        return false;
      }
      await fetchLocations();
      return true;
    },
    [fetchLocations]
  );

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return (
    <LocationsContext.Provider
      value={{
        locations,
        loading,
        error,
        fetchLocations,
        getLocation,
        createLocation,
        updateLocation,
        deleteLocation,
      }}
    >
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => {
  const context = useContext(LocationsContext);
  if (!context)
    throw new Error("useLocations must be used within a LocationsProvider");
  return context;
};
