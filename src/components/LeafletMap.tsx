'use client';

import dynamic from 'next/dynamic';
import type { LeafletMapProps, MapMarker } from './LeafletMapInner';

/**
 * Dynamically imported LeafletMap component with SSR disabled.
 * Leaflet requires `window` and `document` which are not available during SSR.
 */
const LeafletMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '400px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
        borderRadius: '8px',
        color: '#666',
      }}
    >
      Loading map…
    </div>
  ),
});

export default LeafletMap;
export type { LeafletMapProps, MapMarker };
