---
name: sequelize-model-and-migration-standards
description: Enforces standards for Sequelize models, associations, JSON serialization, hooks, and database migrations in role-based access control systems.
---

# Sequelize Model & Migration Standards

This skill provides mandatory conventions for creating or updating database models and migrations in the `society-management` repository.

---

## 1. File & Directory Structure

```text
src/database/
├── models/
│   ├── index.js                  # Model registry & association loader
│   ├── <model-name>.model.js     # e.g., society.model.js, unit.model.js
│   └── hooks/                    # Audit hooks and lifecycle events
└── migrations/                   # Sequelize migration scripts
```

---

## 2. Model Structure Template

Models must export a factory function that returns an extended `Model` class:

```javascript
"use strict";
const { Model } = require("sequelize");
const PROTECTED_ATTRIBUTES = ["password", "token"];

module.exports = (sequelize, DataTypes) => {
  class MyModel extends Model {
    /**
     * Define associations here.
     * All models are injected via the models object in index.js
     */
    static associate({ AssociatedModel }) {
      this.belongsTo(AssociatedModel, {
        foreignKey: "associated_id",
        as: "associated_alias",
      });
    }

    /**
     * Hide sensitive/protected attributes in JSON serialization
     */
    toJSON() {
      const attributes = Object.assign({}, this.get());
      for (const attr of PROTECTED_ATTRIBUTES) {
        delete attributes[attr];
      }
      return attributes;
    }
  }

  MyModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "MyModel",
      tableName: "my_models",
      timestamps: true,
      underscored: true,
    }
  );

  return MyModel;
};
```

---

## 3. Migration Guidelines

1. **Naming Pattern**: Always name migration files with a timestamp prefix: `YYYYMMDDHHMMSS-description.js`.
2. **Reversibility**: Both `up` and `down` methods must be implemented for full rollback safety.
3. **Foreign Keys**: Always define explicit `onUpdate: 'CASCADE'` and `onDelete: 'SET NULL'` / `'CASCADE'` where applicable.
4. **Idempotent create-or-modify wrapper**: every migration guards against re-running against a table that already exists — `describeTable(table_name).then(modifications).catch(async () => { createTable(...); ...; await modifications(existingFields); })`. `modifications` must run in BOTH branches (first creation *and* subsequent runs) — call it inside the `.catch()` after `createTable`, not just from `.then()`.
5. **Audit trigger on every new table** (mandatory — see §3.1 below).

```javascript
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("my_models", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("my_models");
  },
};
```

### 3.1 Audit trigger (mandatory for every new table)

