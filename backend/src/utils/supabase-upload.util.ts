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
  bucket: string = 'evidence',
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

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

export async function deleteFromSupabase(
  filePath: string,
  bucket: string = 'evidence',
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
