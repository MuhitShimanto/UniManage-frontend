"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debounced = useDebounce(local, 350);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  useEffect(() => {
    if (debounced !== value) {
      onChange(debounced);
    }
  }, [debounced, onChange, value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
        aria-label={placeholder}
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
