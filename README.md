# 🐬 Dorphin Research

> **AI-powered token intelligence for the next generation of crypto analysts.**

Dorphin Research is a real-time crypto token research platform that generates institutional-grade reports in seconds. Built for traders, exchange listing teams, and Web3 researchers who need signal, not noise.

---

## What It Does

Drop a contract address. Get a full research report — exchange listings with tier ratings, contract source analysis, onchain verification, price pattern analysis, risk matrix, and a composite listing assessment score.

No hallucinations. Every data point is cited. Missing data is labeled as missing, not fabricated.

---

## Core Features

**Multi-source Data Pipeline**
Aggregates from CoinGecko, CoinMarketCap, DexScreener, Etherscan, GoPlus Security, CertiK, and Twitter — reconciled into a single structured report.

**Exchange Tier System**
5-tier classification across 50+ exchanges. T1 (Binance, Coinbase, Upbit, Bithumb) through T5 (unverified/small cap). Listing score weighted by tier presence, not just count.

**Contract Source Analysis**
Pulls verified source code directly from Etherscan. Flags mint functions, owner privileges, tax mechanisms, blacklist capabilities, and pause functions — without relying on GoPlus availability.

**Onchain Authenticity Check**
Detects wash trading patterns, ping-pong transactions, bot activity, and unusual volume-to-liquidity ratios.

**Token Age Intelligence**
Suppresses 30-day metrics for tokens under 30 days old. No fabricated volatility numbers for 7-day-old tokens.

**CertiK Integration**
Pulls Skynet score and sub-scores (Operational, Market, Community, Fundamental) directly from CoinMarketCap's data layer.

**Composite Listing Score**
Weighted scoring model: Exchange tier (40%) + Onchain activity (30%) + Price stability (30%). Adjusted by liquidity health and token age.

---

## Tech Stack

```
Frontend    React + Vite
Backend     Node.js + Express
AI Engine   Anthropic Claude API (claude-sonnet)
Data        CoinGecko · CoinMarketCap · DexScreener
            Etherscan · GoPlus · CertiK · Twitter API
Deploy      Vercel (Serverless)
```

---

## Report Sections

| Section | Data Sources |
|---|---|
| Executive Summary | Computed |
| Project Overview | CoinGecko, CMC |
| Tokenomics | CoinGecko, Whitepaper |
| Team & Investors | Twitter API, CMC |
| On-chain Metrics | Etherscan, DexScreener |
| Exchange Listings | CoinGecko, CMC |
| Holder Analysis | BscScan, CMC |
| Price Pattern | CoinGecko |
| Onchain Verification | DexScreener, Etherscan |
| Risk Matrix | GoPlus, CertiK, Contract Source |
| Listing Assessment | Composite Score |
| Data Sources | All APIs |

---

## Why Dorphin

Most token research tools either hallucinate data or only cover established projects. Dorphin targets the long tail — the thousands of new tokens that Messari and Xangle will never write about — and gives them the same structured due diligence framework that exchange listing teams actually use.

Built by someone who has sat on both sides of the listing table.

---

## Status

Active development. Core report pipeline live. Design system in progress.

---

## Contact
