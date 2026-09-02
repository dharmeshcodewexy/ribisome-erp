const envs = Object.freeze({
  port: process.env.PORT,
  use_cluster_module: process.env.USE_CLUSTER_MODULE,

  // DB Credentials
  db: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DEV_DB_DIALECT || "mysql",
    logging: false,
    // logging: (msg) => console.log(msg, "\n\n\n"),
    pool: {
      max: parseInt(process.env.DB_CONNECTION_POOL_LIMIT, 10) || 5, // Use DB_CONNECTION_POOL_LIMIT
      min: 0,
      acquire: 30000, //1200000,
      idle: 10000, //1000000,
      evict: 5000,
      validate: (connection) => {
        return new Promise((resolve, reject) => {
          connection.query("SELECT 1", (err) => {
            if (err) reject(err);
            else resolve(true);
          });
        });
      },
    },
    retry: {
      // NEW: Auto-retry timeouts
      match: [/SequelizeConnectionAcquireTimeoutError/, /TimeoutError/],
      max: 3,
    },
    seederStorage: "sequelize",
  },

  // DB Tables
  tables: {
    admin: "admin",
    society: "society",
    society_detail: "society_detail",
    users: "users",
    society_division: "society_division",
    leads: "leads",
    otp_verifications: "otp_verifications",
    units: "units",
    charges: "charges",
    bill_setting: "bill_setting",
    interest_penalty: "interest_penalty",
    main_groups: "main_groups",
    primary_groups: "primary_groups",
    sub_groups: "sub_groups",
    ledgers: "ledgers",
    society_ledgers: "society_ledgers",
    user_details: "user_details",
    allocate_charges: "allocate_charges",
    fiscal_year: "fiscal_year",
    opening_balance: "opening_balance",
    invoices: "invoices",
    vouchers: "vouchers",
    invoice_book: "invoice_book",
    interest_book: "interest_book",
    receipt: "receipt",
    journal: "journal",
    payments: "payments",
    debit_notes: "debit_notes",
    credit_notes: "credit_notes",
    receipt_map: "receipt_map",
    payment_map: "payment_map",
    payment_bill_allocation: "payment_bill_allocation",
    debit_note_map: "debit_note_map",
    credit_note_map: "credit_note_map",
    taxes: "taxes",
    gst_rate_master: "gst_rate_master",
    tds_rate_master: "tds_rate_master",
    bill_book: "bill_book",
    bill_book_map: "bill_book_map",
    ledger_details: "ledger_details",
    membership_master: "membership_master",
    membership: "membership",
    parking: "parking",
    login_session: "login_session",
    staff: "staff",
    staff_mapping: "staff_mapping",
    document: "document",
    event: "event",
    notice: "notice",
    complaint: "complain",
    tenant: "tenant",
    visitor: "visitor",
    vehicles: "vehicles",
    family: "family",
    service_category: "service_category",
    service: "service",
    expense: "expense",
    expense_map: "expense_map",
    notifications: "notifications",
    staff_attendance: "staff_attendance",
    help: "help",
    contacts: "contacts",
    subscriptions: "subscriptions",
    support: "support",
    role: "role",
    society_types: "society_types",
    country: "country",
    state: "state",
    city: "city",
    guest: "guest",
    short_urls: "short_urls",
    daily_quotes: "daily_quotes",
    slider: "slider",
    staff_alert: "staff_alert",
    staff_alert_log: "staff_alert_log",
    repair_staff: "repair_staff",
    complaint_category: "complaint_category",
    complaint_track: "complaint_track",
    visitor_users: "visitor_users",
    event_polls: "event_polls",
    event_poll_options: "event_poll_options",
    event_poll_vote: "event_poll_vote",
    amenities: "amenities",
    amenity_bookings: "amenity_bookings",
    committee: "committee",
    user_roles: "user_roles",
    wings: "wings",
    owner_profiles: "owner_profiles",
    closing_balance: "closing_balance",
    bank_reconciliations: "bank_reconciliations",
    society_setting: "society_setting",
    default_fiscal_year: "default_fiscal_year",
    member_payments: "member_payments",
    bank_list: "bank_list",
    sub_merchants: "sub_merchants",
    plans: "plans",
    wallets: "wallets",
    wallet_transactions: "wallet_transactions",
    invoice_number_trackers: "invoice_number_trackers",
    bulk_unit_uploads: "bulk_unit_uploads",
    bulk_unit_upload_rows: "bulk_unit_upload_rows",
    bulk_owner_uploads: "bulk_owner_uploads",
    bulk_owner_upload_rows: "bulk_owner_upload_rows",
    users: "users",
    login_sessions: "login_sessions",
    roles: "roles",
    permissions: "permissions",
    role_permissions: "role_permissions",
  },

  // AWS Cred
  aws: {
    s3: {
      region: process.env.AWS_REGION,
      bucket_name: process.env.AWS_S3_BUCKET_NAME,
      user: {
        access_key_id: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID,
        secret_access_key: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY,
      },
    },
    sqs: {
      region: process.env.AWS_SQS_REGION,
      user: {
        access_key_id: process.env.AWS_SQS_USER_ACCESS_KEY,
        secret_access_key: process.env.AWS_SQS_USER_SECRET_ACCESS_KEY,
      },
    },
    sns: {
      region: process.env.AWS_SNS_REGION,
      user: {
        access_key_id: process.env.AWS_SNS_USER_ACCESS_KEY,
        secret_access_key: process.env.AWS_SNS_USER_SECRET_ACCESS_KEY,
      },
    },
    cloudfront: {
      cdn_url: process.env.AWS_CLOUD_FRONT_CDN_URL,
    },
  },
  // JWT variables
  jwt: {
    crypt_salt_rounds: parseInt(process.env.CRYPT_SALT_ROUNDS) || 10,
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    access_token_expire_in: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN || "1d",
    refresh_token_expire_in: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN || "1d",
    keep_signin_expire_in: process.env.JWT_KEEP_SIGNIN_EXPIRE_IN || "30d",
    tmp_token_expire_in: process.env.JWT_TMP_TOKEN_EXPIRE_IN || "1d",
  },
  smtp: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_ENCRYPTION === "ssl", // true for 465, false for other ports
    auth_user: process.env.MAIL_USERNAME,
    auth_pass: process.env.MAIL_PASSWORD,
    from: {
      name: process.env.MAIL_FROM_NAME || "TownManage",
      address: process.env.MAIL_FROM_ADDRESS || "<no-reply@townmanage.com>",
    },
  },
  media_base_url: process.env.MEDIA_BASE_URL,
  storage_provider: process.env.STORAGE_PROVIDER || "local", // 'local' | 's3'
  front_end_url: process.env.FRONT_END_URL,
  visitor_app_url: process.env.VISITOR_APP_URL,
  api_base_url: process.env.API_BASE_URL,

  otp: {
    // Use 'true' or 'false' in .env
    is_static: process.env.IS_STATIC_OTP === "YES",
    // For testing purposes, remove in production koi
    static_otp: process.env.STATIC_OTP || "1234",
    test_otp_numbers: process.env.TEST_OTP_NUMBERS?.length ? process.env.TEST_OTP_NUMBERS.split(",") : [],
    test_otp_emails: process.env.TEST_OTP_EMAILS?.length ? process.env.TEST_OTP_EMAILS.split(",") : [],
  },
  sms: {
    fast2sms: {
      url: process.env.SMS_GATEWAY_URL || "",
      api_key: process.env.SMS_GATEWAY_API_KEY || "",
      sender_id: process.env.SMS_GATEWAY_SENDER_ID || "",
    },
  },

  // Redis Configuration
  redis: {
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
    REDIS_USER: process.env.REDIS_USER || undefined,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    REDIS_DB: parseInt(process.env.REDIS_DB) || 0,
  },

  // Puppeteer Chromium Path
  puppeteer_chromium_path: process.env.PUPPETEER_CHROMIUM_PATH || undefined,

  // Download Base URL
  download_base_url: process.env.DOWNLOAD_BASE_URL || "https://dl.townmanage.com",

  // Encryption Secret (32 bytes for AES-256)
  encryption_secret: process.env.ENCRYPTION_SECRET,

  // ZAPIM
  zapim: {
    api_key: process.env.ZAPIM_WHATSAPP_API_KEY || "",
    base_url: process.env.ZAPIM_WHATSAPP_API_URL || "",
    wa_number: process.env.ZAPIM_WA_NUMBER || "",
  },

  // FREE SUBSCRIPTION
  free_subscription_duration: process.env.FREE_SUBSCRIPTION_DURATION || 1,

  fcm_notifications_enabled: process.env.FCM_NOTIFICATION_ENABLED === "false" ? false : true,

  // EaseBus Subscription
  easebuzz: {
    merchant_key: process.env.EASEBUZZ_KEY || "",
    salt: process.env.EASEBUZZ_SALT || "",
    env: process.env.EASEBUZZ_ENV || "",
  },

  // Razorpay — wallet top-up & subscription purchase
  razorpay: {
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },

  // Platform billing entity — used as the "seller" on TownManage-issued
  // invoices (subscription purchases, wallet top-up receipts). Placeholder
  // values until the real legal/billing details are provided.
  company: {
    name: process.env.COMPANY_NAME || "TOWN MANAGE",
    address: process.env.COMPANY_ADDRESS || "",
    address2: process.env.COMPANY_ADDRESS2 || "",
    gstin: process.env.COMPANY_GSTIN || "",
    pan: process.env.COMPANY_PAN || "",
    email: process.env.COMPANY_EMAIL || "",
    phone: process.env.COMPANY_PHONE || "",
  },

  /**
   * ledger_lock
   * 4 = system
   *
   */
});

module.exports = { envs };
