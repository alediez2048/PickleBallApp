import { useRouter } from 'expo-router';

export function useAppNavigation() {
  const router = useRouter();

  return {
    navigate: (route: string) => {
      router.push(route as any);
    },
    goBack: () => {
      router.back();
    }
  };
} 