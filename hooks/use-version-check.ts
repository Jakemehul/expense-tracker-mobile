import { useEffect, useState } from "react";
import { isUpdateAvailable, type VersionInfo } from "@/lib/version-service";
import {
  shouldShowUpdateNotification,
  recordUpdateDismissal,
} from "@/lib/version-dismissal-service";

export interface UpdateCheckState {
  isLoading: boolean;
  updateAvailable: boolean;
  versionInfo: VersionInfo | null;
  error: string | null;
  shouldShow: boolean; // Whether to show based on dismissal history
}

const CURRENT_APP_VERSION = "1.0.21";

/**
 * Hook to check for app updates on startup
 * Handles dismissal cooldown and force updates
 */
export function useVersionCheck() {
  const [state, setState] = useState<UpdateCheckState>({
    isLoading: true,
    updateAvailable: false,
    versionInfo: null,
    error: null,
    shouldShow: false,
  });

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch("/api/version.latest");
        if (!response.ok) throw new Error("Failed to fetch version info");
        const data: VersionInfo = await response.json();

        const updateAvailable = isUpdateAvailable(
          CURRENT_APP_VERSION,
          data.latestVersion
        );

        // Check if we should show the notification based on dismissal history
        // Always show if it's a force update
        let shouldShow = false;
        if (data.forceUpdate) {
          shouldShow = true;
        } else if (updateAvailable) {
          shouldShow = await shouldShowUpdateNotification(data.latestVersion);
        }

        setState({
          isLoading: false,
          updateAvailable,
          versionInfo: data,
          error: null,
          shouldShow,
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

  /**
   * Handle user dismissing the update notification
   * Records dismissal time for 7-day cooldown
   */
  const handleDismiss = async () => {
    if (state.versionInfo && !state.versionInfo.forceUpdate) {
      await recordUpdateDismissal(state.versionInfo.latestVersion);
    }
  };

  return { ...state, handleDismiss };
}
