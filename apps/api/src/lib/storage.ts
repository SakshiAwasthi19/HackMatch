import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadAvatar = async (fileBuffer: Buffer, filename: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filename, fileBuffer, {
      contentType: 'image/jpeg', // Defaulting to jpeg for now, can be improved
      upsert: true,
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }

  // Generate public URL
  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename);

  return publicData.publicUrl;
};
