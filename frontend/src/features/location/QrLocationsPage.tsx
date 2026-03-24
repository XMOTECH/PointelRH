import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../components/ui/Card';
import { Plus, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Leaflet fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SITES = [
  { id: 1, name: 'Siège Social - Dakar', lat: 14.7167, lng: -17.4677, radius: 100, status: 'Active' },
  { id: 2, name: 'Entrepôt Diamniadio', lat: 14.7500, lng: -17.2000, radius: 500, status: 'Active' },
  { id: 3, name: 'Bureau Regional Saint-Louis', lat: 16.0333, lng: -16.5000, radius: 200, status: 'Inactive' },
];

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export function QrLocationsPage() {
  const [selectedSite, setSelectedSite] = useState(SITES[0]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-8"
    >
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight">Sites & Terminaux</h1>
            <p className="text-sm text-on-surface-variant opacity-60">Gestion géographique des points de pointage</p>
         </div>
         <Button className="flex items-center gap-2">
            <Plus size={18} />
            Nouveau Site
         </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Sites List */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {SITES.map((site) => (
            <div 
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border",
                selectedSite.id === site.id ? "bg-primary/5 border-primary text-primary" : "bg-surface-container-low border-transparent hover:bg-surface-container"
              )}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold opacity-60">Site #{site.id}</span>
                <span className="text-sm font-bold truncate">{site.name}</span>
                <div className="flex items-center gap-2 mt-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${site.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                   <span className="text-[10px] font-bold uppercase">{site.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map & Preview */}
        <div className="xl:col-span-6 flex flex-col gap-6">
           <div className="rounded-2xl overflow-hidden border border-on-surface/5 h-[400px] relative">
              <div className="h-full w-full grayscale contrast-[1.1] brightness-[0.95]">
                <MapContainer center={[selectedSite.lat, selectedSite.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <ChangeView center={[selectedSite.lat, selectedSite.lng]} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[selectedSite.lat, selectedSite.lng]} />
                  <Circle 
                    center={[selectedSite.lat, selectedSite.lng]} 
                    radius={selectedSite.radius}
                    pathOptions={{ color: '#0041c8', fillColor: '#0041c8', fillOpacity: 0.1, weight: 1 }}
                  />
                </MapContainer>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <Card className="bg-surface-container-low border-none p-5">
                 <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-2 block">Géo-fencing</span>
                 <p className="text-sm font-medium text-on-surface">
                    Rayon de sécurité réglé à <strong>{selectedSite.radius}m</strong>.
                 </p>
              </Card>
              <Card className="bg-surface-container-low border-none p-5">
                 <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-2 block">Coordonnées GPS</span>
                 <div className="flex flex-col font-mono text-xs font-bold text-on-surface opacity-70">
                    <span>{selectedSite.lat.toFixed(6)} N</span>
                    <span>{selectedSite.lng.toFixed(6)} W</span>
                 </div>
              </Card>
           </div>
        </div>

        {/* QR Generation */}
        <div className="xl:col-span-3 flex flex-col gap-6">
           <Card className="bg-surface-container-low border-none p-8 flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-2xl border border-on-surface/5 mb-6">
                 <QRCodeSVG 
                    value={`pointelrh://site/${selectedSite.id}`}
                    size={150}
                    level="H"
                 />
              </div>
              <span className="text-sm font-bold text-on-surface mb-1">Code QR Terminal</span>
              <p className="text-xs text-on-surface-variant opacity-60 mb-6">{selectedSite.name}</p>
              
              <Button className="w-full flex items-center justify-center gap-2" variant="tertiary">
                 <Download size={18} />
                 Télécharger Image
              </Button>
           </Card>
        </div>
      </div>
    </motion.div>
  );
}
import { cn } from '../../lib/utils';
