import { createClient } from '@supabase/supabase-js';

// Use a getter to ensure we always have the latest env vars and provide better error reporting
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
  
  if (!url || !key) {
    console.error(`[Realtime] Supabase configuration missing! URL: ${!!url}, Key: ${!!key}`);
    return null;
  }
  
  return createClient(url, key);
};

/**
 * Helper to push a notification or realtime event to a specific channel
 */
export const pushNotification = async (channelName: string, eventName: string, payload: any) => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const channel = supabase.channel(channelName);
  
  console.log(`[Realtime] Attempting broadcast to ${channelName}...`);
  
  return new Promise((resolve) => {
    // Set a timeout for the subscription
    const timeout = setTimeout(() => {
      console.error(`[Realtime] Subscription timeout for ${channelName}`);
      supabase.removeChannel(channel);
      resolve(false);
    }, 5000);

    channel.subscribe(async (status) => {
      console.log(`[Realtime] Channel status for ${channelName}: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        clearTimeout(timeout);
        const result = await channel.send({
          type: 'broadcast',
          event: eventName,
          payload,
        });
        
        console.log(`[Realtime] Broadcast result for ${eventName}: ${result}`);
        
        // Give a small delay before removing channel to ensure send completes
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 100);
        
        resolve(result === 'ok');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        clearTimeout(timeout);
        console.error(`[Realtime] Channel failed with status: ${status}`);
        resolve(false);
      }
    });
  });
};
