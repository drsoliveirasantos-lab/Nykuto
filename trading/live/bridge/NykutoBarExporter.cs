// Quantower source adapter: compile in the Strategy template matching the installed SDK.
// Not production-certified. No Account input, no network client and no order operation.
using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TradingPlatform.BusinessLayer;

public class NykutoBarExporter : Strategy
{
    [InputParameter("Contrat Rithmic (pas continu)", 10)] public Symbol FeedSymbol;
    [InputParameter("Racine : MNQ / MES / MYM / MGC", 20)] public string Root = "MNQ";
    [InputParameter("Échéance canonique, ex. MNQ-202609", 30)] public string Contract = "";
    [InputParameter("Droits d'export personnel confirmés", 40)] public bool PermissionConfirmed = false;
    private HistoricalData history;
    private StreamWriter writer;
    private readonly object gate = new object();
    private long firstFullMinute, lastWritten;
    private bool running;

    public NykutoBarExporter() { Name = "Nykuto - export 1m lecture seule"; Description = "Source à valider ; aucun ordre ni accès au compte."; }
    protected override void OnRun()
    {
        if (!PermissionConfirmed || FeedSymbol == null || !Regex.IsMatch(Root ?? "", "^(MNQ|MES|MYM|MGC)$") ||
            !Regex.IsMatch(Contract ?? "", "^" + Root + "-20[0-9]{2}(0[1-9]|1[0-2])$") ||
            !FeedSymbol.Name.StartsWith(Root, StringComparison.Ordinal) || FeedSymbol.Name.Contains("!"))
        { Log("Vérifie les droits, le contrat natif et son échéance. Export non démarré.", StrategyLoggingLevel.Error); return; }
        try
        {
            string directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Nykuto", "feed");
            Directory.CreateDirectory(directory);
            string path = Path.Combine(directory, Root + ".jsonl");
            if (File.Exists(path) && new FileInfo(path).Length > 25 * 1024 * 1024) throw new IOException("Tampon local plein.");
            writer = new StreamWriter(new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read), new UTF8Encoding(false));
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            firstFullMinute = (now / 60000 + 1) * 60000; lastWritten = 0;
            // Omitting toTime subscribes to updates. Native Last bars preserve provider volume.
            history = FeedSymbol.GetHistory(Period.MIN1, HistoryType.Last, DateTime.UtcNow.AddMinutes(-5));
            running = true;
            history.NewHistoryItem += OnBar;
            Log("Export local démarré. Première minute partielle ignorée ; démarrer le relais séparément.", StrategyLoggingLevel.Info);
        }
        catch { OnStop(); Log("Export indisponible. Vérifie SDK, connexion, historique et fichier local.", StrategyLoggingLevel.Error); }
    }
    private void OnBar(object sender, HistoryEventArgs args)
    {
        lock (gate)
        {
            if (!running || history == null || history.Count < 2) return;
            try
            {
                // Index zero is still forming. Never export it as a closed candle.
                var bar = history[1] as HistoryItemBar;
                if (bar == null) return;
                DateTime utc = bar.TimeLeft.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(bar.TimeLeft, DateTimeKind.Utc) : bar.TimeLeft.ToUniversalTime();
                long start = new DateTimeOffset(utc).ToUnixTimeMilliseconds(), end = start + 60000;
                long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                if (start < firstFullMinute || start <= lastWritten || start % 60000 != 0 || end > now || now - end > 120000) return;
                // Server independently validates ticks, OHLC, volume, freshness and sequence.
                var message = new { schema = 1, source = "quantower-rithmic", root = Root, contract = Contract,
                    providerSymbol = FeedSymbol.Name, startMs = start, endMs = end,
                    open = bar.Open, high = bar.High, low = bar.Low, close = bar.Close, volume = bar.Volume };
                writer.WriteLine(JsonSerializer.Serialize(message)); writer.Flush(); lastWritten = start;
            }
            catch { running = false; Log("Export arrêté sur erreur ; aucune bougie inventée. Arrêter puis corriger avant reprise.", StrategyLoggingLevel.Error); }
        }
    }
    protected override void OnStop()
    {
        lock (gate)
        {
            running = false;
            if (history != null) { history.NewHistoryItem -= OnBar; (history as IDisposable)?.Dispose(); history = null; }
            writer?.Dispose(); writer = null;
        }
    }
    protected override void OnRemove() { OnStop(); }
}
