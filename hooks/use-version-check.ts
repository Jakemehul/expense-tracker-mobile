import { useEffect, useState } from "react";
import { isUpdateAvailable, type VersionInfo } from "@/lib/version-service";

export interface UpdateCheckState {
  isLoading: boolean;
  updateAvailable: boolean;
  versionInfo: VersionInfo | null;
  error: string | null;
}

const CURRENT_APP_VERSION = "1.0.0";

/**
 * Hook to check for app updates on startup
 * Uses simple fetch to avoid tRPC context issues
 */
export function useVersionCheck() {
  const [state, setState] = useState<UpdateCheckState>({
    isLoading: true,
    updateAvailable: false,
    versionInfo: null,
    error: null,
  });

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch("/api/version.latest");
        if (!response.ok) throw new Error("Failed to fetch version info");
        const data = await response.json();

        const updateAvailable = isUpdateAvailable(
          CURRENT_APP_VERSION,
          data.latestVersion
        );

        setState({
          isLoading: false,
          updateAvailable,
          versionInfo: data,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to check for updates",
        }));
      }
    };

    checkVersion();
  }, []);

  return state;
}
