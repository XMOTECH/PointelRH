import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../components/ui/Card';
import { Plus, Download, Search, MapPin, QrCode, Radio, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from './hooks/useLocations';
import { SiteFormModal } from './components/SiteFormModal';
import { DeleteSiteDialog } from './components/DeleteSiteDialog';
import { SiteCard } from './components/SiteCard';
import { exportQrPdf } from './components/QrPdfExport';
import type { Site, SitePayload } from './api/locations.api';

// Leaflet icon fix
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Leaflet internal icon configuration needs careful override
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center, 15, { duration: 0.8 });
  return null;
}

function AllSitesView({ sites }: { sites: Site[] }) {
  const map = useMap();
  if (sites.length > 0) {
    const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
  return null;
}

export function QrLocationsPage() {
  const { data: sites = [], isLoading } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const qrRef = useRef<SVGSVGElement>(null);

  const activeSite = selectedSite || sites[0] || null;

  const filteredSites = sites.filter((s: Site) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeSites = sites.filter((s: Site) => s.is_active).length;
  const inactiveSites = sites.length - activeSites;

  const handleCreate = useCallback((data: SitePayload) => {
    createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
  }, [createMutation, setFormOpen]);

  const handleUpdate = useCallback((data: SitePayload) => {
    if (!editingSite) return;
    updateMutation.mutate({ id: editingSite.id, data }, { onSuccess: () => { setEditingSite(null); } });
  }, [updateMutation, editingSite, setEditingSite]);

  const handleDelete = useCallback(() => {
    if (!deletingSite) return;
    deleteMutation.mutate(deletingSite.id, {
      onSuccess: () => {
        if (selectedSite?.id === deletingSite.id) setSelectedSite(null);
        setDeletingSite(null);
      },
    });
  }, [deleteMutation, deletingSite, selectedSite, setSelectedSite, setDeletingSite]);

  const handleExportPdf = () => {
    if (!activeSite || !qrRef.current) return;
    exportQrPdf(activeSite, qrRef.current);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-on-surface-variant">Chargement des sites...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight">Sites & Terminaux</h1>
          <p className="text-sm text-on-surface-variant opacity-60">Gestion géographique des points de pointage</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
              <Activity size={14} className="text-emerald-500" />
              <span>{activeSites} actif{activeSites > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
              <Radio size={14} className="text-red-400" />
              <span>{inactiveSites} inactif{inactiveSites > 1 ? 's' : ''}</span>
            </div>
          </div>
          <Button className="flex items-center gap-2" onClick={() => { setEditingSite(null); setFormOpen(true); }}>
            <Plus size={18} />
            Nouveau Site
          </Button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-3">
          <MapPin size={40} className="opacity-30" />
          <p>Aucun site configuré. Créez votre premier site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left column — Sites list */}
          <div className="xl:col-span-3 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un site..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low border border-on-surface/10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredSites.map((site: Site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  isSelected={activeSite?.id === site.id}
                  onSelect={() => setSelectedSite(site)}
                  onEdit={() => { setEditingSite(site); setFormOpen(true); }}
                  onDelete={() => setDeletingSite(site)}
                />
              ))}
              {filteredSites.length === 0 && (
                <p className="text-xs text-on-surface-variant text-center py-8 opacity-60">Aucun résultat</p>
              )}
            </div>
          </div>

          {/* Center column — Map */}
          <div className="xl:col-span-6 flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden border border-on-surface/5 h-[420px] relative">
              <div className="h-full w-full grayscale contrast-[1.1] brightness-[0.95]">
                <MapContainer
                  center={activeSite ? [activeSite.latitude, activeSite.longitude] : [33.57, -7.59]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {activeSite && <FlyTo center={[activeSite.latitude, activeSite.longitude]} />}
                  {!activeSite && sites.length > 0 && <AllSitesView sites={sites} />}
                  {sites.map((s: Site) => (
                    <div key={s.id}>
                      <Marker
                        position={[s.latitude, s.longitude]}
                        eventHandlers={{ click: () => setSelectedSite(s) }}
                      />
                      <Circle
                        center={[s.latitude, s.longitude]}
                        radius={s.radius_meters}
                        pathOptions={{
                          color: activeSite?.id === s.id ? '#0041c8' : '#6b7280',
                          fillColor: activeSite?.id === s.id ? '#0041c8' : '#6b7280',
                          fillOpacity: activeSite?.id === s.id ? 0.12 : 0.05,
                          weight: activeSite?.id === s.id ? 2 : 1,
                        }}
                      />
                    </div>
                  ))}
                </MapContainer>
              </div>
            </div>

            {activeSite && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-surface-container-low border-none p-4" withAccent={false}>
                  <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5 block">Géo-fencing</span>
                  <p className="text-lg font-bold text-on-surface">{activeSite.radius_meters}m</p>
                </Card>
                <Card className="bg-surface-container-low border-none p-4" withAccent={false}>
                  <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5 block">Latitude</span>
                  <p className="text-sm font-mono font-bold text-on-surface">{activeSite.latitude.toFixed(6)}</p>
                </Card>
                <Card className="bg-surface-container-low border-none p-4" withAccent={false}>
                  <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5 block">Longitude</span>
                  <p className="text-sm font-mono font-bold text-on-surface">{activeSite.longitude.toFixed(6)}</p>
                </Card>
              </div>
            )}
          </div>

          {/* Right column — QR & Details */}
          {activeSite && (
            <div className="xl:col-span-3 flex flex-col gap-4">
              {/* QR Code card */}
              <Card className="bg-surface-container-low border-none p-6 flex flex-col items-center text-center" withAccent={false}>
                <div className="bg-white p-4 rounded-2xl border border-on-surface/5 mb-4">
                  <QRCodeSVG
                    ref={qrRef}
                    value={activeSite.qr_token || `pointelrh://site/${activeSite.id}`}
                    size={140}
                    level="H"
                  />
                </div>
                <span className="text-sm font-bold text-on-surface mb-0.5">Code QR Terminal</span>
                <p className="text-xs text-on-surface-variant opacity-60 mb-4">{activeSite.name}</p>
                <Button className="w-full flex items-center justify-center gap-2" variant="tertiary" onClick={handleExportPdf}>
                  <Download size={16} />
                  Exporter en PDF
                </Button>
              </Card>

              {/* Terminal section */}
              <Card className="bg-surface-container-low border-none p-5" withAccent={false}>
                <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-3 block">Terminaux associés</span>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeSite.is_active ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <QrCode size={16} className={activeSite.is_active ? 'text-emerald-600' : 'text-red-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface">Terminal QR Mural</p>
                    <p className="text-[10px] text-on-surface-variant">Code unique généré</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${activeSite.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                    {activeSite.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              </Card>

              {/* Site info */}
              <Card className="bg-surface-container-low border-none p-5" withAccent={false}>
                <span className="text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-3 block">Informations</span>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Statut</span>
                    <span className={`font-bold ${activeSite.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                      {activeSite.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Rayon</span>
                    <span className="font-bold text-on-surface">{activeSite.radius_meters}m</span>
                  </div>
                  {activeSite.qr_token && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Token</span>
                      <span className="font-mono text-[10px] text-on-surface opacity-60 truncate max-w-[120px]">{activeSite.qr_token}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <SiteFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingSite(null); }}
        onSubmit={editingSite ? handleUpdate : handleCreate}
        isLoading={editingSite ? updateMutation.isPending : createMutation.isPending}
        site={editingSite}
      />

      <DeleteSiteDialog
        open={!!deletingSite}
        siteName={deletingSite?.name || ''}
        onClose={() => setDeletingSite(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
