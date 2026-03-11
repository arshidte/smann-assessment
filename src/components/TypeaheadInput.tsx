'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AddressSuggestion } from '@/types';
import { autocomplete } from '@/services/api';

interface TypeaheadInputProps {
  onSelect: (suggestion: AddressSuggestion) => void;
  disabled?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export default function TypeaheadInput({ onSelect, disabled, userLocation }: TypeaheadInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await autocomplete(
        searchQuery,
        userLocation?.lat,
        userLocation?.lng
      );
      setSuggestions(data.suggestions);
      setIsOpen(data.suggestions.length > 0);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const debouncedFetch = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, DEBOUNCE_MS);
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    // The paste will update the input via onChange, but we also
    // trigger a debounced fetch with the pasted content directly
    // to ensure it's treated as a search query.
    const newValue = pasted;
    setQuery(newValue);
    debouncedFetch(newValue);
    e.preventDefault();
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.displayName);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(suggestion);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        placeholder="Search for an address..."
        aria-label="Address search"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
        }}
      />
      {loading && (
        <span
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.8rem',
            color: '#888',
          }}
        >
          Loading…
        </span>
      )}
      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: '#fff',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              role="option"
              onClick={() => handleSelect(s)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
              }}
            >
              {s.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
