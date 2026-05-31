import React, { useState, useEffect } from "react";
import { useVersionCheck } from "@/hooks/use-version-check";
import { UpdateModal } from "@/components/update-modal";

/**
 * Provider component that handles version checking and displays update modal
 * Wraps the entire app to ensure update notifications appear on startup
 */
export function VersionCheckProvider({ children }: { children: React.ReactNode }) {
  const versionState = useVersionCheck();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    // Show update modal only if update is available
    if (versionState.updateAvailable && versionState.versionInfo) {
      setShowUpdateModal(true);
    }
  }, [versionState.updateAvailable, versionState.versionInfo]);

  const handleDismissModal = () => {
    setShowUpdateModal(false);
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
          onDismiss={handleDismissModal}
        />
      )}
    </>
  );
}
