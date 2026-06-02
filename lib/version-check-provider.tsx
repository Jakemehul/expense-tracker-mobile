import React, { useState, useEffect } from "react";
import { useVersionCheck } from "@/hooks/use-version-check";
import { UpdateModal } from "@/components/update-modal";
import { checkForUpdates } from "@/lib/background-update-service";

/**
 * Provider component that handles version checking and displays update modal
 * Wraps the entire app to ensure update notifications appear on startup
 * Supports dismissal cooldown and force updates
 * Periodically checks for updates while app is running
 */
export function VersionCheckProvider({ children }: { children: React.ReactNode }) {
  const versionState = useVersionCheck();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Setup periodic update check (runs when app is active)
  useEffect(() => {
    const setupPeriodicCheck = async () => {
      try {
        // Check for updates on app startup
        await checkForUpdates("1.0.1");

        // Set up interval to check every 24 hours while app is running
        const intervalId = setInterval(async () => {
          try {
            await checkForUpdates("1.0.1");
          } catch (error) {
            console.error("Periodic update check failed:", error);
          }
        }, 24 * 60 * 60 * 1000); // 24 hours

        return () => clearInterval(intervalId);
      } catch (error) {
        console.error("Failed to setup update check:", error);
      }
    };

    const cleanup = setupPeriodicCheck();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, []);

  // Show update modal when update is available
  useEffect(() => {
    // Show update modal only if:
    // 1. Update is available
    // 2. Version info is available
    // 3. Should show based on dismissal history or force update
    if (
      versionState.updateAvailable &&
      versionState.versionInfo &&
      versionState.shouldShow
    ) {
      setShowUpdateModal(true);
    }
  }, [
    versionState.updateAvailable,
    versionState.versionInfo,
    versionState.shouldShow,
  ]);

  const handleDismissModal = () => {
    // Only allow dismissal if not a force update
    if (!versionState.versionInfo?.forceUpdate) {
      versionState.handleDismiss();
      setShowUpdateModal(false);
    }
  };

  return (
    <>
      {children}
      {versionState.versionInfo && (
        <UpdateModal
          visible={showUpdateModal}
          latestVersion={versionState.versionInfo.latestVersion}
          releaseNotes={versionState.versionInfo.releaseNotes}
          downloadUrl={versionState.versionInfo.downloadUrl}
          changelog={versionState.versionInfo.changelog}
          forceUpdate={versionState.versionInfo.forceUpdate}
          onDismiss={handleDismissModal}
        />
      )}
    </>
  );
}
