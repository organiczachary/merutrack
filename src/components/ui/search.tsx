import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter, Clock, Star } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';

export interface SearchOption {
  value: string;
  label: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface SearchFilter {
  id: string;
  label: string;
  options: SearchOption[];
  multiple?: boolean;
}

interface UniversalSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: Record<string, string[]>) => void;
  suggestions?: SearchOption[];
  filters?: SearchFilter[];
  recentSearches?: string[];
  onSaveSearch?: (query: string, filters: Record<string, string[]>) => void;
  savedSearches?: Array<{ id: string; label: string; query: string; filters: Record<string, string[]> }>;
  className?: string;
}

export function UniversalSearch({
  placeholder = "Search...",
  onSearch,
  suggestions = [],
  filters = [],
  recentSearches = [],
  onSaveSearch,
  savedSearches = [],
  className = ""
}: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchOption[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [query, suggestions]);

  const handleSearch = useCallback(() => {
    onSearch(query, activeFilters);
    setShowSuggestions(false);
  }, [query, activeFilters, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [handleSearch]);

  const handleSuggestionClick = useCallback((suggestion: SearchOption) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    onSearch(suggestion.value, activeFilters);
  }, [activeFilters, onSearch]);

  const handleFilterChange = useCallback((filterId: string, value: string, checked: boolean) => {
    setActiveFilters(prev => {
      const filterValues = prev[filterId] || [];
      if (checked) {
        return { ...prev, [filterId]: [...filterValues, value] };
      } else {
        return { ...prev, [filterId]: filterValues.filter(v => v !== value) };
      }
    });
  }, []);

  const clearFilter = useCallback((filterId: string, value?: string) => {
    setActiveFilters(prev => {
      if (value) {
        const filterValues = prev[filterId] || [];
        return { ...prev, [filterId]: filterValues.filter(v => v !== value) };
      } else {
        const newFilters = { ...prev };
        delete newFilters[filterId];
        return newFilters;
      }
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-20 h-12 glass-card border-glass-border bg-glass-bg"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs rounded-full"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-card border-glass-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-destructive"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    <div className="space-y-1">
                      {filter.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type={filter.multiple ? "checkbox" : "radio"}
                            id={`${filter.id}-${option.value}`}
                            name={filter.multiple ? undefined : filter.id}
                            checked={activeFilters[filter.id]?.includes(option.value) || false}
                            onChange={(e) => handleFilterChange(filter.id, option.value, e.target.checked)}
                            className="rounded border-border"
                          />
                          <label 
                            htmlFor={`${filter.id}-${option.value}`}
                            className="text-sm cursor-pointer flex items-center gap-2"
                          >
                            {option.icon}
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(activeFilters).map(([filterId, values]) =>
            values.map((value) => {
              const filter = filters.find(f => f.id === filterId);
              const option = filter?.options.find(o => o.value === value);
              return (
                <Badge
                  key={`${filterId}-${value}`}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filter?.label}: {option?.label || value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => clearFilter(filterId, value)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (query || recentSearches.length > 0 || savedSearches.length > 0) && (
        <div className="absolute z-50 w-full mt-1 glass-card border-glass-border rounded-lg shadow-glass-lg max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {filteredSuggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Suggestions</div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.value}
                  className="w-full text-left px-2 py-2 hover:bg-accent/50 rounded-md flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.icon || <Search className="h-4 w-4 text-muted-foreground" />}
                  <span>{suggestion.label}</span>
                  {suggestion.category && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {suggestion.category}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Recent searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1 hover:bg-accent/50 rounded-md text-sm"
                  onClick={() => {
                    setQuery(search);
                    onSearch(search, activeFilters);
                    setShowSuggestions(false);
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Saved Searches */}
          {!query && savedSearches.length > 0 && (
            <div className="p-2 border-t border-border/50">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Saved searches
              </div>
              {savedSearches.slice(0, 3).map((search) => (
                <button
                  key={search.id}
                  className="w-full text-left px-2 py-1 hover:bg-accent/50 rounded-md text-sm"
                  onClick={() => {
                    setQuery(search.query);
                    setActiveFilters(search.filters);
                    onSearch(search.query, search.filters);
                    setShowSuggestions(false);
                  }}
                >
                  {search.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}