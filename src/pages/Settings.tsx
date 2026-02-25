import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { settings, saveSettings, isSaving, loading } = useSettings();
  const [darkMode, setDarkMode] = useState(settings.theme === "dark");
  const [apiKey, setApiKey] = useState(settings.api_key ?? "");
  const [apiSecret, setApiSecret] = useState(settings.api_secret ?? "");
  const [riskPerTrade, setRiskPerTrade] = useState(settings.default_risk_per_trade);
  const [maxDrawdown, setMaxDrawdown] = useState(settings.default_max_drawdown);
  const notifications = (settings.notifications as Record<string, boolean>) || {};
  const [tradeEntry, setTradeEntry] = useState(notifications.tradeEntry ?? true);
  const [riskWarnings, setRiskWarnings] = useState(notifications.riskWarnings ?? true);
  const [dailySummary, setDailySummary] = useState(notifications.dailySummary ?? false);

  const themeHydrated = useRef(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    if (themeHydrated.current) {
      saveSettings({ theme: darkMode ? "dark" : "light" });
    } else {
      themeHydrated.current = true;
    }
  }, [darkMode, saveSettings]);

  useEffect(() => {
    setDarkMode(settings.theme === "dark");
    setApiKey(settings.api_key ?? "");
    setApiSecret(settings.api_secret ?? "");
    setRiskPerTrade(settings.default_risk_per_trade);
    setMaxDrawdown(settings.default_max_drawdown);
    setTradeEntry((settings.notifications as Record<string, boolean>)?.tradeEntry ?? true);
    setRiskWarnings((settings.notifications as Record<string, boolean>)?.riskWarnings ?? true);
    setDailySummary((settings.notifications as Record<string, boolean>)?.dailySummary ?? false);
  }, [settings]);

  const handleSaveConnection = () => {
    saveSettings({ api_key: apiKey, api_secret: apiSecret });
  };

  const handleSaveRisk = () => {
    saveSettings({ default_risk_per_trade: riskPerTrade, default_max_drawdown: maxDrawdown });
  };

  const handleSaveNotifications = () => {
    saveSettings({ notifications: { tradeEntry, riskWarnings, dailySummary } });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label>Dark Mode</Label>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Exchange Connection</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">API Key</Label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your exchange API key" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">API Secret</Label>
            <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Enter your exchange API secret" />
          </div>
          <p className="text-xs text-muted-foreground">API keys are stored securely and used only for trade execution.</p>
          <Button variant="outline" size="sm" onClick={handleSaveConnection} disabled={isSaving}>Save Connection</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Default Risk Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label className="text-xs">Default Risk Per Trade (%)</Label><Input type="number" value={riskPerTrade} onChange={(e) => setRiskPerTrade(Number(e.target.value))} step={0.1} /></div>
            <div className="space-y-1"><Label className="text-xs">Default Max Drawdown (%)</Label><Input type="number" value={maxDrawdown} onChange={(e) => setMaxDrawdown(Number(e.target.value))} step={0.1} /></div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSaveRisk} disabled={isSaving}>Save Risk Defaults</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between"><Label className="text-xs">Trade Entry Alerts</Label><Switch checked={tradeEntry} onCheckedChange={setTradeEntry} /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label className="text-xs">Risk Limit Warnings</Label><Switch checked={riskWarnings} onCheckedChange={setRiskWarnings} /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label className="text-xs">Daily Summary</Label><Switch checked={dailySummary} onCheckedChange={setDailySummary} /></div>
          <Button variant="outline" size="sm" onClick={handleSaveNotifications} disabled={isSaving}>Save Notifications</Button>
        </CardContent>
      </Card>
    </div>
  );
}
