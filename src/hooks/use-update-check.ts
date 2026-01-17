'use client';

import { useEffect, useState } from 'react';
import { isNewerVersion } from '@/lib/version';

interface UpdateInfo {
  version: string;
  url: string;
}

interface UpdateCheckResult {
  updateInfo: UpdateInfo | null;
  error: string | null;
  dismissed: boolean;
  dismiss: () => void;
}

const GITHUB_API_URL = 'https://api.github.com/repos/kai-osthoff/sporttag/releases/latest';

export function useUpdateCheck(): UpdateCheckResult {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only check in Electron environment
    if (!window.electronAPI?.getVersion) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    async function checkForUpdate() {
      try {
        // Get current app version via IPC
        const currentVersion = await window.electronAPI!.getVersion();

        // Fetch latest release from GitHub
        const response = await fetch(GITHUB_API_URL, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }

        const release = await response.json();
        const latestTag = release.tag_name as string;
        const releaseUrl = release.html_url as string;

        // Compare versions using semver
        if (isNewerVersion(latestTag, currentVersion)) {
          setUpdateInfo({
            version: latestTag.replace(/^v/, ''), // Remove "v" prefix for display
            url: releaseUrl,
          });
        }
      } catch (err) {
        // Don't set error for abort (component unmount or timeout)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError('Konnte nicht nach Updates pruefen');
      } finally {
        clearTimeout(timeoutId);
      }
    }

    checkForUpdate();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const dismiss = () => setDismissed(true);

  return { updateInfo, error, dismissed, dismiss };
}
