const providers = Object.freeze({
  // Public constants - Start

  accepted_file_types: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    // doc type
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Video types
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/avi",
    "video/mov",
    // gif
    "image/gif",
    // html
    "text/html",
  ],
  society_types: [
    { name: "association_of_persons", id: 1 },
    { name: "cooperative_housing_society", id: 2 },
    { name: "home_owner_association", id: 3 },
    { name: "resident_welfare_association", id: 4 },
  ],
  // Public constants - End

  account_roles: [
    { role_id: 0, name: "user" },
    { role_id: 1, name: "Admin" },
    { role_id: 2, name: "Member" },
    { role_id: 3, name: "Receptionist" },
    { role_id: 4, name: "Master Admin" },
    { role_id: 5, name: "Secretary" },
    { role_id: 6, name: "Repair Staff" },
    { role_id: 9, name: "Web Admin" },
    { role_id: 10, name: "System Admin" },
    { role_id: 11, name: "Family Member" },
    { role_id: 12, name: "Staff" },
  ],

  USER_ROLES: {
    ADMIN: 1,
    MEMBER: 2,
    RECEPTIONIST: 3,
    MASTER_ADMIN: 4,
    SECRETARY: 5,
    REPAIR_STAFF: 6,
    VISITOR: 8,
    WEB_ADMIN: 9,
    SYSTEM_ADMIN: 10,
    FAMILY_MEMBER: 11,
    STAFF: 12,
  },

  user_status: [
    { status: 0, name: "pending" },
    { status: 1, name: "approved" },
    { status: 2, name: "rejected" },
    { status: 3, name: "disable(delete)" },
  ],

  // Private constants - Start
  // password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
  // password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
  // password_regex: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
  password_regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
  url_regex: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,

  phone_regex: /^[6-9]\d{9}$/,
  email_regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,

  tan_regex: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/i,
  gst_regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
  pan_regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
  ifsc_regex: /^[A-Z]{4}0[A-Z0-9]{6}$/i,

  public_routes: [
    "/auth",
    "/contact",
    "/cover-url",
    "/media-upload",
    "/uploads",
    "/leads",
    "/financial-years",
    "/super-admin/login",
    "/society-list",
    "/roles",
    "/society-type",
    "/countries",
    "/states",
    "/cities",
    "/society-info",
    "/visitor-entry",
    "/whatsapp",
    "/visitor-whatsapp",
    "/short-link",
    "/division-list",
    "/wing-list",
    "/visitor/auth",
    "/unit-list",
    "/get-visitor-by-mobile",
    "/division-wing-list",
    "/public",
    "/webhook",
  ],
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
  },

  refresh_token_key: "x-town-manage-refresher",
  // Private constants - End

  otp_length: 4,
  otp_expiry_time: 5 * 60,

  userSessionStatus: {
    active: "active",
    logged_out: "logged_out",
    expired: "expired",
  },

  type_of_entity: {
    residential: 1,
    commercial: 2,
    cooperative_housing: 3,
    other: 4,
  },

  status: {
    pending: 1,
    accepted: 2,
    rejected: 3,
  },

  gender: {
    male: "male",
    female: "female",
    other: "other",
  },

  access_type: {
    full: "full",
    view: "view",
  },

  billing_practices: {
    bill_in_advance: 1,
    bill_in_arrear: 2,
  },

  bill_frequency: {
    monthly: 1,
    bi_monthly: 2,
    quarterly: 3,
    half_yearly: 4,
    yearly: 5,
  },

  policy_type: {
    fixed_amount: 1,
    interest: 2,
  },

  apply_on: {
    complete_cycle: 1,
    due_date: 2,
  },

  interest_type: {
    compound: 1,
    simple: 2,
  },
  interest_mode: {
    IF: "IF", // Interest First
    PF: "PF", // Principal First
  },

  apply_after: {
    after30Days: 30,
    after60Days: 60,
    after90Days: 90,
  },

  unit_type: {
    flat: 1,
    shop: 2,
    office: 3,
    gala: 4,
    plot: 5,
  },

  usage: {
    residential: 1,
    commercial: 2,
    industrial: 3,
  },

  bedroom: {
    studio: 0,
    bedroom_1: 1,
    bedroom_2: 2,
    bedroom_3: 3,
    bedroom_4_plus: 4,
  },

  CHARGE_TYPE: {
    FIXED: "fixed",
    VARIABLE: "variable",
    VEHICLE: "vehicle",
    AREA: "area",
    CONSTRUCTION: "construction",
    TERRACE: "terrace",
    METERED: "metered",
  },

  CHARGE_VEHICLE_TYPE: {
    TWO_WHEELER: "two_wheeler",
    THREE_WHEELER: "three_wheeler",
    FOUR_WHEELER: "four_wheeler",
    COMMERCIAL: "commercial",
    OTHER: "other",
  },

  TXN_TYPE: {
    // balance_type
    regular: "regular",
    additional: "additional",
  },
  TXN_TYPE_LABEL: {
    regular: "Recurring",
    additional: "Supplementary",
  },
  JOURNAL_TYPE: {
    fund_transfer: "fund_transfer",
    member_to_member: "member_to_member",
    supplementary: "supplementary",
    ledger_adjustment: "ledger_adjustment",
  },
  JOURNAL_TYPE_LABEL: {
    fund_transfer: "Fund Transfer",
    member_to_member: "Member to Member",
    supplementary: "Supplementary",
    ledger_adjustment: "Ledger Adjustment",
  },
  // Bank Reconciliation — status of a bank_reconciliations session row.
  RECONCILIATION_STATUS: {
    PENDING: 0, // "Save & Reconcile Later" — worksheet saved but difference wasn't zero
    COMPLETED: 1, // "Save & Reconcile" — finalized, difference was zero at save time
  },
  // Modules whose vouchers can post directly against a bank/cash ledger and are
  // therefore eligible to appear in a Bank Reconciliation worksheet. Reuses the
  // existing `modules` keys/values as the `source_table` tag stored on each
  // bank_reconciliations.metadata entry. Expense is excluded by product
  // decision. Receipt/Payment/Journal touch the bank via their own main-table
  // `account_ledger`; Credit/Debit Notes touch it via their *_map line items
  // instead (their own account_ledger is restricted from ever being bank/cash)
  // — see SOURCE_MODEL_MAP in bank-reconciliation.service.js.
  RECONCILE_SOURCE_MODULES: ["receipt", "payment", "journal", "credit_note", "debit_note"],
  PAYMENT_IDENTIFIERS: {
    MEMBER_PAYMENT: "member-payment",
    SUBSCRIPTION: "subscription",
    WALLET_TOPUP: "wallet-topup",
  },
  PAYMENT_GATEWAY: {
    EASEBUZZ: "easebuzz",
    RAZORPAY: "razorpay",
  },

  // ##### Wallet (airdrop / top-up -> spend on subscriptions) #####
  WALLET_TXN_TYPE: {
    CREDIT: "credit",
    DEBIT: "debit",
  },
  WALLET_TXN_SOURCE: {
    AIRDROP: "airdrop", // System Admin grants credit, no gateway
    TOPUP: "topup", // user self top-up via Easebuzz
    PURCHASE: "purchase", // spent on a subscription
    REFUND: "refund", // reserved for future use
  },
  WALLET_TXN_STATUS: {
    PENDING: "pending", // topup awaiting gateway confirmation
    SUCCESS: "success",
    FAILED: "failed",
  },
  WALLET_MIN_TOPUP_AMOUNT: 100,

  modules: {
    invoice_bill: "invoice_bill",
    receipt: "receipt",
    payment: "payment",
    sales: "sales",
    purchase: "purchase",
    expense: "expense",
    plan_invoice: "plan_invoice",
    journal: "journal",
    debit_note: "debit_note",
    credit_note: "credit_note",
  },

  LEDGER_TYPE: {
    ledger: "ledger",
    unit: "unit",
  },

  staff_payment_type: {
    advance: "advance",
    salary: "salary",
  },
  staff_types: {
    user: "user",
    staff: "staff",
  },

  comments: "bill charge",
  posting_to: "charge",

  transaction_type: {
    debit: "debit",
    credit: "credit",
  },

  status: {
    draft: "draft",
    reconciled: "reconciled",
    final: "final",
    unpaid: "unpaid",
    partially_paid: "partially paid",
    paid: "paid",
  },

  due_date_days: {
    due_on_receipt: 0,
    net_15_day: 15,
    net_30_day: 30,
    net_45_day: 45,
    net_60_day: 60,
  },

  bill_source: {
    sales: "sales",
    purchase: "purchase",
  },

  VEHICLE_USAGE: {
    personal: 1,
    commercial: 2,
  },

  VEHICLE_TYPE: {
    TWO_WHEELER: 1,
    THREE_WHEELER: 2,
    FOUR_WHEELER: 3,
  },

  VEHICLE_OWNED_BY: {
    owner: 1,
    tanant: 2,
  },
  PARKING_TYPE: {
    open: 1,
    stilt: 2,
  },

  staff_type: {
    security_guards: 1,
    housekeeping: 2,
    gardens: 3,
    maintenance_person: 4,
    cleaning_staff: 5,
  },

  complaint_type: {
    private: "private",
    public: "public",
  },

  //   complaint_type: {
  //   "Water & Drainage Systems": 1,
  //   "Electrical Systems": 2,
  //   "Wood & Furniture Work": 3,
  //   "Construction & Structural Work": 4,
  //   "Surface Finishing": 5,
  //   "Metal Fabrication": 6,
  //   "General Small Repairs (Multi-skill)": 7,
  // Maintenance: 1,
  // Security: 2,
  // Water: 3,
  // Parking: 4,
  // Electricity: 5,
  // Lift: 6,
  // Amenities: 7,
  // Other: 8
  // },

  priority_level: {
    high: 1,
    medium: 2,
    low: 3,
  },

  complaint_track_action: {
    assigned: "assigned",
    approved: "approved",
    completed: "completed",
    rejected: "rejected",
  },

  entry_type: {
    guest: 1,
    delivery: 2,
    taxi: 3,
    visiting_help: 4,
  },

  sms_templates: {
    otp: 199488,
  },

  vehicle_name: {
    toyota: 1,
    tata: 2,
    volkswagen_group: 3,
    general_motors: 4,
    ford_motor_company: 5,
    honda: 6,
    bmw: 7,
    mercedes_benz: 8,
    hyundai: 9,
    nissan: 10,
    fiat_chrysler_automobiles: 11,
  },

  complaint_status: {
    pending: "pending",
    progress: "progress",
    completed: "completed",
    rejected: "rejected",
  },

  VISITOR_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    DECLINED: "declined",
    CHECKED_OUT: "checked_out",
  },

  agreement_executed_by: {
    owner: 1,
    care_taker: 2,
  },

  staff_status: {
    pending: "pending",
    approved: "approved",
  },

  billPaymentStatus: {
    pending: 0,
    verifying: 1,
    paid: 2,
  },

  SHORT_CODE_TYPES: {
    INVOICE: "INVOICE",
    MAINTENANCE_RECEIPT: "MAINTENANCE_RECEIPT",
    RECEIPT: "RECEIPT",
    UNIT_STATEMENT: "UNIT_STATEMENT",
    REPAIR_STAFF_COMPLAINT_ASSIGN: "REPAIR_STAFF_COMPLAINT_ASSIGN",
    REPAIR_STAFF_COMPLAINT_ON_COMPLETED: "REPAIR_STAFF_COMPLAINT_ON_COMPLETED",
  },

  ZAPIM_TEMPLATES: {
    MAINTENANCE_INVOICE: "maintenance_invoice",
    MAINTENANCE_RECEIPT: "maintenance_receipt",
    ACCOUNT_STATEMENT: "account_statement",
    REPAIR_STAFF_COMPLAINT_ASSIGN: "repair_staff_complaint_assign",
    REPAIR_STAFF_COMPLAINT_ON_APPROVAL: "repair_staff_complaint_on_approve",
    VISITOR_QR_REQUEST: "visitor_qr",
  },

  shift: {
    day: "day",
    night: "night",
  },

  // repair_staff: {
  //   plumber: 1,
  //   electrician: 2,
  //   carpenter: 3,
  //   mason: 4,
  //   painter: 5,
  //   welder: 6,
  //   handyman: 7
  // },

  AMENITY_TYPES: {
    basic_and_essential: 1,
    health_and_fitness: 2,
    sports_and_recreation: 3,
    entertainment_and_social: 4,
    kids_and_senior_citizens: 5,
    luxury_and_modern_amenities: 6,
    other: 7,
  },

  repair_staff_type_messages: [
    {
      id: 1,
      staff_type: "plumber",
      message: "New Plumbing Work Assigned",
    },
    {
      id: 2,
      staff_type: "electrician",
      message: "New Electric Work Assigned",
    },
    {
      id: 3,
      staff_type: "carpenter",
      message: "New Carpentry Work Assigned",
    },
    {
      id: 4,
      staff_type: "mason",
      message: "New Mason Work Assigned",
    },
    {
      id: 5,
      staff_type: "painter",
      message: "New Painter Work Assigned",
    },
    {
      id: 6,
      staff_type: "welder",
      message: "New Welder Work Assigned",
    },
    {
      id: 7,
      staff_type: "handyman",
      message: "New Handyman Work Assigned",
    },
  ],

  VOUCHER_TYPE_MAP: {
    RECEIPT: "RCPT",
    CHQRTN: "CHQRTN",
    PAYMENT: "PMT",
    CONTRA: "CTR",
    "DEBIT NOTE": "DN",
    "CREDIT NOTE": "CN",
    JOURNAL: "JV",
    "GST INVOICE": "GSTIN",
    multi_payment: "MLPMT",
    INVOICE: "INV",
    GST: "GST",
    INTEREST: "INT",
    PURCHASE: "PRCS",
  },

  KYC_STATUS: {
    pending: "pending",
    inprogress: "inprogress",
    approved: "approved",
    rejected: "rejected",
  },

  SUB_MERCHANT_STATUS: {
    pending: "pending",
    inprogress: "inprogress",
    approved: "approved",
    rejected: "rejected",
  },

  // ##### Subscription plans (Premium / Premium Pro) #####
  PLAN_TYPE: {
    PREMIUM: "premium", // mandatory base plan (all account types), flat monthly
    PREMIUM_PLUS: "premium_plus", // add-on (requires active Premium), per-unit, unlocks email/sms/whatsapp
  },
  // Display name for the account trial (shown to users as an in-progress plan)
  TRIAL_PLAN_NAME: "Demo",
  PRICING_MODEL: {
    FLAT_MONTHLY: "flat_monthly", // Premium: price_per_month * months
    PER_UNIT_MONTHLY: "per_unit_monthly", // Premium Pro: price_per_unit * units * months
  },
  SUBSCRIPTION_SCOPE: {
    ACCOUNT: "account", // Premium: keyed by user_id, covers all owner's societies
    SOCIETY: "society", // Premium Pro bought by Web Admin (society_id)
    DIVISION: "division", // Premium Pro bought by Admin (division_id)
  },
  // Who the subscription invoice is billed to — explicit buyer choice, independent of scope
  BILL_TO: {
    SELF: "self",
    SOCIETY: "society",
  },
  // NOTE: 0/1/2 keep the legacy subscriptions semantics; 3+ are new
  SUBSCRIPTION_STATUS: {
    INACTIVE: 0, // expired/inactive (legacy)
    ACTIVE: 1, // active (legacy)
    DEACTIVATED: 2, // manually deactivated (legacy toggle)
    PENDING: 3, // created, awaiting online payment
    TRIAL: 4, // 15-day account trial
    CANCELLED: 5,
  },
  SUBSCRIPTION_PAYMENT_STATUS: {
    PENDING: "pending",
    SUCCESS: "success",
    FAILED: "failed",
  },
  // Platform-billed invoices (TownManage -> account), numbered via invoice_number_trackers.
  // Separate from `modules` above, which is the per-society accounting Vouchers enum.
  INVOICE_MODULE: {
    SUBSCRIPTION: "subscription",
    WALLET_TOPUP: "wallet_topup",
  },
  PLAN_FEATURES: {
    MULTI_SOCIETY: "multi_society",
    EMAIL: "email",
    SMS: "sms",
    WHATSAPP: "whatsapp",
  },
  OTP_PURPOSE: {
    LOGIN: "login",
    PHONE_CHANGE: "phone_change",
    EMAIL_CHANGE: "email_change",
  },
  OTP_CHANNEL: {
    SMS: "sms",
    EMAIL: "email",
    WHATSAPP: "whatsapp",
  },
});

module.exports = { providers };
