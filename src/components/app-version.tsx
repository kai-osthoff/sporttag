'use client';

import { useEffect, useState } from 'react';

export function AppVersion() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    async function getVersion() {
      if (window.electronAPI?.getVersion) {
        const v = await window.electronAPI.getVersion();
        setVersion(v);
      }
    }
    getVersion();
  }, []);

  if (!version) {
    return null;
  }

  return <span className="text-xs opacity-60">v{version}</span>;
}
