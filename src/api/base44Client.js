import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

// Create a client with authentication required
// export const base44 = createClient({
//   appId,
//   serverUrl,
//   token,
//   functionsVersion,
//   requiresAuth: false
// });

// Use Mock Client for local CSV data
// Use Dexie Client for local database
import { dexieClient } from './dexieClient';
export const base44 = dexieClient;
