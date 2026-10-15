# Antigravity Multi-Region Donor Portal & Payment Aggregator Monorepo

Production-ready backend monorepo architecture with region-aware compliance gating (US, EU, IN) and a unified payments aggregator supporting **Crypto (USDC/USDT)**, **Skrill**, and **Neteller** for a 20 USD registration flow.

---

## 🏛️ Monorepo Architecture

```
├── apps/
│   ├── portal/                      # Frontend Next.js 14 App Router
│   └── admin/                       # Regional Compliance & Audit Dashboard
├── services/
│   ├── payments-aggregator/         # Fastify orchestrator + Crypto / Skrill / Neteller adapters
│   ├── donor-service/               # Profile, consent, and KYC gating
│   ├── screening-service/           # Lifecycle screening & clinical clearance
│   ├── document-service/            # Encrypted HIPAA / GDPR compliant document storage
│   └── compliance-service/          # Region-scoped retention & audit ledger
├── regions/
│   ├── region-us/region_config.json # US HIPAA, 1099-MISC, Tier 1 KYC
│   ├── region-eu/region_config.json # EU GDPR, MiCA compliant, Tier 2 KYC
│   └── region-in/region_config.json # IN DPDP, RBI/FIU 1% TDS, Tier 2 KYC
├── libs/
│   ├── prisma/schema.prisma         # Multi-region polymorphic payment models
│   ├── shared-types/                # Region & Payment TypeScript DTOs
│   └── region-utils/                # KYC assertion & regional rule manager
└── infra/
    └── docker-compose.yml           # PostgreSQL 16 + Redis 7 + Service manifests
```

---

## 🚀 Quick Start

### 1. Start Infrastructure
```bash
docker-compose -f infra/docker-compose.yml up -d
```

### 2. Generate Database Schema
```bash
npx prisma generate --schema=libs/prisma/schema.prisma
npx prisma db push --schema=libs/prisma/schema.prisma
```

### 3. Run the Payments Aggregator Service
```bash
cd services/payments-aggregator
npm install
npm run dev
```
The aggregator will boot on `http://localhost:4000`.

---

## 📡 API Endpoints (Region-Scoped)

### 1. Initiate 20 USD Registration Payment
```http
POST /api/v1/:region_code/payments/initiate
Content-Type: application/json

{
  "donor_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "method": "CRYPTO", // "CRYPTO" | "SKRILL" | "NETELLER"
  "amount_usd": 20.00,
  "asset": "USDC",
  "network": "Polygon"
}
```

### 2. Query Payment Status & Receipt
```http
GET /api/v1/:region_code/payments/:payment_id
```

### 3. Inbound Gateway Webhooks
```http
POST /webhooks/:region_code/payments/:provider
```
Supported providers: `crypto`, `skrill`, `neteller`.

### 4. Admin Region Audit & Force Complete
```http
GET /admin/:region_code/payments
POST /admin/:region_code/payments/:payment_id/force_complete
```
