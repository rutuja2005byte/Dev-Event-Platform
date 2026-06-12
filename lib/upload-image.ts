import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary(): boolean {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) return false;

  const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return false;

  cloudinary.config({
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
    secure: true,
  });

  return true;
}

async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  if (!configureCloudinary()) {
    throw new Error('CLOUDINARY_URL is missing or invalid in .env.local');
  }

  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
        if (error) return reject(error);
        if (!results?.secure_url) {
          return reject(new Error('Cloudinary upload failed: no secure_url returned'));
        }
        resolve(results);
      })
      .end(buffer);
  });

  return uploadResult.secure_url;
}

async function saveImageLocally(file: File, buffer: Buffer): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const extension = path.extname(file.name) || '.png';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function resolveEventImage(imageField: FormDataEntryValue | null): Promise<string> {
  if (typeof imageField === 'string' && imageField.trim()) {
    return imageField.trim();
  }

  if (!(imageField instanceof File) || imageField.size === 0) {
    throw new Error('Image file or image URL is required');
  }

  const buffer = Buffer.from(await imageField.arrayBuffer());

  try {
    return await uploadToCloudinary(buffer);
  } catch (cloudinaryError) {
    if (process.env.NODE_ENV !== 'development') {
      throw cloudinaryError;
    }

    console.warn(
      '[upload-image] Cloudinary upload failed, saving locally for development:',
      cloudinaryError
    );
    return saveImageLocally(imageField, buffer);
  }
}
