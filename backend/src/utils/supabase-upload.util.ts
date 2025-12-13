import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadToSupabase(
  file: Buffer,
  fileName: string,
  bucket: string = 'Evidence',
  contentType?: string,
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, file, {
        contentType: contentType || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Generate signed URL with 10 years expiration for private buckets
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 315360000); // 10 years in seconds

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }

    return {
      url: signedUrlData.signedUrl,
      path: data.path,
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function deleteFromSupabase(
  filePath: string,
  bucket: string = 'Evidence',
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
