import React from "react";
import { TouchableOpacity, Text, View, ActionSheetIOS, Platform, Alert } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { PhotoPickerService } from "@/lib/photo-picker-service";

interface PhotoPickerButtonProps {
  onPhotoSelected: (photoUri: string) => void;
  label?: string;
  icon?: string;
}

/**
 * Button to pick a photo from camera or library
 */
export function PhotoPickerButton({
  onPhotoSelected,
  label = "Add Receipt Photo",
  icon = "📸",
}: PhotoPickerButtonProps) {
  const colors = useColors();

  const handlePickPhoto = async () => {
    const photoUri = await PhotoPickerService.pickPhoto();
    if (photoUri) {
      // Copy to app storage for persistence
      const storedUri = await PhotoPickerService.copyPhotoToAppStorage(photoUri);
      if (storedUri) {
        onPhotoSelected(storedUri);
      }
    }
  };

  const handleTakePhoto = async () => {
    const photoUri = await PhotoPickerService.takePhoto();
    if (photoUri) {
      // Copy to app storage for persistence
      const storedUri = await PhotoPickerService.copyPhotoToAppStorage(photoUri);
      if (storedUri) {
        onPhotoSelected(storedUri);
      }
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
          userInterfaceStyle: "dark",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickPhoto();
          }
        }
      );
    } else {
      Alert.alert("Add Receipt Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Library", onPress: handlePickPhoto },
      ]);
    }
  };

  return (
    <TouchableOpacity
      onPress={showPhotoOptions}
      className="rounded-lg p-4 border-2 border-dashed items-center justify-center py-6 active:opacity-80"
      style={{ borderColor: colors.primary }}
      activeOpacity={0.8}
    >
      <Text className="text-3xl mb-2">{icon}</Text>
      <Text className="font-semibold" style={{ color: colors.primary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
