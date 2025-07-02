import { ServerOptions } from './types/ServerOptions';

export default {
  secretKey: process.env.SECRET_KEY || 'WaSchedule-Super-Secret-Key-2024',
  host: process.env.HOST || 'http://localhost',
  port: process.env.PORT || '21465',
  deviceName: process.env.DEVICE_NAME || 'WaSchedule-Server',
  poweredBy: 'WaSchedule-WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: 'file',
  maxListeners: 15,
  customUserDataDir: './userDataDir/',
  webhook: {
    url: process.env.WEBHOOK_URL || null,
    autoDownload: true,
    uploadS3: false,
    readMessage: true,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
    onLabelUpdated: true,
    onSelfMessage: false,
    ignore: ['status@broadcast'],
  },
  websocket: {
    autoDownload: false,
    uploadS3: false,
  },
  chatwoot: {
    sendQrCode: true,
    sendStatus: true,
  },
  archive: {
    enable: false,
    waitTime: 10,
    daysToArchive: 45,
  },
  log: {
    level: 'silly', // Before open a issue, change level to silly and retry a action
    logger: ['console', 'file'],
  },
  createOptions: {
    browserArgs: [
      // Core security and sandbox
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // Recommended for cloud environments
      '--disable-gpu',
      
      // Memory optimization
      '--memory-pressure-off',
      '--max_old_space_size=4096',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      
      // Cache and storage
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--aggressive-cache-discard',
      
      // Network and security
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--disable-features=VizDisplayCompositor',
      '--disable-features=LeakyPeeker',
      '--disable-ipc-flooding-protection',
      
      // Extensions and plugins
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-plugins',
      '--disable-sync',
      '--disable-translate',
      
      // UI optimizations
      '--hide-scrollbars',
      '--mute-audio',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-notifications',
      
      // Cloud environment specific
      '--headless=new',
      '--remote-debugging-port=9222',
      '--remote-debugging-address=0.0.0.0',
      '--disable-software-rasterizer',
      '--disable-background-networking',
      
      // Certificate handling
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
      '--ignore-certificate-errors-spki-list-tls-protocols',
      '--allow-running-insecure-content',
      
      // Performance
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      '--disable-component-update',
      '--disable-domain-reliability',
    ],
    
    // Timeout settings for cloud environments
    timeout: 60000, // 60 seconds
    
    // Additional Puppeteer options for stability
    defaultViewport: null,
    args: [
      '--window-size=1366,768',
      '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ],
    
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,
  },
  mapper: {
    enable: false,
    prefix: 'tagone-',
  },
  db: {
    mongodbDatabase: 'tokens',
    mongodbCollection: '',
    mongodbUser: '',
    mongodbPassword: '',
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '',
    mongodbPort: 27017,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    redisPrefix: 'docker',
  },
  aws_s3: {
    region: 'sa-east-1' as any,
    access_key_id: null,
    secret_key: null,
    defaultBucketName: null,
    endpoint: null,
    forcePathStyle: null,
  },
} as unknown as ServerOptions;
