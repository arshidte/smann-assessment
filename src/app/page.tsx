'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TypeaheadInput from '@/components/TypeaheadInput';
import LeafletMap from '@/components/LeafletMap';
import type { MapMarker } from '@/components/LeafletMap';
import ExpandedAddressFields from '@/components/ExpandedAddressFields';
import { forwardGeocode as apiForwardGeocode, reverseGeocode as apiReverseGeocode } from '@/services/api';
import type {
  LatLng,
  StructuredAddress,
  AddressSuggestion,
} from '@/types';

const GEOLOCATION_TIMEOUT = 10000;

export default function AddressLookupPage() {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [address, setAddress] = useState<StructuredAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'granted' | 'denied' | 'unavailable'>('pending');

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiReverseGeocode(lat, lng);
      setCoords({ lat: data.latitude, lng: data.longitude });
      setAddress(data.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Geocoding service is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const forwardGeocode = useCallback(async (addressStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiForwardGeocode(addressStr);
      setCoords({ lat: data.latitude, lng: data.longitude });
      setAddress(data.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Geocoding service is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoStatus('granted');
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          // TIMEOUT or POSITION_UNAVAILABLE
          setGeoStatus('unavailable');
        }
      },
      { timeout: GEOLOCATION_TIMEOUT, enableHighAccuracy: false }
    );
  }, [reverseGeocode]);

  const handleTypeaheadSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      forwardGeocode(suggestion.displayName);
    },
    [forwardGeocode]
  );

  const handleAddressFieldChange = useCallback(
    (field: string, value: string) => {
      setAddress((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const handleUpdateLocation = useCallback(() => {
    if (!address) return;
    const combined = [address.street, address.area, address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(', ');
    forwardGeocode(combined);
  }, [address, forwardGeocode]);

  const markers: MapMarker[] = coords && address
    ? [{ position: coords, label: address.displayName }]
    : [];

  return (
    <main style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Delivery Tracker — Address Lookup</h1>
      <p style={{ marginBottom: '1rem', color: '#555' }}>
        Detect your location or search for an address to get started.
      </p>

      {geoStatus === 'unavailable' && (
        <div
          role="status"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            color: '#1565c0',
            fontSize: '0.9rem',
          }}
        >
          Automatic location detection is unavailable. Please search for your address below.
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            color: '#e65100',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          role="status"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#666',
            fontSize: '0.9rem',
          }}
        >
          Loading…
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <TypeaheadInput onSelect={handleTypeaheadSelect} disabled={loading} userLocation={coords} />
      </div>

      {coords && (
        <div style={{ marginBottom: '1rem' }}>
          <LeafletMap center={coords} markers={markers} mode="address" />
        </div>
      )}

      {address && (
        <div style={{ marginBottom: '1rem' }}>
          <ExpandedAddressFields
            address={address}
            onChange={handleAddressFieldChange}
            onUpdate={handleUpdateLocation}
          />
        </div>
      )}

      <nav style={{ marginTop: '1rem' }}>
        <Link href="/tracking">Go to Live Tracking →</Link>
      </nav>
    </main>
  );
}
