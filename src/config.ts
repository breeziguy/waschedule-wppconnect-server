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
      // Essential security flags
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      
      // MEMORY OPTIMIZED: Core browser flags for minimal memory usage
      '--memory-pressure-off',
      '--max_old_space_size=256', // Reduced from 4096 to 256MB max heap
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-background-networking',
      '--no-default-browser-check',
      '--no-first-run',
      
      // Process optimization for cloud environments
      '--single-process',
      '--no-zygote',
      
      // Memory and performance (optimized)
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      '--disable-software-rasterizer',
      
      // Cache and storage (reduce file conflicts)
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--aggressive-cache-discard',
      
      // Disable problematic features
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-component-update',
      '--disable-domain-reliability',
      
      // Network and security
      '--disable-web-security',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
      '--allow-running-insecure-content',
      
      // UI optimizations
      '--hide-scrollbars',
      '--mute-audio',
      '--disable-features=TranslateUI,VizDisplayCompositor,LeakyPeeker',
      
      // Cloud environment specific with memory limits
      '--headless=new',
      '--remote-debugging-port=9222',
      '--window-size=800,600', // Reduced window size to save memory
      
      // MEMORY CRITICAL: Process limits for Render's 512MB limit
      '--max-heap-size=200', // Max 200MB heap per process
      '--initial-heap-size=50', // Start with 50MB heap
      '--optimize-for-size', // Prioritize memory over speed
      
      // Performance monitoring (minimal)
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
    ],
    
    // MEMORY OPTIMIZED: Reduced timeout to prevent long-running processes
    timeout: 60000, // 60 seconds for faster cleanup
    
    // Puppeteer specific options
    defaultViewport: null,
    
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
