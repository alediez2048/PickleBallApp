import * as ImagePicker from "expo-image-picker";
import { uploadImageToStorage } from "@/services/image";

type UploadImageProps = {
  destinationPath: (filename: string) => string; // ej. (id) => `users/${id}.jpg`
};

export const uploadImage = async ({ destinationPath }: UploadImageProps) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const contentType = result.assets[0].mimeType || "image/jpeg";
      const filename = `image_${Date.now()}.jpg`;
      const path = destinationPath(filename);
      const imageBase64 = result.assets[0].base64;

      if (!imageBase64) {
        console.error("No base64 image data found.");
        return null;
      }

      const publicUrl = await uploadImageToStorage(
        imageBase64,
        contentType,
        path
      );
      return publicUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Image upload error:");
    console.error(error);
    return null;
  }
};
