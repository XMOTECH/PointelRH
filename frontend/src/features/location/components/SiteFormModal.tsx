import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { Site } from '../api/locations.api';

const schema = z.object({
  name: z.string().min(1, 'Nom requis').max(255),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius_meters: z.coerce.number().int().min(1, 'Min 1m'),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  site?: Site | null;
}

function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={[lat, lng]} />;
}

export function SiteFormModal({ open, onClose, onSubmit, isLoading, site }: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      latitude: 33.5731,
      longitude: -7.5898,
      radius_meters: 100,
      is_active: true,
    },
  });

  useEffect(() => {
    if (site) {
      reset({
        name: site.name,
        latitude: site.latitude,
        longitude: site.longitude,
        radius_meters: site.radius_meters,
        is_active: site.is_active,
      });
    } else {
      reset({ name: '', latitude: 33.5731, longitude: -7.5898, radius_meters: 100, is_active: true });
    }
  }, [site, reset, open]);

  const lat = watch('latitude');
  const lng = watch('longitude');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-on-surface/5 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/5">
          <h2 className="text-lg font-display font-bold text-on-surface">
            {site ? 'Modifier le site' : 'Nouveau site'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Nom du site</label>
            <input
              {...register('name')}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: Siège Casablanca"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Mini map picker */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant mb-1.5">
              <MapPin size={12} /> Localisation (cliquez sur la carte)
            </label>
            <div className="h-48 rounded-lg overflow-hidden border border-on-surface/10">
              <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setValue('latitude', parseFloat(newLat.toFixed(6)));
                    setValue('longitude', parseFloat(newLng.toFixed(6)));
                  }}
                />
              </MapContainer>
            </div>
          </div>

          {/* Lat/Lng/Radius row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Latitude</label>
              <input
                {...register('latitude')}
                type="number"
                step="any"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Longitude</label>
              <input
                {...register('longitude')}
                type="number"
                step="any"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Rayon (m)</label>
              <input
                {...register('radius_meters')}
                type="number"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-on-surface/10 text-sm text-on-surface font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.radius_meters && <p className="text-xs text-red-500 mt-1">{errors.radius_meters.message}</p>}
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-on-surface">Site actif</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" isLoading={isLoading}>
              {site ? 'Enregistrer' : 'Créer le site'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
