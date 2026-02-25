import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'node:path';
import { toggleVisibility, getMainWindow } from './window-manager';

let tray: Tray | null = null;

export function setupTray(): void {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icons', 'icon.png')
    : path.join(process.cwd(), 'assets/icons/icon.png');

  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.warn('[Tray] Icon not found at:', iconPath);
    icon = nativeImage.createEmpty();
  } else {
    icon = icon.resize({ width: 22, height: 22 });
  }

  tray = new Tray(icon);
  tray.setToolTip('ZapTask');

  const buildContextMenu = () => {
    const win = getMainWindow();
    const isOnTop = win?.isAlwaysOnTop() ?? true;

    return Menu.buildFromTemplate([
      { label: 'Show/Hide', click: () => toggleVisibility() },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: isOnTop,
        click: (menuItem) => {
          win?.setAlwaysOnTop(menuItem.checked);
        },
      },
      { type: 'separator' },
      { label: 'Quit ZapTask', click: () => app.quit() },
    ]);
  };

  tray.setContextMenu(buildContextMenu());

  // Left-click toggles visibility
  tray.on('click', () => toggleVisibility());

  // Rebuild context menu before showing to get fresh always-on-top state
  tray.on('right-click', () => {
    tray?.setContextMenu(buildContextMenu());
  });
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
