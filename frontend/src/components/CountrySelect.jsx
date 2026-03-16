import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { countries, countryFlag } from '../data/countries.js';

export default function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = value ? countries.find((c) => c.code === value) : null;

  const filtered = search
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleSelect(code) {
    onChange(code);
    setOpen(false);
    setSearch('');
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors text-left"
      >
        {selected ? (
          <>
            <span className="text-base">{countryFlag(selected.code)}</span>
            <span className="flex-1 truncate">{selected.name}</span>
            <X size={14} className="shrink-0 text-nord3 dark:text-nord4 hover:text-nord11" onClick={handleClear} />
          </>
        ) : (
          <span className="flex-1 text-nord3 dark:text-nord4">-- Select country --</span>
        )}
        <ChevronDown size={14} className={`shrink-0 text-nord3 dark:text-nord4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-nord6 dark:bg-nord1 border border-nord4 dark:border-nord2 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-nord4 dark:border-nord2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-2.5 py-1.5 rounded-md border border-nord4 dark:border-nord2 bg-nord5 dark:bg-nord2 text-nord0 dark:text-nord6 text-sm focus:outline-none focus:ring-2 focus:ring-nord8 transition-colors"
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-nord3 dark:text-nord4 italic">No countries found</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-nord8/15 dark:hover:bg-nord8/20 transition-colors ${
                    c.code === value ? 'bg-nord8/10 dark:bg-nord8/15 font-medium' : ''
                  }`}
                >
                  <span className="text-base">{countryFlag(c.code)}</span>
                  <span className="text-nord0 dark:text-nord6">{c.name}</span>
                  <span className="text-xs text-nord3 dark:text-nord4 ml-auto">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
