import { useCallback, useEffect, useState } from 'react';

/** Loads a static JSON file. retry() tries again after a failure. */
export function useJson<T>(url: string) {
  const [data, setData] = useState<T | null>(null), [err, setErr] = useState(false), [n, setN] = useState(0);
  useEffect(() => {
    setErr(false);
    fetch(url).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then(setData).catch(() => setErr(true));
  }, [url, n]);
  return { data, err, retry: useCallback(() => setN(k => k + 1), []) };
}
