import React, { useState, useEffect } from "react";
import { useVersionCheck } from "@/hooks/use-version-check";
import { UpdateModal } from "@/components/update-modal";

/**
 * Provider component that handles version checking and displays update modal
 * Wraps the entire app to ensure update notifications appear on startup
 * Supports dismissal cooldown and force updates
 */
export function VersionCheckProvider({ children }: { children: React.ReactNode }) {
  const versionState = useVersionCheck();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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
