# Astram Event Data — EDA Final Report

**Prepared by:** EventWise AI — Hackathon Team  
**Dataset:** Astram Event Data (Anonymized)  
**Generated:** 2024 (Post-EDA)  
**Script:** `backend/eda_script.py` | **Notebook:** `notebooks/eda.ipynb`

---

## Table of Contents
1. [Dataset Overview](#1-dataset-overview)
2. [Key Insights](#2-key-insights)
3. [Most Important Features for ML](#3-most-important-features-for-ml)
4. [Data Quality Issues](#4-data-quality-issues)
5. [Recommended ML Models](#5-recommended-ml-models)
6. [Recommended Dashboard Pages](#6-recommended-dashboard-pages)
7. [Suggested Hackathon MVP](#7-suggested-hackathon-mvp)

---

## 1. Dataset Overview

| Attribute | Value |
|-----------|-------|
| Total Events | **8,173** |
| Total Columns (raw) | 46 |
| Usable Columns (after cleaning) | 43 |
| Date Range | Nov 9, 2023 → Apr 8, 2024 (~5 months) |
| Geographic Coverage | Latitude 10°–20°N, Longitude 74°–80°E (Karnataka / Bengaluru region) |
| Geo Clusters (K-Means k=8) | 8 distinct hotspot zones identified |

---

## 2. Key Insights

### 2.1 Event Type Breakdown
- **94.3% Unplanned** (7,706 of 8,173 events) vs only 5.7% Planned (467)
- This heavily skewed distribution means the system is primarily a reactive incident management tool, not proactive scheduling
- Implication: ML should prioritize fast triage and response-time prediction for unplanned events

### 2.2 Top Event Causes
| Rank | Cause | Count | % of Total |
|------|-------|-------|-----------|
| 1 | vehicle_breakdown | 4,896 | 59.9% |
| 2 | others | 638 | 7.8% |
| 3 | pot_holes | 537 | 6.6% |
| 4 | construction | 480 | 5.9% |
| 5 | water_logging | 458 | 5.6% |
| 6 | accident | 365 | 4.5% |
| 7 | tree_fall | 284 | 3.5% |
| 8 | road_conditions | 170 | 2.1% |

> **Vehicle breakdowns dominate** at nearly 60%. This single cause drives most road disruptions and should be the primary focus of predictive models.

### 2.3 Geographic & Zone Distribution
- **10 operational zones** with Central Zone 2 leading (623 events, 17.9% of zone-labeled events)
- Top zones: Central Z2 > West Z1 > North Z2 > West Z2 > South Z2
- **57.9% of events lack a zone label** — critical gap for zone-based ML features
- K-Means (k=8) found 8 geographic hotspot clusters across the city grid

### 2.4 Priority & Severity
- **High priority: 61.5%** (5,030 events) vs Low priority: 38.5% (3,141 events)
- Priority is a binary label (High/Low) — suitable for both binary classification and as a feature in other models
- High-priority events tend to be vehicle breakdowns and accidents

### 2.5 Road Closure Requirements
- Only **8.3% of events require road closure** (676 out of 8,173)
- Despite the low rate, these events have outsized traffic impact
- Highly imbalanced class — use SMOTE / class weights in road closure prediction models

### 2.6 Event Status
- **86.8% Closed** (7,095), **12.3% Active** (1,007), **0.9% Resolved** (71)
- High closure rate suggests efficient incident resolution overall
- Active events are the live monitoring target for the dashboard

### 2.7 Temporal Patterns
- **Peak hours: 9 PM (810 events), 8 PM (681), 5 AM (661)** — late night / early morning dominates
- This is counter-intuitive: night-time vehicle breakdowns on highways likely explains the 9–10 PM peak
- **Peak weekdays: Thursday (1,343), Tuesday & Friday (1,245 each)**
- Weekends have lower activity: only 26.3% of events (2,153) vs 73.7% weekdays (6,020)

### 2.8 Duration Analysis
- Only **72 events** have both `start_datetime` and `resolved_datetime` populated (very sparse!)
- Mean resolution time: **4.88 hours** (median: 0.98 hours)
- Longest event: **149.4 hours** (6.2 days) — FKID007810, unplanned, Central Zone 2
- High variance (std = 19.71 hrs) suggests outlier incidents (major accidents, flooding)
- The `resolved_datetime` column is 99.1% null — duration prediction will require imputation strategies

---

## 3. Most Important Features for ML

### Categorical Features (High Predictive Power)
| Feature | Coverage | Notes |
|---------|----------|-------|
| `event_type` | 100% | Binary (unplanned/planned) — strong discriminator |
| `event_cause` | ~100% | 10+ categories, #1 predictor for duration & closure |
| `zone` | 42.1% | Powerful when present; 57.9% missing limits use |
| `corridor` | 99.8% | Nearly complete; encodes road segment identity |
| `junction` | 30.7% | When present, very specific location signal |
| `priority` | 99.98% | High/Low — direct severity indicator |
| `requires_road_closure` | 100% | Strong signal for resource allocation |
| `veh_type` | 59.8% | Relevant for breakdown prediction |

### Engineered Features
| Feature | Description |
|---------|-------------|
| `event_hour` | Hour of day (0–23) — captures peak pattern |
| `event_weekday` | Day name — weekday vs weekend matters |
| `is_weekend` | Boolean — lower activity on weekends |
| `event_month` | Month — seasonal effects (monsoon = water_logging) |
| `duration_hours` | Resolution time — ML regression target |
| `geo_cluster` | KMeans cluster ID — encodes spatial context |

### Geospatial Features
- `latitude`, `longitude` — direct coordinates
- `geo_cluster` (derived, k=8) — hotspot zone assignment
- Cluster centers saved to `outputs/cluster_centers.csv`

---

## 4. Data Quality Issues

### Critical Issues
| Column | Missing % | Impact | Recommended Action |
|--------|----------|--------|-------------------|
| `resolved_datetime` | 99.1% | Cannot compute duration for 99%+ events | Use `closed_datetime` as proxy (38.4% available) |
| `junction` | 69.3% | Limits junction-level analysis | Fill with nearest corridor; use as optional feature |
| `zone` | 57.9% | Zone-based models unreliable | Infer from lat/lon using geo-cluster mapping |
| `closed_datetime` | 61.6% | Limits closure-time analysis | Use as secondary duration proxy |
| `gba_identifier` | 57.9% | Unknown identifier; low coverage | Drop from ML features |
| `veh_no` / `veh_type` | ~40% | Limits vehicle-specific analysis | Keep for subset models |
| `assigned_to_police_id` | 98.4% | Cannot train resource assignment model | Label encoding only where available |
| `direction` | 99.5% | Nearly useless | Drop column |

### Dropped Columns (100% Empty)
- `map_file`, `comment`, `meta_data` — completely null, no informational value

### Datetime Conversion Issues
- `start_datetime`: 116 null after parsing (1.4% loss)
- `end_datetime`: only 475 valid dates (94% null) — effectively unusable
- Timestamps include timezone offset (`+00:00`) — consistently UTC

### Class Imbalance
- **Event type:** 94.3% unplanned vs 5.7% planned — severe imbalance
- **Road closure:** 91.7% False vs 8.3% True — imbalanced binary target
- **Priority:** 61.5% High vs 38.5% Low — moderate imbalance


---

## 5. Recommended ML Models

### Model 1: Road Closure Prediction 🚧
- **Type:** Binary Classification
- **Target:** `requires_road_closure` (True/False)
- **Key Features:** `event_type`, `event_cause`, `zone`, `priority`, `veh_type`, `corridor`, `event_hour`, `geo_cluster`
- **Recommended Models:**
  - XGBoost (handles imbalance, fast, interpretable)
  - Random Forest with `class_weight='balanced'`
  - Logistic Regression (baseline)
- **Handling Imbalance:** SMOTE oversampling or `scale_pos_weight` in XGBoost
- **Expected Metric:** ROC-AUC > 0.80, F1-score on minority class

### Model 2: Incident Duration Prediction ⏱️
- **Type:** Regression
- **Target:** `duration_hours`
- **Key Features:** `event_type`, `event_cause`, `zone`, `priority`, `requires_road_closure`, `event_hour`, `is_weekend`, `geo_cluster`
- **Recommended Models:**
  - XGBoost Regressor (robust to outliers with log-transform target)
  - LightGBM (fast, handles missing values natively)
  - Random Forest Regressor
- **Note:** Apply `log1p` transform to `duration_hours` before training; only 72 labeled samples — consider semi-supervised or transfer learning
- **Expected Metric:** RMSE < 3 hours on log scale

### Model 3: Priority / Severity Prediction 🔴🟡
- **Type:** Binary Classification (High/Low)
- **Target:** `priority`
- **Key Features:** `event_type`, `event_cause`, `corridor`, `junction`, `veh_type`, `requires_road_closure`, `latitude`, `longitude`
- **Recommended Models:**
  - XGBoost (primary)
  - Random Forest
  - Gradient Boosted Trees
- **Expected Metric:** F1-macro > 0.75

### Model 4: Police / Resource Recommendation 🚔
- **Type:** Multi-class Classification / Ranking
- **Target:** `assigned_to_police_id` / `police_station`
- **Key Features:** `zone`, `event_type`, `priority`, `geo_cluster`, `junction`, `corridor`
- **Recommended Models:**
  - KNN on geo-coordinates (nearest police station)
  - Decision Tree (rule-based fallback)
  - Clustering-based zone assignment
- **Note:** Only 1.6% of events have police assignment — train on available labeled data, use distance-based fallback

### Model 5: Event Hotspot Detection 📍 (Bonus)
- **Type:** Unsupervised Clustering + Anomaly Detection
- **Method:** DBSCAN or rolling K-Means on `(lat, lon, hour)` space
- **Use Case:** Real-time alert generation for emerging hotspots

---

## 6. Recommended Dashboard Pages

### Page 1: Live Incident Map 🗺️
- Real-time map of active events, color-coded by type and priority
- Cluster overlay showing the 8 geo-hotspots
- Filter by: zone, event type, time range
- Charts: active count, road closures count, avg response estimate

### Page 2: Analytics Overview 📊
- KPI cards: Total events, % closed, % high priority, avg duration
- Event type donut chart + monthly trend sparkline
- Top 5 causes bar chart + zone heatmap
- Weekday × hour heatmap (calendar view of peak times)

### Page 3: Zone & Corridor Analysis 🛣️
- Zone-level drill-down: events per zone, top causes per zone
- Top 20 corridors and junctions table
- Duration by zone horizontal bar

### Page 4: Predictive Insights 🤖
- Road closure risk score for active/new events (Model 1 output)
- Estimated resolution time for open events (Model 2 output)
- Priority prediction badge per event (Model 3 output)
- Recommended police station / unit (Model 4 output)

### Page 5: Data Quality Monitor 🔍
- Missing data % per column (live refresh)
- Events without zone assignment flagged
- Duration data coverage trend over time
- Anomaly / outlier events list

---

## 7. Suggested Hackathon MVP

### Core MVP Features (Build in 48 hours)

**1. Smart Event Triage API**
- Input: New event (event_cause, lat/lon, veh_type, hour)
- Output: Priority prediction + Road closure risk score + Estimated duration
- Models: XGBoost (Priority + Road Closure) pre-trained and serialized
- Endpoint: `POST /api/predict/triage`

**2. Live Incident Dashboard**
- Framework: React + FastAPI backend
- Map: Leaflet.js with real CSV data plotted
- Show: active events, hotspot clusters, zone breakdown
- Charts: event type pie, top causes bar, hourly sparkline

**3. Hotspot Alert System**
- Use KMeans cluster assignments to flag new events in historically dense zones
- Threshold-based alert: if cluster density > X events/hour → trigger alert
- Endpoint: `GET /api/alerts/hotspots`

### Tech Stack Recommendation
| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI (Python) |
| ML Models | scikit-learn / XGBoost, joblib for serialization |
| Frontend | React + Leaflet.js + Recharts |
| Data Store | Pandas in-memory / SQLite for hackathon |
| Deployment | Docker + local or Render.com |

### Demo Script (Judges Walkthrough)
1. Show live map with ~8,173 events plotted + cluster overlays
2. Enter a new fictional event → get instant priority + closure risk prediction
3. Show the analytics dashboard: "Central Zone 2 is the hotspot, vehicle breakdowns dominate, 9 PM is peak hour"
4. Show the event triage card: "High priority, road closure likely, estimated 2.4 hrs to resolve, recommend North Police Station"

---

## Appendix: Generated Outputs

| File | Description |
|------|-------------|
| `outputs/event_type_distribution.png` | Bar + pie chart of event types |
| `outputs/event_cause_distribution.png` | Top 15 causes bar chart |
| `outputs/zone_distribution.png` | Zone event counts |
| `outputs/priority_distribution.png` | Priority bar + pie |
| `outputs/status_distribution.png` | Status bar + pie |
| `outputs/road_closure_distribution.png` | Road closure pie |
| `outputs/top20_junctions.png` | Top 20 junctions horizontal bar |
| `outputs/top20_corridors.png` | Top 20 corridors horizontal bar |
| `outputs/monthly_trend.png` | Monthly event trend line chart |
| `outputs/hourly_trend.png` | Events by hour bar chart |
| `outputs/weekday_trend.png` | Events by weekday bar chart |
| `outputs/correlation_matrix.png` | Numeric feature correlation heatmap |
| `outputs/geo_scatter.png` | Geo scatter by event type |
| `outputs/kmeans_clusters.png` | K-Means (k=8) cluster map |
| `outputs/cluster_centers.csv` | Cluster center coordinates |
| `outputs/duration_by_event_type.png` | Mean duration by event type |
| `outputs/duration_by_zone.png` | Mean duration by zone |
| `outputs/duration_by_priority.png` | Mean duration by priority |
| `outputs/eda_stats.json` | Key statistics JSON |
| `data/events_cleaned.csv` | Cleaned dataset with engineered features |

---

*Report generated by EventWise AI EDA pipeline. All statistics derived directly from the Astram event dataset.*
