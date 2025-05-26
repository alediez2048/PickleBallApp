import { useContext } from "react";
import { NavigationContext } from "@react-navigation/native";

export function useCurrentRouteName() {
  const navigation = useContext(NavigationContext);
  if (!navigation) return undefined;
  // @ts-ignore
  return navigation.getCurrentRoute?.()?.name;
}
