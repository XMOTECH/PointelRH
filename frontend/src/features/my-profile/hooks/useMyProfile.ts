import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: profileApi.getMyProfile,
  });
}
