export const CURRENT_AUDIT = Object.freeze({
  "schema": "nykuto-current-audit-v1",
  "date": "2026-09-13",
  "pine": {
    "version": "15.2.8",
    "state": "compiled",
    "sourceSha256": "c0a6527dbe34118b47b6773905c9d0531bfebf402307d5991e26076cea536132",
    "nativeCompileVerified": true,
    "fullRuntimeParity": false,
    "nativeRevision": 70,
    "downloadPath": "/api/lab/pine"
  },
  "history": {
    "version": "2026-09-13-v3",
    "manifestSha256": "4b8e1a3fc90f8dd78e34625154c49f0715c69092eea6663a698d7580a5e8e4fc",
    "datasets": [
      {
        "id": "m1",
        "count": 352800,
        "volumeCount": 352800,
        "from": 1757887200,
        "to": 1789160340,
        "rowsSha256": "ad381ccdbd8613235b936b78bcdc1bd751a7810995f4a644d7b3c0533235423b"
      },
      {
        "id": "m5",
        "count": 354033,
        "volumeCount": 354033,
        "from": 1631577600,
        "to": 1789160100,
        "rowsSha256": "3d4dc37aa51ffaff351c73a4d46554d9c70c635798eda595e4232db2978b3366"
      },
      {
        "id": "m15",
        "count": 118011,
        "volumeCount": 118011,
        "from": 1631577600,
        "to": 1789159500,
        "rowsSha256": "4c036f09b405bd5e17d705671013b8707f68bd04dc1dbffad2db5a23ff1f73f0"
      },
      {
        "id": "h1",
        "count": 29511,
        "volumeCount": 29511,
        "from": 1631577600,
        "to": 1789156800,
        "rowsSha256": "2449edbca8c89dd6db9bb0449835cc2b07054fecf7f1df9f5ba1ac9c2116ea99"
      }
    ]
  },
  "software": {
    "siteTests": 312,
    "lifecycleTests": 45,
    "pagesFunctionModules": 45,
    "prefixChecks": "10k/40k puis 4 contrôles dans la période M1"
  },
  "research": {
    "scope": "Scanner historique figé, reconstruction analytique des sorties avec toute la quantité ; sorties partielles du Pine non reproduites.",
    "opportunityCount": 31679,
    "sequentialCount": 12074,
    "dailyQuota": null,
    "m1ResolvedAmbiguities": {
      "census": 35,
      "sequential": 9
    },
    "meanR": {
      "census": -0.057198,
      "sequential": -0.054174
    },
    "profitable": false,
    "independentlyValidated": false
  },
  "privacy": {
    "dataOwnerOnly": true,
    "privatePineSourcePublished": false,
    "brokerOrdersEnabled": false
  }
});
