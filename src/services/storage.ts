import { supabase } from '@/lib/supabase';
import { calculateSHA256 } from '@/lib/utils';

export interface UploadResult {
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sourceHash: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function uploadSourceFile(
  userId: string,
  transformationId: string,
  file: File
): Promise<UploadResult> {
  if (file.size === 0) {
    throw new Error('File is empty (0 bytes)');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 50MB limit');
  }

  // Calculate SHA-256 for provenance and integrity
  const sourceHash = await calculateSHA256(file);

  // Clean filename to avoid path issues
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${transformationId}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from('source-files')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }

  return {
    storagePath: data.path,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    sourceHash,
  };
}

export async function getSignedSourceUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('source-files')
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate secure URL: ${error?.message || 'Unknown error'}`);
  }

  return data.signedUrl;
}
