import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
export const uploadAvatar = async (fileBuffer, filename) => {
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
    }
    catch (err) {
        console.warn('Supabase Storage Error, falling back to persistent Base64 Data URL:', err);
        // We still write locally if in local dev for safety / backup
        try {
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const localPath = path.join(uploadsDir, filename);
            await fs.mkdir(path.dirname(localPath), { recursive: true });
            await fs.writeFile(localPath, fileBuffer);
            console.log('Local backup write successful');
        }
        catch (localWriteErr) {
            console.warn('Local backup write failed (expected on serverless environments like Vercel):', localWriteErr);
        }
        // Fallback to Base64 Data URL (fully persistent in the PostgreSQL database)
        const ext = filename.split('.').pop() || 'jpeg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const base64Url = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        console.log('Generated persistent Base64 fallback (length):', base64Url.length);
        return base64Url;
    }
};
