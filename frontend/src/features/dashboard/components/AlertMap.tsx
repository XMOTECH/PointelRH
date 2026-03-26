import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAttendancesToday } from '../hooks/useDashboard';

// Leaflet icon fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Leaflet internal icon configuration needs careful override
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AttendanceWithLocation {
  id: string;
  status: string;
  latitude?: string;
  longitude?: string;
  employee_name?: string;
}

const defaultCenter: [number, number] = [14.7167, -17.4677];

export function AlertMap() {
  const { data: rawAttendances = [] } = useAttendancesToday();
  const attendances = (rawAttendances as unknown as AttendanceWithLocation[]);

  const alertLocations = attendances
    .filter((a) => a.status === 'late' && a.latitude && a.longitude)
    .map((a) => ({
      id: a.id,
      pos: [parseFloat(a.latitude!), parseFloat(a.longitude!)] as [number, number],
      name: a.employee_name || 'Employé',
    }));

  const center: [number, number] = alertLocations.length > 0
    ? alertLocations[0].pos
    : defaultCenter;

  return (
    <Card className="bg-surface-container-lowest border-none p-0 overflow-hidden h-[350px]">
      <CardHeader className="absolute top-4 left-4 z-[1000] p-0">
        <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
          <CardTitle className="text-xs font-display font-bold text-on-surface uppercase tracking-widest">Cartographie des Alertes</CardTitle>
        </div>
      </CardHeader>

      <div className="h-full w-full grayscale contrast-[1.2] opacity-80 invert-[0.05]">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {alertLocations.map((loc) => (
            <React.Fragment key={loc.id}>
              <Marker position={loc.pos}>
                <Popup>{loc.name}</Popup>
              </Marker>
              <Circle
                center={loc.pos}
                radius={300}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 1 }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[8px] font-bold text-on-surface uppercase tracking-tighter">
                 {alertLocations.length > 0 ? `${alertLocations.length} Retard(s)` : 'Aucune alerte'}
               </span>
            </div>
         </div>
      </div>
    </Card>
  );
}
