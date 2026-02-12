import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
            <Input type="password" placeholder="Enter your exchange API key" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">API Secret</Label>
            <Input type="password" placeholder="Enter your exchange API secret" />
          </div>
          <p className="text-xs text-muted-foreground">API keys are stored securely and used only for trade execution.</p>
          <Button variant="outline" size="sm">Save Connection</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Default Risk Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label className="text-xs">Default Risk Per Trade (%)</Label><Input type="number" defaultValue={1} step={0.1} /></div>
            <div className="space-y-1"><Label className="text-xs">Default Max Drawdown (%)</Label><Input type="number" defaultValue={10} step={0.1} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between"><Label className="text-xs">Trade Entry Alerts</Label><Switch defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label className="text-xs">Risk Limit Warnings</Label><Switch defaultChecked /></div>
          <Separator />
          <div className="flex items-center justify-between"><Label className="text-xs">Daily Summary</Label><Switch /></div>
        </CardContent>
      </Card>
    </div>
  );
}
