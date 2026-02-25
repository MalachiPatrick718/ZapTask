import { Notification, BrowserWindow } from 'electron';
import { IPC } from '../../shared/types/ipc-channels';
import { getTaskRepository } from '../database';

const ENERGY_CHECKIN_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const DUE_SOON_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DUE_SOON_WINDOW_MINUTES = 30;

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
}

class NotificationScheduler {
  private energyTimer: ReturnType<typeof setInterval> | null = null;
  private dueSoonTimer: ReturnType<typeof setInterval> | null = null;
  private notifiedTaskIds = new Set<string>();

  start(): void {
    // Energy check-in reminders every 2 hours
    this.energyTimer = setInterval(() => {
      this.showEnergyCheckin();
    }, ENERGY_CHECKIN_INTERVAL);

    // Due-soon checks every 5 minutes
    this.dueSoonTimer = setInterval(() => {
      this.checkDueSoon();
    }, DUE_SOON_CHECK_INTERVAL);

    console.log('[NotificationScheduler] Started');
  }

  stop(): void {
    if (this.energyTimer) {
      clearInterval(this.energyTimer);
      this.energyTimer = null;
    }
    if (this.dueSoonTimer) {
      clearInterval(this.dueSoonTimer);
      this.dueSoonTimer = null;
    }
    console.log('[NotificationScheduler] Stopped');
  }

  private showEnergyCheckin(): void {
    try {
      const notification = new Notification({
        title: 'Energy Check-in',
        body: "How's your energy? Tap to update.",
      });
      notification.on('click', () => {
        const win = getMainWindow();
        if (win) {
          win.show();
          win.focus();
          win.webContents.send(IPC.NAVIGATE_TO_TASK, '__energy_checkin__');
        }
      });
      notification.show();
    } catch (err) {
      console.error('[NotificationScheduler] Energy check-in error:', err);
    }
  }

  private checkDueSoon(): void {
    try {
      const tasks = getTaskRepository().getAll();
      const now = new Date();

      for (const task of tasks) {
        if (task.status === 'done') continue;
        if (!task.dueDate) continue;
        if (this.notifiedTaskIds.has(task.id)) continue;

        const dueDate = new Date(task.dueDate + 'T23:59:59');
        const minutesUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilDue > 0 && minutesUntilDue <= DUE_SOON_WINDOW_MINUTES) {
          this.notifiedTaskIds.add(task.id);

          const notification = new Notification({
            title: 'Task Due Soon',
            body: `${task.title} is due in ${Math.round(minutesUntilDue)} minutes`,
          });
          notification.on('click', () => {
            const win = getMainWindow();
            if (win) {
              win.show();
              win.focus();
              win.webContents.send(IPC.NAVIGATE_TO_TASK, task.id);
            }
          });
          notification.show();
        }
      }
    } catch (err) {
      console.error('[NotificationScheduler] Due-soon check error:', err);
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
