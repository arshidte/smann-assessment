'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LeafletMap from '@/components/LeafletMap';
import type { MapMarker } from '@/components/LeafletMap';
import type { LatLng, AgentLocationUpdate } from '@/types';
import { calculateBackoff } from '@/utils/backoff';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function getWsUrl(): string {
  const base = BACKEND_URL.replace(/^http/, 'ws');
  return `${base}/ws/tracking`;
}

/** Default center: Pune, Maharashtra */
const DEFAULT_CENTER: LatLng = { lat: 18.5204, lng: 73.8567 };

export default function TrackingPage() {
  const [agentPosition, setAgentPosition] = useState<LatLng>(DEFAULT_CENTER);
  const [path, setPath] = useState<LatLng[]>([]);
  const [speed, setSpeed] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef<boolean>(true);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    mountedRef.current = true;

    function scheduleReconnect() {
      if (!mountedRef.current) return;
      attemptRef.current += 1;
      const delay = calculateBackoff(attemptRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, delay);
    }

    function connect() {
      if (!mountedRef.current) return;

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        attemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data: AgentLocationUpdate = JSON.parse(event.data);
          const newPos: LatLng = { lat: data.latitude, lng: data.longitude };
          setAgentPosition(newPos);
          setPath((prev) => [...prev, newPos]);
          setSpeed(data.speed);
          setLastUpdate(new Date(data.timestamp));
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose fires after onerror, reconnect handled there
        ws.close();
      };
    }

    connectRef.current = connect;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
    };
  }, []);

  const markers: MapMarker[] = [
    { position: agentPosition, label: `Agent — ${speed.toFixed(1)} km/h` },
  ];

  return (
    <main style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Delivery Tracker — Live Tracking</h1>
      <p style={{ marginBottom: '1rem', color: '#555' }}>
        Track your delivery agent in real time.
      </p>

      {/* Connection status indicator */}
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          backgroundColor: connected ? '#e8f5e9' : '#fff3e0',
          color: connected ? '#2e7d32' : '#e65100',
          fontSize: '0.9rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: connected ? '#4caf50' : '#ff9800',
          }}
        />
        {connected ? 'Connected — receiving live updates' : 'Reconnecting...'}
      </div>

      {/* Speed and last update info */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1rem',
          fontSize: '0.95rem',
          color: '#333',
        }}
      >
        <div>
          <strong>Speed:</strong> {speed.toFixed(1)} km/h
        </div>
        <div>
          <strong>Last update:</strong>{' '}
          {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
        </div>
      </div>

      {/* Map */}
      <div style={{ marginBottom: '1rem' }}>
        <LeafletMap
          center={agentPosition}
          markers={markers}
          polyline={path}
          mode="tracking"
        />
      </div>

      <nav style={{ marginTop: '1rem' }}>
        <Link href="/">← Back to Address Lookup</Link>
      </nav>
    </main>
  );
}
