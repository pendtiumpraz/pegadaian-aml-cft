# CLAUDE.md

This file provides guidance when working with code in this repository.

## Status: Planning-stage, no code yet

This directory holds **planning documents** — no source code yet.

## Source of Truth

- `ARCHITECTURE.md` — domain model, data model, non-functional targets, security, integrations
- `ROADMAP.md` — 10-month phased plan, milestone KPIs, risk register
- `TECH_RECOMMENDATIONS.md` — tech stack decision: **Laravel 12 + Inertia.js + React 18 + PostgreSQL 15 + Redis**

When scaffolding code for this project, use the stack above.

## Platform Context

This is **1 of 4 apps** in the Pegadaian Compliance Platform:

- **Portal** — SSO (OAuth2 server), tenant management, billing, app launcher
- **01-aml-cft-app** (this dir) — APU/PPT/PPPSPM: CDD, EDD, transaction monitoring, PPATK reporting
- `../02-igracias-grc-app/` — Integrated GRC (6 modul: Risk, Audit, Compliance, Incident, Policy, Loss)
- `../03-idesk-compliance-app/` — Policy lifecycle / Compliance Desk + AI review
- `../_overview/README.md` — cross-app context

All four apps share:
- **Same tech stack**: Laravel 12 + Inertia.js + React 18 + PostgreSQL 15
- **SSO via Portal**: OAuth2 token-based auth (Laravel Passport)
- **Multi-tenancy**: Stancl/Tenancy (multi-database, BYODB, custom domain)
- **Shared Composer packages**: `pegadaian/auth-client`, `pegadaian/tenant-core`, `pegadaian/ai-service`
- **SaaS + Whitelabel ready**: BYODB, BYOS, branding per tenant

## Domain Constraints

- **Volumes**: 300k tx/hari, 31M nasabah — partition `transactions` monthly, BRIN indexes
- **Regulatory deadlines**: LTKT daily, LTKM incidental → goAML XML via SFTP to PPATK
- **Separation of duties**: Analyst ≠ Approver ≠ Admin; 4-eyes for LTKM (Spatie Permission)
- **PII handling**: NIK encrypted via Laravel Crypt; masking for non-privileged roles
- **AI**: Via HTTP API (OpenAI/Gemini/Claude), not self-hosted ML

## Language Conventions

Planning docs are in **Bahasa Indonesia mixed with English technical terms**. Preserve that register.
