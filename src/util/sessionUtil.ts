/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Whatsapp } from '@wppconnect-team/wppconnect';
import { EventEmitter } from 'events';

export const chromiumArgs = [
  '--disable-web-security', // Disables web security
  '--no-sandbox', // Disables sandbox
  '--aggressive-cache-discard', // Aggressively discards cache
  '--disable-cache', // Disables cache
  '--disable-application-cache', // Disables application cache
  '--disable-offline-load-stale-cache', // Disables loading stale offline cache
  '--disk-cache-size=0', // Sets disk cache size to 0
  '--disable-background-networking', // Disables background networking activities
  '--disable-default-apps', // Disables default apps
  '--disable-extensions', // Disables extensions
  '--disable-sync', // Disables synchronization
  '--disable-translate', // Disables translation
  '--hide-scrollbars', // Hides scrollbars
  '--metrics-recording-only', // Records metrics only
  '--mute-audio', // Mutes audio
  '--no-first-run', // Skips first run
  '--safebrowsing-disable-auto-update', // Disables Safe Browsing auto-update
  '--ignore-certificate-errors', // Ignores certificate errors
  '--ignore-ssl-errors', // Ignores SSL errors
  '--ignore-certificate-errors-spki-list', // Ignores certificate errors in SPKI list
];
// eslint-disable-next-line prefer-const
export let clientsArray: Whatsapp[] = [];
export const sessions = [];
export const eventEmitter = new EventEmitter();

// Memory optimization: Session timeout tracking
export const sessionTimeouts = new Map<string, NodeJS.Timeout>();
export const sessionStartTimes = new Map<string, number>();

// 3 minutes timeout for INITIALIZING/QRCODE sessions
const IDLE_SESSION_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export function deleteSessionOnArray(session: string): void {
  const newArray = clientsArray;
  delete clientsArray[session];
  clientsArray = newArray;
  
  // Clear timeout tracking
  clearSessionTimeout(session);
}

export function clearSessionTimeout(session: string): void {
  const timeout = sessionTimeouts.get(session);
  if (timeout) {
    clearTimeout(timeout);
    sessionTimeouts.delete(session);
  }
  sessionStartTimes.delete(session);
}

export function setSessionTimeout(session: string, logger?: any): void {
  // Clear any existing timeout first
  clearSessionTimeout(session);
  
  // Set session start time
  sessionStartTimes.set(session, Date.now());
  
  // Set new timeout
  const timeout = setTimeout(() => {
    const client = clientsArray[session];
    if (client && (client.status === 'INITIALIZING' || client.status === 'QRCODE')) {
      if (logger) {
        logger.warn(`[MEMORY CLEANUP] Session ${session} idle timeout (${IDLE_SESSION_TIMEOUT/1000}s). Terminating Chrome...`);
      }
      
      // Force close browser and cleanup
      forceCloseSession(session, logger);
    }
  }, IDLE_SESSION_TIMEOUT);
  
  sessionTimeouts.set(session, timeout);
}

export async function forceCloseSession(session: string, logger?: any): Promise<void> {
  const client = clientsArray[session];
  
  try {
    if (client) {
      if (logger) {
        logger.info(`[MEMORY CLEANUP] Force closing session: ${session} (Status: ${client.status})`);
      }
      
      // Close browser instance
      if (client.page && client.page.browser) {
        try {
          await client.page.browser().close();
        } catch (error) {
          if (logger) {
            logger.warn(`[MEMORY CLEANUP] Browser close error for ${session}:`, error);
          }
        }
      }
      
      // Close client connection
      if (client.close && typeof client.close === 'function') {
        try {
          await client.close();
        } catch (error) {
          if (logger) {
            logger.warn(`[MEMORY CLEANUP] Client close error for ${session}:`, error);
          }
        }
      }
      
      // Update status and clear data
      client.status = 'CLOSED';
      client.qrcode = null;
      
      // Remove from array
      delete clientsArray[session];
      
      if (logger) {
        logger.info(`[MEMORY CLEANUP] Session ${session} successfully cleaned up`);
      }
    }
  } catch (error) {
    if (logger) {
      logger.error(`[MEMORY CLEANUP] Error cleaning session ${session}:`, error);
    }
  } finally {
    // Always clear timeout tracking
    clearSessionTimeout(session);
  }
}

export function getSessionUptime(session: string): number {
  const startTime = sessionStartTimes.get(session);
  return startTime ? Date.now() - startTime : 0;
}

export function getActiveSessionsCount(): number {
  return Object.keys(clientsArray).filter(session => {
    const client = clientsArray[session];
    return client && client.status !== 'CLOSED';
  }).length;
}

export function getMemoryStats(): any {
  const activeSessions = getActiveSessionsCount();
  const timeouts = sessionTimeouts.size;
  const memUsage = process.memoryUsage();
  
  return {
    activeSessions,
    pendingTimeouts: timeouts,
    memoryUsage: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    }
  };
}