This is a **Postgres-specific** convention (the project's dev/prod DB is `postgres` — see `envs.db.dialect`). Every migration that creates a new table must attach the shared `audit_trigger_func()` trigger to it. The function itself is **not defined in any migration** — it is assumed to already exist in the target database (created out-of-band by a DBA/init script). Migrations only attach the trigger, guarded by an existence check so re-running the migration is a no-op.

Full pattern (copy this into the `modifications` wrapper and `down`):

```javascript
"use strict";

const { envs } = require("../../services/environment.service");
const table_name = envs.tables.my_models;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let fields = { /* ...column definitions... */ };

      // Future-safe modifications wrapper
      async function modifications(d) {
        await queryInterface.sequelize.transaction(async (t) => {
          // Add Audit Trigger if not exists
          await queryInterface.sequelize.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_${table_name}') THEN
                    CREATE TRIGGER trg_audit_${table_name}
                    AFTER INSERT OR UPDATE OR DELETE ON ${table_name}
                    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
                END IF;
            END
            $$;
          `, { transaction: t });
        });
      }

      // Check if table exists → modify or create
      await queryInterface
        .describeTable(table_name)
        .then(modifications)
        .catch(async () => {
          await queryInterface.createTable(table_name, fields);

          // IMPORTANT: modifications() must also run on first creation,
          // otherwise the trigger is only added on a re-run.
          const existingFields = await queryInterface.describeTable(table_name);
          await modifications(existingFields);
        });
    } catch (error) {
      console.error("Migration failed:", error);
      throw error; // Re-throw to ensure rollback on failure
    }
  },

  down: async (queryInterface) => {
    // Drop trigger before dropping table
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_audit_${table_name} ON ${table_name};`);
    await queryInterface.dropTable(table_name);
  },
};
```

**Rules:**
- Trigger name is always `trg_audit_<table_name>` (matches the table name exactly).
- Only applies to migrations that `createTable` (brand-new tables). Do **not** retrofit this onto older ALTER-only migrations for pre-existing tables that predate this convention (e.g. `subscriptions`, `otp_verifications`) unless explicitly asked — those need a separate, deliberate backfill migration, not an edit to their original (already-applied) migration file.
- **Never edit an already-applied migration file to add the trigger** — once a migration has run in any environment, editing its file has no effect there. A genuinely new table you're creating in the same session/PR (not yet applied anywhere) is the one case where amending your own new-file is fine; anything already shipped needs a new migration.
- Reference examples in this repo: `20260420073003-wing.js`, `20260721115421-member_payments.js`, `20260721125301-bank_list.js`, `20260722050001-plans.js`, `20260723060000-wallets.js`, `20260723060500-wallet-transactions.js`, `20260725070000-invoice-number-trackers.js`.

### 3.2 Document generation (PDF invoices/receipts)

Every generated document in this repo (sales invoice, maintenance bill, receipt, subscription invoice, wallet top-up receipt) follows the same shape — **nothing is ever stored**; the PDF is rendered fresh from a template on every download request:

1. **Template**: a `.hbs` file in `src/templates/views/`, compiled with `handlebars` (`require("handlebars")`, NOT the `hbs` npm package). Keep template logic to `{{#if}}`/`{{#each}}` only — no custom Handlebars helpers are registered anywhere in this repo, so pre-compute any conditional strings (e.g. pluralized labels) in JS and pass them in as plain fields.
2. **PDF**: `generatePDF(html)` from `helper.service.js` (Playwright Chromium under the hood — despite `puppeteer` sitting in `package.json`, it's unused/legacy).
3. **Route**: `GET /<resource>/:id/<download-name>?format=pdf|html`, returns `Content-Type: application/pdf` + `Content-Disposition: attachment; filename=...` and streams the buffer directly (`res.end(pdfBuffer)`); `?format=html` returns the raw HTML for quick visual debugging.
4. **Numbering**: pick the right sequence table for the domain —
   - **Per-society accounting documents** (sales, purchase, receipts, bills) use `vouchers` (`Vouchers.getNextVoucherNo({ society_id, fis_year, modules, is_master, division_id })`, wired via a dedicated hook like `invoices.hook.js`). `society_id` is `NOT NULL` here — this table is unusable for anything not tied to a single society.
   - **Platform-billed documents** (TownManage billing an account directly — subscriptions, wallet top-ups) use `invoice_number_trackers` instead (`InvoiceNumberTracker.getNextInvoiceNo({ fis_year, module }, { transaction })` — same atomic lock-and-increment pattern as Vouchers, but scoped only by `(fis_year, module)`, no `society_id`). Formatted as `INV/<FY>-<FY+1>/<MODULE_PREFIX>/<000001>` by `src/services/invoice/invoice-numbering.service.js`.
   - Reference: `src/services/invoice/` (numbering + per-document data builders), `src/database/hooks/subscription-invoice.hook.js` / `wallet-transaction-invoice.hook.js` (stamp `invoice_no` the moment a row transitions to its paid/settled state — never on creation of a pending/unpaid row), `src/templates/views/subscription-invoice.hbs` / `wallet-topup-receipt.hbs`.
5. **Money formatting**: use `formatMoney(amount)` from `helper.service.js` for the `₹1,234.50`-style display string on any generated document — don't reimplement `toLocaleString` inline per file.

---

## 4. Key Rules

* Use **snake_case** for database table names and column names (`unit_code`, `society_id`).
* Use **PascalCase** for model class names (`Society`, `OwnerProfile`).
* Define aliases (`as: "alias_name"`) explicitly in associations for consistent query includes.
