'use client';

import type { StructuredAddress } from '@/types';

interface ExpandedAddressFieldsProps {
  address: StructuredAddress;
  onChange: (field: string, value: string) => void;
  onUpdate: () => void;
}

const fields: { key: keyof StructuredAddress; label: string }[] = [
  { key: 'street', label: 'Street / Building' },
  { key: 'area', label: 'Area / Locality' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postalCode', label: 'Postal Code' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#333',
};

export default function ExpandedAddressFields({
  address,
  onChange,
  onUpdate,
}: ExpandedAddressFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label htmlFor={`address-${key}`} style={labelStyle}>
            {label}
          </label>
          <input
            id={`address-${key}`}
            type="text"
            value={address[key]}
            onChange={(e) => onChange(key, e.target.value)}
            aria-label={label}
            style={inputStyle}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={onUpdate}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '0.25rem',
        }}
      >
        Update Location
      </button>
    </div>
  );
}
