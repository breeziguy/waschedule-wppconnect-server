/*
 * Copyright 2023 WPPConnect Team
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

import { Request, Response } from 'express';
import fs from 'fs';

import { logger } from '..';
import config from '../config';
import { backupSessions, restoreSessions } from '../util/manageSession';
import { clientsArray, deleteSessionOnArray } from '../util/sessionUtil';

export async function backupAllSessions(req: Request, res: Response) {
  /**
     * #swagger.tags = ["Misc"]
     * #swagger.description = 'Please, open the router in your browser, in swagger this not run'
     * #swagger.produces = ['application/octet-stream']
     * #swagger.consumes = ['application/octet-stream']
       #swagger.autoBody=false
       #swagger.parameters["secretkey"] = {
          required: true,
          schema: 'THISISMYSECURETOKEN'
       }
       #swagger.responses[200] = {
        description: 'A ZIP file contaings your backup. Please, open this link in your browser',
        content: {
          "application/zip": {
            schema: {}
          }
        },
      }
     */
  const { secretkey } = req.params;

  if (secretkey !== config.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect',
    });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.send(await backupSessions(req));
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on backup session',
      error: error,
    });
  }
}

export async function restoreAllSessions(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: "string",
                format: "binary"
              }
            },
            required: ['file'],
          }
        }
      }
    }
  */
  const { secretkey } = req.params;

  if (secretkey !== config.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect',
    });
  }

  try {
    const result = await restoreSessions(req, req.file as any);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on restore session',
      error: error,
    });
  }
}

export async function takeScreenshot(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.security = [{
          "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
  */

  try {
    const result = await req.client.takeScreenshot();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on take screenshot',
      error: error,
    });
  }
}

export async function clearSessionData(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
  */

  try {
    const { secretkey, session } = req.params;

    if (secretkey !== config.secretKey) {
      res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }
    if (req?.client?.page) {
      delete clientsArray[req.params.session];
      await req.client.logout();
    }
    const path = config.customUserDataDir + session;
    const pathToken = __dirname + `../../../tokens/${session}.data.json`;
    if (fs.existsSync(path)) {
      await fs.promises.rm(path, {
        recursive: true,
      });
    }
    if (fs.existsSync(pathToken)) {
      await fs.promises.rm(pathToken);
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error on clear session data',
      error: error,
    });
  }
}

export async function getMemoryStats(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
   #swagger.description = 'Get memory usage and session statistics for server monitoring'
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
  */

  try {
    const { secretkey } = req.params;

    if (secretkey !== config.secretKey) {
      return res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }

    const { getMemoryStats: getStats, getActiveSessionsCount, sessionTimeouts, sessionStartTimes } = require('../util/sessionUtil');
    const memStats = getStats();
    
    // Get detailed session info
    const sessionDetails = Object.keys(clientsArray).map(session => {
      const client = clientsArray[session] as any;
      const uptime = sessionStartTimes.get(session) ? Date.now() - sessionStartTimes.get(session) : 0;
      
      return {
        session,
        status: client?.status || 'UNKNOWN',
        uptime: Math.round(uptime / 1000) + 's',
        hasTimeout: sessionTimeouts.has(session),
        hasBrowser: !!(client?.page?.browser),
      };
    });

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      memory: memStats,
      sessions: sessionDetails,
      limits: {
        maxIdleTimeout: '3 minutes',
        renderMemLimit: '512MB'
      }
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error getting memory stats',
      error: error,
    });
  }
}

export async function forceCleanupSessions(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
   #swagger.description = 'Force cleanup of idle or stuck sessions to free memory'
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
  */

  try {
    const { secretkey } = req.params;

    if (secretkey !== config.secretKey) {
      return res.status(400).json({
        response: 'error',
        message: 'The token is incorrect',
      });
    }

    const { forceCloseSession } = require('../util/sessionUtil');
    const cleanedSessions: string[] = [];

    // Find sessions that are stuck in INITIALIZING or QRCODE for more than 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    for (const [session, clientObj] of Object.entries(clientsArray)) {
      const client = clientObj as any;
      if (client && (client.status === 'INITIALIZING' || client.status === 'QRCODE')) {
        const { sessionStartTimes } = require('../util/sessionUtil');
        const startTime = sessionStartTimes.get(session);
        
        if (!startTime || startTime < fiveMinutesAgo) {
          logger.warn(`[FORCE CLEANUP] Cleaning stuck session: ${session} (${client.status})`);
          await forceCloseSession(session, logger);
          cleanedSessions.push(session);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Forced cleanup completed`,
      cleanedSessions,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error during force cleanup',
      error: error,
    });
  }
}

export async function setLimit(req: Request, res: Response) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.description = 'Change limits of whatsapp web. Types value: maxMediaSize, maxFileSize, maxShare, statusVideoMaxDuration, unlimitedPin;'
   #swagger.autoBody=false
    #swagger.security = [{
          "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
     #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              value: { type: 'any' },
            },
            required: ['type', 'value'],
          },
          examples: {
            'Default': {
              value: {
                type: 'maxFileSize',
                value: 104857600
              },
            },
          },
        },
      },
    }
  */

  try {
    const { type, value } = req.body;
    if (!type || !value) throw new Error('Send de type and value');

    const result = await req.client.setLimit(type, value);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error on set limit',
      error: error,
    });
  }
}
