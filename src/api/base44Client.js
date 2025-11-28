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
import { mockBase44Client } from './mockBase44Client';
export const base44 = mockBase44Client;
