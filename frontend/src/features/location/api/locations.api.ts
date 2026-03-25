import api from '../../../lib/axios';

export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  qr_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SitePayload {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active?: boolean;
}

const unwrap = (res: any) => {
  const d = res.data?.data ?? res.data;
  return Array.isArray(d) ? d : (d?.data ?? []);
};

export const locationsApi = {
  getLocations: (): Promise<Site[]> =>
    api.get('/api/locations').then(unwrap),

  createLocation: (data: SitePayload): Promise<Site> =>
    api.post('/api/locations', data).then(res => res.data?.data ?? res.data),

  updateLocation: (id: string, data: Partial<SitePayload>): Promise<Site> =>
    api.put(`/api/locations/${id}`, data).then(res => res.data?.data ?? res.data),

  deleteLocation: (id: string): Promise<void> =>
    api.delete(`/api/locations/${id}`).then(() => undefined),

  generateQr: (id: string) =>
    api.get(`/api/locations/${id}/qr`).then(res => res.data?.data ?? res.data),
};
