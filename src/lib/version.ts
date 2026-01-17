import { gt, coerce } from 'semver';

/**
 * Compare two version strings using semantic versioning.
 * Handles "v" prefix (e.g., "v1.2.3" from GitHub tags).
 *
 * @param latestTag - The latest version tag (may have "v" prefix)
 * @param currentVersion - The current app version (from package.json)
 * @returns true if latestTag is newer than currentVersion
 */
export function isNewerVersion(latestTag: string, currentVersion: string): boolean {
  // coerce handles "v" prefix and partial versions
  const latest = coerce(latestTag);
  const current = coerce(currentVersion);

  if (!latest || !current) {
    return false; // Can't compare invalid versions
  }

  return gt(latest, current);
}
