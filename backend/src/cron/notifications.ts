import cron from 'node-cron';
import { generateTimeBasedNotifications } from '../services/notificationService';

/**
 * Configura il cron job per la generazione delle notifiche basate sul tempo
 * Esegue ogni giorno a mezzanotte
 */
export function setupNotificationCron(): void {
  // Esegui ogni giorno alle 00:00
  cron.schedule('0 0 * * *', async () => {
    //console.log('🔔 Executing scheduled notification generation job...');
    try {
      const result = await generateTimeBasedNotifications();
      if (result) {
        //console.log('✅ Time-based notifications generated successfully');
      } else {
        console.error('❌ Failed to generate time-based notifications');
      }
    } catch (error) {
      console.error('❌ Error in notification cron job:', error);
    }
  });
  
  //console.log('🔔 Notification cron job scheduled successfully');
} 