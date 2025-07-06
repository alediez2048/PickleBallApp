import { supabase } from "@/libs/supabase";
import { decode } from "base64-arraybuffer";

export const uploadImageToStorage = async (
  imageBase64: string,
  contentType = "image/jpeg",
  path: string
): Promise<string | null> => {
  const bucket = "images";
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, decode(imageBase64), {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("uploadImageToStorage:", error);
      throw error;
    }

    return path;
  } catch (err) {
    console.error("Upload failed:");
    console.error(err);
    return null;
  }
};

export const getSignedUrl = async (path: string) => {
  const bucket = "images";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24); // 1 day expiration

  if (error) {
    console.error("Error getting signed URL:");
    console.error(error);
    return null;
  }

  return data?.signedUrl || null;
};
