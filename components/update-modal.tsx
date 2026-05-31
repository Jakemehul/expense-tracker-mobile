import React from "react";
import { Modal, View, Text, TouchableOpacity, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export interface UpdateModalProps {
  visible: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  onDismiss: () => void;
}

/**
 * Modal component that displays when a new app version is available
 */
export function UpdateModal({
  visible,
  latestVersion,
  releaseNotes,
  downloadUrl,
  onDismiss,
}: UpdateModalProps) {
  const colors = useColors();

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
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <View
        className="flex-1 justify-center items-center bg-black/50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        {/* Modal Content */}
        <View
          className="mx-6 rounded-3xl p-6 gap-4"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Icon */}
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialIcons name="system-update" size={32} color={colors.background} />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-2xl font-bold text-center"
            style={{ color: colors.foreground }}
          >
            Update Available
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

            {/* Later Button */}
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
          </View>
        </View>
      </View>
    </Modal>
  );
}
