import imageCompression from "browser-image-compression";

export interface MediaPreview {
  id: string;
  file: File;
  compressedFile?: File;
  previewUrl: string;
  type: "image" | "video";
}

export const compressImageFile = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
      type: "image/webp",
    });
  } catch (error) {
    console.warn("Client image compression fallback:", error);
    return file;
  }
};

export const createMediaPreview = (file: File): MediaPreview => {
  const isVideo = file.type.startsWith("video/");
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    type: isVideo ? "video" : "image",
  };
};

export const revokeMediaPreview = (preview: MediaPreview): void => {
  if (preview.previewUrl) {
    URL.revokeObjectURL(preview.previewUrl);
  }
};
