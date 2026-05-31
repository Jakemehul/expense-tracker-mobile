/**
 * Version comparison and update checking service
 */

export interface VersionInfo {
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

/**
 * Compare two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

/**
 * Check if an update is available
 */
export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(latestVersion, currentVersion) > 0;
}

/**
 * Format version info for display
 */
export function formatVersionMessage(versionInfo: VersionInfo): string {
  return `Version ${versionInfo.latestVersion} is available!\n\n${versionInfo.releaseNotes}`;
}
