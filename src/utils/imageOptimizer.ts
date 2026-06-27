export const optimizeCloudinaryUrl = (url: string | undefined): string => {
  if (!url) return "";
  
  // Only process standard res.cloudinary.com URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  // If already optimized, ignore
  if (url.includes("/q_auto,f_auto")) {
    return url;
  }

  // Insert standard optimizations before the version or folder
  return url.replace("/image/upload/", "/image/upload/q_auto,f_auto/");
};
