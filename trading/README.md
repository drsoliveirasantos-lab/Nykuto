# Nykuto Trading HQ

Private personal trading workspace intended for `trading.nykuto.com`.

## V1 scope

- TradingView Advanced Chart widget for market visualization;
- local risk/position-size calculator;
- local trade journal and R statistics;
- pre-trade checklist;
- no broker execution and no automated trading;
- no server-side portfolio or credential storage.

Journal entries, checklist state and the calculator defaults are stored only in browser `localStorage` in V1.

## Privacy and publication

The production hostname must be protected by Cloudflare Access before it is treated as private. `robots.txt`, HTML robots directives and `_headers` provide defense in depth but are not substitutes for authentication.

No API key, broker credential, password or personal portfolio export may be committed to Git. Future broker or market-data integrations must keep credentials server-side and should begin read-only.

## Typography

This interface follows `../docs/typography-standard.md`: section titles remain above item titles, body/price text and metadata; form controls remain 16px for mobile usability and icon controls retain accessible touch targets.

## External chart

The chart uses TradingView's official free Advanced Chart widget. TradingView data availability and widget behavior remain subject to TradingView's own service and market-data terms.
