# Nykuto economic-calendar policy — 2026-09-12

Research-only. It must not enable broker orders or convert a historical association into a guaranteed edge.

## Official sources

- BLS auto-updating iCalendar: CPI, Employment Situation/NFP, PPI.
- Federal Reserve FOMC calendar: policy decision day, normalized to 14:00 America/New_York for the statement window.
- BEA release schedule: Personal Income and Outlays/PCE and GDP releases.

The runtime calendar must expose source, fetchedAt and freshness. A stale or unavailable calendar must never be interpreted as `CLEAR`.

## Long-history MNQ diagnostic

Volume-aware replay: 1,555 sequential plans, 62,279 5-minute bars, 2025-10-26 through 2026-09-11.

Tier A = CPI, Employment Situation/NFP, FOMC. Event-bar medians were approximately 4.99 / 4.85 / 3.74 ATR with relative volume 6.57x / 5.96x / 3.51x respectively.

Baseline: TP1 44.89%, TP2 19.42%, TP3 10.74%.

New plans opened 0-120 minutes after Tier A: n=29, TP1 24.14%, TP2 6.90%, TP3 6.90%, final-state SL 75.86%. All other plans TP1 45.28%. Fisher TP1 versus all other plans p≈0.024. Same-clock non-event control was weaker evidence (39.78% TP1, n=279; p≈0.112), so this remains a research admission candidate, not a production proof.

Later Apr-Sep split: n=13 post-A plans, TP1 7.69%, TP2 0%, TP3 0%, final-state SL 92.31%; TP1 versus the rest of that period p≈0.0085.

Plans already active when Tier A arrived: n=20, TP1 70%, TP2 55%, TP3 30%. Two of 20 had SL and a target inside the same 5-minute event bar. Therefore do not auto-close an active analytical plan solely because a Tier A event arrives; flag event-crossing / execution ambiguity instead.

Tier B = PPI, PCE, GDP advance. Post-event 0-120 minutes: n=15, TP1 66.67%, TP2 40%, TP3 13.33%. No hard Tier B cooldown is supported.

## State machine

- `CLEAR`: no tested Tier A risk window.
- `EVENT_SOON`: Tier A within 30 minutes. Warning only for analytical logic; automated execution remains fail-safe.
- `EVENT_LIVE`: -5 to +10 minutes around Tier A. Analytics remain visible; automated execution disabled because of extreme event-bar range/volume and intrabar ambiguity.
- `POST_A_RISK`: 0-120 minutes after Tier A. Mark new plans `BLOCK_CANDIDATE` / strong caution in research. Do not promote to a production hard gate until exact sequential resimulation of skipped entries and future shadow validation.
- `EVENT_CONTEXT`: Tier B within ±30 minutes. Context only.
- `CALENDAR_STALE`: stale/missing official sources. Never claim news-safe; automated execution disabled.

## Validation limitation

Filtering the 29 post-A plans is not an exact re-simulation after skipped trades: a skipped plan may allow a later signal that the original sequential engine could not take. The calendar layer therefore stays research-only until a dedicated gated replay is run.
