import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export interface UpdateModalProps {
  visible: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  changelog?: string[];
  forceUpdate?: boolean;
  onDismiss: () => void;
}

/**
 * Modal component that displays when a new app version is available
 * Supports detailed changelog and force update scenarios
 */
export function UpdateModal({
  visible,
  latestVersion,
  releaseNotes,
  downloadUrl,
  changelog,
  forceUpdate = false,
  onDismiss,
}: UpdateModalProps) {
  const colors = useColors();
  const [showChangelog, setShowChangelog] = useState(false);

  const handleDownload = async () => {
    try {
      await Linking.openURL(downloadUrl);
      onDismiss();
    } catch (error) {
      console.error("Failed to open download URL:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={forceUpdate ? undefined : onDismiss}
    >
      {/* Backdrop */}
      <View
        className="flex-1 justify-center items-center bg-black/50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        {/* Modal Content */}
        <View
          className="mx-6 rounded-3xl p-6 gap-4 max-h-4/5"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Icon */}
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialIcons
                name={forceUpdate ? "security-update" : "system-update"}
                size={32}
                color={colors.background}
              />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-2xl font-bold text-center"
            style={{ color: colors.foreground }}
          >
            {forceUpdate ? "Critical Update Required" : "Update Available"}
          </Text>

          {/* Version Info */}
          <Text
            className="text-center text-base"
            style={{ color: colors.muted }}
          >
            Version {latestVersion}
          </Text>

          {/* Release Notes */}
          <View className="bg-background rounded-2xl p-4">
            <Text
              className="text-sm leading-relaxed"
              style={{ color: colors.foreground }}
            >
              {releaseNotes}
            </Text>
          </View>

          {/* Changelog Section (if available) */}
          {changelog && changelog.length > 0 && (
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setShowChangelog(!showChangelog)}
                className="flex-row items-center justify-between px-4 py-2 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: colors.foreground }}
                >
                  {showChangelog ? "Hide" : "Show"} Changelog
                </Text>
                <MaterialIcons
                  name={showChangelog ? "expand-less" : "expand-more"}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {showChangelog && (
                <ScrollView
                  className="max-h-48 bg-background rounded-2xl p-4 gap-2"
                  nestedScrollEnabled
                >
                  {changelog.map((entry, index) => (
                    <View key={index} className="flex-row gap-3 mb-2">
                      <Text
                        className="font-bold text-lg"
                        style={{ color: colors.primary }}
                      >
                        •
                      </Text>
                      <Text
                        className="flex-1 text-sm leading-relaxed"
                        style={{ color: colors.foreground }}
                      >
                        {entry}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Buttons */}
          <View className="gap-3">
            {/* Download Button */}
            <TouchableOpacity
              onPress={handleDownload}
              className="rounded-full py-3 items-center"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: colors.background }}
              >
                Download Update
              </Text>
            </TouchableOpacity>

            {/* Later Button - Only show if not force update */}
            {!forceUpdate && (
              <TouchableOpacity
                onPress={onDismiss}
                className="rounded-full py-3 items-center border"
                style={{ borderColor: colors.border }}
                activeOpacity={0.8}
              >
                <Text
                  className="font-semibold text-base"
                  style={{ color: colors.foreground }}
                >
                  Later
                </Text>
              </TouchableOpacity>
            )}

            {/* Force Update Warning */}
            {forceUpdate && (
              <Text
                className="text-center text-xs mt-2"
                style={{ color: colors.muted }}
              >
                This update is required for security and stability. You must update to continue using the app.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
