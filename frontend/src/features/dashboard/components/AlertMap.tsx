import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';

// Leaflet icon fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center: [number, number] = [14.7167, -17.4677]; // Dakar, Senegal example

const alertLocations = [
  { id: 1, pos: [14.7200, -17.4700] as [number, number], name: 'Jean-Pierre Petit' },
  { id: 2, pos: [14.7100, -17.4600] as [number, number], name: 'Amélie Laurent' },
  { id: 3, pos: [14.7000, -17.4800] as [number, number], name: 'Lucas Martin' },
];

export function AlertMap() {
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
               <span className="text-[8px] font-bold text-on-surface uppercase tracking-tighter">Live Alert Zone</span>
            </div>
         </div>
      </div>
    </Card>
  );
}
