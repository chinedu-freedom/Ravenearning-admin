import { useEffect, useState } from "react";

export function useImageSrc(image, fallback = "/placeholder-image.jpg") {
  const [src, setSrc] = useState(fallback);

  useEffect(() => {
    if (!image) {
      setSrc(fallback);
      return;
    }

    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (typeof image === "string") {
      setSrc(image);
      return;
    }

    setSrc(fallback);
  }, [image, fallback]);

  return src;
}
