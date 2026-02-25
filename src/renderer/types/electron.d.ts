import type { ZaptaskAPI } from '../../preload/preload';

declare global {
  interface Window {
    zaptask: ZaptaskAPI;
  }
}

export {};
