import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadAvatar = async (fileBuffer: Buffer, filename: string): Promise<string> => {
  console.log(`Supabase Upload Attempt: bucket=avatars, path=${filename}, bufferSize=${fileBuffer.length}`);
  
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (error) {
      console.warn('Supabase Storage Error (falling back to local):', error);
      throw error;
    }

    console.log('Supabase Upload Success:', data.path);

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);
    
    console.log('Generated Public URL:', publicData.publicUrl);
    return publicData.publicUrl;
  } catch (err) {
    console.log('Using Local Storage Fallback...');
    
    // Fallback to local storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const localPath = path.join(uploadsDir, filename);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    
    // Write file
    await fs.writeFile(localPath, fileBuffer);
    
    // Construct local URL
    const apiUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    const localUrl = `${apiUrl}/uploads/${filename}`;
    
    console.log('Local Upload Success:', localUrl);
    return localUrl;
  }
};
