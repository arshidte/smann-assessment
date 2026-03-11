'use client';

import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '@/types';

/** Fix default marker icon paths broken by bundlers */
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Distinct agent marker icon (blue → orange/red) for tracking mode */
const agentIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface MapMarker {
  position: LatLng;
  label?: string;
}

export interface LeafletMapProps {
  center: LatLng;
  markers: MapMarker[];
  polyline?: LatLng[];
  mode: 'address' | 'tracking';
}

const ADDRESS_ZOOM = 15;
const TRACKING_ZOOM = 16;

/**
 * Helper component that recenters the map when the center prop changes.
 * In tracking mode it also auto-pans to keep the agent visible.
 */
function RecenterMap({ center, mode }: { center: LatLng; mode: 'address' | 'tracking' }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (mode === 'tracking') {
      map.panTo([center.lat, center.lng]);
    } else {
      map.setView([center.lat, center.lng], ADDRESS_ZOOM);
    }
  }, [center.lat, center.lng, mode, map]);

  return null;
}

export default function LeafletMapInner({
  center,
  markers,
  polyline,
  mode,
}: LeafletMapProps) {
  const zoom = mode === 'address' ? ADDRESS_ZOOM : TRACKING_ZOOM;

  const polylinePositions: [number, number][] =
    polyline?.map((p) => [p.lat, p.lng] as [number, number]) ?? [];

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} mode={mode} />

      {markers.map((m, idx) => (
        <Marker
          key={`${m.position.lat}-${m.position.lng}-${idx}`}
          position={[m.position.lat, m.position.lng]}
          icon={mode === 'tracking' ? agentIcon : defaultIcon}
        >
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}

      {mode === 'tracking' && polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.7 }}
        />
      )}
    </MapContainer>
  );
}
