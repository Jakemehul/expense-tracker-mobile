import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import type * as ImagePickerType from "expo-image-picker";

let ImagePicker: typeof ImagePickerType | null = null;

const getImagePicker = async () => {
  if (!ImagePicker) {
    ImagePicker = await import("expo-image-picker");
  }
  return ImagePicker;
};

/**
 * Photo picker service for handling receipt photo selection and storage
 */
export const PhotoPickerService = {
  /**
   * Request camera roll permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== "web") {
        const IP = await getImagePicker();
        const { status } = await IP.requestMediaLibraryPermissionsAsync();
        return status === "granted";
      }
      return true;
    } catch (error) {
      console.error("Error requesting photo permissions:", error);
      return false;
    }
  },

  /**
   * Pick a photo from device library
   */
  async pickPhoto(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("Photo library permission denied");
        return null;
      }

      const IP = await getImagePicker();
      const result = await IP.launchImageLibraryAsync({
        mediaTypes: IP.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error picking photo:", error);
      return null;
    }
  },

  /**
   * Take a photo with camera
   */
  async takePhoto(): Promise<string | null> {
    try {
      const IP = await getImagePicker();
      const { status } = await IP.requestCameraPermissionsAsync();
      if (status !== "granted") {
        console.warn("Camera permission denied");
        return null;
      }

      const result = await IP.launchCameraAsync({
        mediaTypes: IP.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  },

  /**
   * Copy photo to app documents directory for persistent storage
   */
  async copyPhotoToAppStorage(photoUri: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        // On web, we can't copy files, so return the URI as-is
        return photoUri;
      }

      const fileName = `receipt_${Date.now()}.jpg`;
      const appStoragePath = `${FileSystem.documentDirectory}photos/`;

      // Create photos directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(appStoragePath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appStoragePath, { intermediates: true });
      }

      const newPath = `${appStoragePath}${fileName}`;

      // Copy file to app storage
      await FileSystem.copyAsync({
        from: photoUri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error("Error copying photo to app storage:", error);
      return photoUri; // Return original URI if copy fails
    }
  },

  /**
   * Delete photo from app storage
   */
  async deletePhoto(photoUri: string): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        return true; // Can't delete on web
      }

      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(photoUri);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting photo:", error);
      return false;
    }
  },

  /**
   * Get file size of photo
   */
  async getPhotoSize(photoUri: string): Promise<number> {
    try {
      if (Platform.OS === "web") {
        return 0;
      }

      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      return (fileInfo as any).size || 0;
    } catch (error) {
      console.error("Error getting photo size:", error);
      return 0;
    }
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Check if photo URI is valid and accessible
   */
  async isPhotoAccessible(photoUri: string): Promise<boolean> {
    try {
      if (Platform.OS === "web") {
        return true;
      }

      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      return fileInfo.exists;
    } catch (error) {
      console.error("Error checking photo accessibility:", error);
      return false;
    }
  },
};
