import { defineConfig } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const envKeys = [
  'JIRA_CLIENT_ID', 'JIRA_CLIENT_SECRET',
  'ASANA_CLIENT_ID', 'ASANA_CLIENT_SECRET',
  'NOTION_CLIENT_ID', 'NOTION_CLIENT_SECRET',
  'MONDAY_CLIENT_ID', 'MONDAY_CLIENT_SECRET',
  'GCAL_CLIENT_ID', 'GCAL_CLIENT_SECRET',
  'OUTLOOK_CLIENT_ID', 'OUTLOOK_CLIENT_SECRET',
  'PADDLE_CLIENT_TOKEN', 'PADDLE_PRICE_ID_MONTHLY', 'PADDLE_PRICE_ID_YEARLY',
  'FEEDBACK_EMAIL',
];

const define: Record<string, string> = {};
for (const key of envKeys) {
  define[`process.env.${key}`] = JSON.stringify(process.env[key] || '');
}

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  define,
  build: {
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
});
