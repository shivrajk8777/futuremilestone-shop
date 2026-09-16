/**
 * Image Optimization Utilities
 * Automatically converts raw Cloudinary URLs to modern compressed formats (AVIF/WebP)
 * with auto-quality and responsive width sizing, reducing asset payloads by up to 90%.
 */

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Handle local image replacements for pre-compressed WebP versions
  if (url === '/images/home-about.jpg') return '/images/home-about.webp';
  if (url === '/images/about.png') return '/images/about.webp';
  if (url === '/images/contact.png') return '/images/contact.webp';
  if (url === '/images/Rekha.jpg') return '/images/Rekha.webp';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  try {
    const [baseUrl, pathAfterUpload] = url.split('/image/upload/');
    if (!pathAfterUpload) return url;

    // Check if transformations already exist right after /upload/
    const parts = pathAfterUpload.split('/');
    const firstPart = parts[0];

    // Build transformation list
    const transforms: string[] = [];

    const format = options.format || 'f_auto';
    const quality = options.quality !== undefined ? `q_${options.quality}` : 'q_auto';
    transforms.push(format);
    transforms.push(quality);

    if (options.width) {
      transforms.push(`w_${options.width}`);
      transforms.push(options.crop ? `c_${options.crop}` : 'c_limit');
    }

    if (options.height) {
      transforms.push(`h_${options.height}`);
    }

    const transformStr = transforms.join(',');

    // If firstPart looks like an existing transformation
    if (firstPart && (firstPart.includes(',') || /^[a-z]_[a-z0-9]+/i.test(firstPart))) {
      const rest = parts.slice(1).join('/');
      return `${baseUrl}/image/upload/${transformStr}/${rest}`;
    }

    // Normal case: no existing transform
    return `${baseUrl}/image/upload/${transformStr}/${pathAfterUpload}`;
  } catch (err) {
    console.error('Error optimizing Cloudinary URL:', err);
    return url;
  }
}
