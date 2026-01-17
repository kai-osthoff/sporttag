'use client';

import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateCheck } from '@/hooks/use-update-check';

export function UpdateBanner() {
  const { updateInfo, error, dismissed, dismiss } = useUpdateCheck();

  // Don't render if dismissed or nothing to show
  if (dismissed || (!updateInfo && !error)) {
    return null;
  }

  const handleOpenUrl = async () => {
    if (updateInfo?.url) {
      await window.electronAPI?.openExternal(updateInfo.url);
    }
  };

  // Error state banner
  if (error) {
    return (
      <div className="bg-muted text-muted-foreground px-4 py-2 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Schliessen">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Update available banner
  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between print:hidden">
      <span>Version {updateInfo!.version} ist verfuegbar</span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={handleOpenUrl}>
          <ExternalLink className="h-4 w-4" />
          Herunterladen
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Schliessen" className="text-primary-foreground hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
