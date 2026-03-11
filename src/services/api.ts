import type {
  ForwardGeocodeResponse,
  ReverseGeocodeResponse,
  AutocompleteResponse,
  ErrorResponse,
} from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Forward geocode an address string to coordinates.
 * @throws Error with user-facing message on failure
 */
export async function forwardGeocode(address: string): Promise<ForwardGeocodeResponse> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/geocode/forward?address=${encodeURIComponent(address)}`);
  } catch {
    throw new Error('Geocoding service is temporarily unavailable. Please try again.');
  }

  if (!res.ok) {
    const body: ErrorResponse | null = await res.json().catch(() => null);
    if (res.status === 404) {
      throw new Error(body?.message || 'No results found for the entered address.');
    }
    throw new Error(body?.message || 'Geocoding service is temporarily unavailable. Please try again.');
  }

  return res.json();
}

/**
 * Reverse geocode coordinates to a structured address.
 * @throws Error with user-facing message on failure
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/geocode/reverse?lat=${lat}&lon=${lon}`);
  } catch {
    throw new Error('Geocoding service is temporarily unavailable. Please try again.');
  }

  if (!res.ok) {
    const body: ErrorResponse | null = await res.json().catch(() => null);
    throw new Error(body?.message || 'Geocoding service is temporarily unavailable. Please try again.');
  }

  return res.json();
}

/**
 * Fetch autocomplete suggestions for a partial address query.
 * @throws Error with user-facing message on failure
 */
export async function autocomplete(query: string, lat?: number, lon?: number): Promise<AutocompleteResponse> {
  let res: Response;
  try {
    let url = `${BACKEND_URL}/api/address/autocomplete?q=${encodeURIComponent(query)}`;
    if (lat !== undefined && lon !== undefined) {
      url += `&lat=${lat}&lon=${lon}`;
    }
    res = await fetch(url);
  } catch {
    throw new Error('Address suggestion service is temporarily unavailable.');
  }

  if (!res.ok) {
    const body: ErrorResponse | null = await res.json().catch(() => null);
    throw new Error(body?.message || 'Address suggestion service is temporarily unavailable.');
  }

  return res.json();
}
