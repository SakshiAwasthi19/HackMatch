import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to push a notification or realtime event to a specific channel
 * @param channelName The name of the channel to broadcast to
 * @param eventName The name of the event
 * @param payload The data payload to send
 */
export const pushNotification = async (channelName: string, eventName: string, payload: any) => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key not configured. Realtime event not sent.');
    return;
  }
  
  const channel = supabase.channel(channelName);
  
  return new Promise((resolve) => {
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const result = await channel.send({
          type: 'broadcast',
          event: eventName,
          payload,
        });
        
        if (result !== 'ok') {
          console.error(`Failed to send realtime event: ${result}`);
        } else {
          console.log(`Successfully broadcasted ${eventName} to ${channelName}`);
        }
        
        supabase.removeChannel(channel);
        resolve(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.error(`Supabase realtime connection error: ${status}`);
        resolve(false);
      }
    });
  });
};
