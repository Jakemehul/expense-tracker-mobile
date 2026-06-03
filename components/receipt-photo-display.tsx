import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ReceiptPhotoDisplayProps {
  photoUri?: string;
  onRemove?: () => void;
  onReplace?: () => void;
  editable?: boolean;
}

/**
 * Component to display receipt photo with options to view, replace, or remove
 */
export function ReceiptPhotoDisplay({
  photoUri,
  onRemove,
  onReplace,
  editable = false,
}: ReceiptPhotoDisplayProps) {
  const colors = useColors();
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!photoUri) {
    return null;
  }

  return (
    <>
      <View className="mb-4">
        <View className="mb-2">
          <Text className="text-sm font-semibold text-muted uppercase">Receipt Photo</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowFullImage(true)}
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: colors.border }}
          activeOpacity={0.8}
        >
          <View className="bg-surface aspect-square items-center justify-center">
            {imageLoading && (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
            <Image
              source={{ uri: photoUri }}
              style={{ width: "100%", height: "100%" }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </View>
        </TouchableOpacity>

        {editable && (
          <View className="flex-row gap-2 mt-3">
            {onReplace && (
              <TouchableOpacity
                onPress={onReplace}
                className="flex-1 rounded-lg p-3 active:opacity-80"
                style={{ backgroundColor: colors.primary }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-center">📷 Replace Photo</Text>
              </TouchableOpacity>
            )}
            {onRemove && (
              <TouchableOpacity
                onPress={onRemove}
                className="flex-1 rounded-lg p-3 border active:opacity-80"
                style={{ borderColor: colors.error }}
                activeOpacity={0.8}
              >
                <Text className="font-semibold text-center" style={{ color: colors.error }}>
                  🗑️ Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Full Image Modal */}
      <Modal visible={showFullImage} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center">
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowFullImage(false)}
          />
          <View className="w-full h-full items-center justify-center p-4">
            <Image
              source={{ uri: photoUri }}
              style={{ width: "100%", height: "80%", resizeMode: "contain" }}
            />
          </View>
          <Pressable
            className="absolute top-8 right-4 w-12 h-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => setShowFullImage(false)}
          >
            <Text className="text-white text-2xl">✕</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
