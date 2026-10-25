import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CourierProfile, DeliveryOrder } from '../types';
import { Compass, Layers, LocateFixed } from 'lucide-react';

interface LeafletMapProps {
  activeOrder?: DeliveryOrder;
  allOrders?: DeliveryOrder[];
  couriers: CourierProfile[];
  mode: 'single' | 'fleet';
  onSelectOrder?: (orderId: string) => void;
  onOpenCourierStory?: (courier: CourierProfile) => void;
  heightClass?: string;
}

const MAPUTO_CENTER: [number, number] = [-25.9655, 32.5892];

const MAPUTO_LANDMARKS = [
  { lat: -25.9672, lng: 32.5968, name: 'Hotel Polana Serena', area: 'Polana Cimento' },
  { lat: -25.9739, lng: 32.5732, name: 'Marginal / Zambi', area: 'Baixa de Maputo' },
  { lat: -25.9682, lng: 32.5736, name: 'Praça da Independência', area: 'Centro' },
  { lat: -25.9442, lng: 32.6085, name: 'Baía Mall Maputo', area: 'Av. da Marginal' },
  { lat: -25.9512, lng: 32.5985, name: 'Sommerschield II', area: 'Sommerschield' },
  { lat: -25.9792, lng: 32.5944, name: 'Ponta Vermelha', area: 'Miradouro' },
];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  activeOrder,
  allOrders = [],
  couriers,
  mode,
  onSelectOrder,
  heightClass = 'h-[380px] lg:h-[460px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('dark');

  // Initialize Leaflet Map centered on Maputo, Moçambique
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = activeOrder
      ? [activeOrder.courierLocation.lat, activeOrder.courierLocation.lng]
      : MAPUTO_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO · Maputo, Moçambique',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    layerGroupRef.current = layerGroup;

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch tile style on demand
  useEffect(() => {
    if (!tileLayerRef.current) return;
    const url =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current.setUrl(url);
  }, [mapStyle]);

  // Render Maputo landmarks, markers, and vector routes reactively
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Render subtle reference pins for iconic Maputo places
    MAPUTO_LANDMARKS.forEach((place) => {
      const placeIcon = L.divIcon({
        className: 'maputo-landmark-pin',
        html: `
          <div style="display:flex;align-items:center;gap:4px;transform:translate(-50%,-50%);pointer-events:auto;">
            <div style="width:6px;height:6px;border-radius:50%;background:#38bdf8;box-shadow:0 0 6px #38bdf8;"></div>
            <span style="font-size:9px;color:#94a3b8;background:rgba(9,13,22,0.82);padding:1px 5px;border-radius:4px;border:1px solid rgba(51,65,85,0.6);white-space:nowrap;">
              ${place.name}
            </span>
          </div>
        `,
        iconSize: [12, 12],
      });

      L.marker([place.lat, place.lng], { icon: placeIcon })
        .bindPopup(
          `<div style="font-size:12px;">
            <strong style="color:#38bdf8;">${place.name}</strong><br/>
            <span style="color:#cbd5e1;">${place.area} · Maputo, Moçambique</span>
          </div>`
        )
        .addTo(group);
    });

    const ordersToRender =
      mode === 'single' && activeOrder
        ? [activeOrder]
        : allOrders.filter((o) => o.status !== 'delivered');

    ordersToRender.forEach((order) => {
      const isVip = order.category === 'vip';
      const primaryColor = isVip ? '#f59e0b' : '#10b981';
      const courier = couriers.find((c) => c.id === order.assignedCourierId);

      // Compute interpolated courier position based on routeProgress
      const progressRatio = Math.max(0, Math.min(100, order.routeProgress)) / 100;
      const currentLat =
        order.origin.lat + (order.destination.lat - order.origin.lat) * progressRatio;
      const currentLng =
        order.origin.lng + (order.destination.lng - order.origin.lng) * progressRatio;

      // Waypoint mid-curve for realistic Maputo avenue geometry
      const midLat = (order.origin.lat + order.destination.lat) / 2 + 0.0012;
      const midLng = (order.origin.lng + order.destination.lng) / 2 - 0.0010;

      // Full Planned Route Line (Dashed)
      L.polyline(
        [
          [order.origin.lat, order.origin.lng],
          [midLat, midLng],
          [order.destination.lat, order.destination.lng],
        ],
        {
          color: '#475569',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.7,
        }
      ).addTo(group);

      // Active Completed Segment (Solid high-contrast vector line)
      L.polyline(
        [
          [order.origin.lat, order.origin.lng],
          [currentLat, currentLng],
        ],
        {
          color: primaryColor,
          weight: 4,
          opacity: 0.95,
        }
      ).addTo(group);

      // Origin Marker (Restaurante / Ponto de Recolha em Maputo)
      const originIcon = L.divIcon({
        className: 'custom-origin-pin',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
            <div style="background:#0f172a;border:2px solid #94a3b8;color:#f8fafc;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:600;white-space:nowrap;margin-bottom:3px;box-shadow:0 4px 10px rgba(0,0,0,0.5);">
              Recolha · ${order.code}
            </div>
            <div style="width:16px;height:16px;border-radius:50%;background:#0f172a;border:4px solid #cbd5e1;box-shadow:0 0 0 3px rgba(15,23,42,0.8);"></div>
          </div>
        `,
        iconSize: [24, 24],
      });

      L.marker([order.origin.lat, order.origin.lng], { icon: originIcon })
        .bindPopup(
          `<div style="font-size:12px;">
            <strong style="color:${primaryColor};">Origem / Recolha (${order.code})</strong><br/>
            <span>${order.origin.label}</span><br/>
            <span style="color:#94a3b8;font-size:11px;">${order.origin.address}</span>
          </div>`
        )
        .addTo(group);

      // Destination Marker (Cliente Final em Maputo)
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
            <div style="background:#0f172a;border:2px solid ${primaryColor};color:${primaryColor};padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;margin-bottom:3px;box-shadow:0 4px 10px rgba(0,0,0,0.6);">
              Destino · PIN ${order.pinCode}
            </div>
            <div style="width:18px;height:18px;border-radius:50%;background:${primaryColor};border:3px solid #090d16;box-shadow:0 0 12px ${primaryColor};"></div>
          </div>
        `,
        iconSize: [24, 24],
      });

      L.marker([order.destination.lat, order.destination.lng], { icon: destIcon })
        .bindPopup(
          `<div style="font-size:12px;">
            <strong style="color:${primaryColor};">Destino Final (${order.customerName})</strong><br/>
            <span>${order.destination.label}</span><br/>
            <span style="color:#94a3b8;font-size:11px;">Validação PIN: <strong>${order.pinCode}</strong> · ${order.totalPrice.toFixed(0)} MT</span>
          </div>`
        )
        .addTo(group);

      // Custom Animated Motorcycle Marker (Mota Estafeta em Maputo)
      const motoIcon = L.divIcon({
        className: 'courier-map-marker',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-55%);cursor:pointer;">
            <div style="background:#090d16;border:1.5px solid ${primaryColor};color:#f8fafc;padding:2px 7px;border-radius:8px;font-size:10px;font-family:monospace;font-weight:700;white-space:nowrap;margin-bottom:4px;box-shadow:0 6px 14px rgba(0,0,0,0.75);display:flex;align-items:center;gap:4px;">
              <span style="color:${primaryColor};">${isVip ? '★ VIP' : '● REG'}</span>
              <span>${courier ? courier.name.split(' ')[0] : 'Estafeta'}</span>
              ${isVip && courier ? `<span style="color:#fbbf24;">${courier.thermalTempHot.toFixed(0)}°C</span>` : ''}
            </div>
            <div style="width:36px;height:36px;border-radius:50%;background:#0f172a;border:2.5px solid ${primaryColor};display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${primaryColor}66;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
      });

      const marker = L.marker([currentLat, currentLng], { icon: motoIcon }).addTo(group);
      marker.on('click', () => {
        if (onSelectOrder) onSelectOrder(order.id);
      });
    });
  }, [activeOrder, allOrders, couriers, mode, onSelectOrder]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (mode === 'single' && activeOrder) {
      const bounds = L.latLngBounds(
        [activeOrder.origin.lat, activeOrder.origin.lng],
        [activeOrder.destination.lat, activeOrder.destination.lng]
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    } else {
      map.setView(MAPUTO_CENTER, 13);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 bg-slate-900`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Telemetry Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200 flex items-center gap-2 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">Maputo, Moçambique · Mapa 2D</span>
          {mode === 'single' && activeOrder && (
            <>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-amber-400">
                {activeOrder.routeProgress}% concluído
              </span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Interactive Map Controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMapStyle((prev) => (prev === 'dark' ? 'street' : 'dark'))}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Alternar estilo de mapa vetorial de Maputo"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{mapStyle === 'dark' ? 'Modo Diurno' : 'Modo Noturno'}</span>
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Centrar rota em Maputo"
        >
          <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
          <span>Centrar Maputo</span>
        </button>
      </div>
    </div>
  );
};
