export interface StructuredAddress {
  street: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  displayName: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  displayName: string;
  placeId: string;
  lat: number;
  lon: number;
}

export interface ForwardGeocodeResponse {
  latitude: number;
  longitude: number;
  address: StructuredAddress;
  cached: boolean;
}

export interface ReverseGeocodeResponse {
  latitude: number;
  longitude: number;
  address: StructuredAddress;
}

export interface AutocompleteResponse {
  suggestions: AddressSuggestion[];
}

export interface AgentLocationUpdate {
  agentId: string;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO 8601
  speed: number; // km/h
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string; // ISO 8601
}
