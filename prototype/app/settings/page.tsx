'use client'

import { useState } from 'react'
import { Bell, Shield, Globe, Palette, Database, Key, HelpCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    positionUpdates: true,
    rewardsAvailable: true,
    newsletter: false,
  })

  const [preferences, setPreferences] = useState({
    currency: 'USD',
    language: 'en',
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: '30',
  })

  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: true,
    publicProfile: false,
  })

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about important events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="price-alerts">Price Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when token prices change significantly
              </p>
            </div>
            <Switch
              id="price-alerts"
              checked={notifications.priceAlerts}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, priceAlerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="position-updates">Position Updates</Label>
              <p className="text-sm text-muted-foreground">
                Alerts for significant changes in your positions
              </p>
            </div>
            <Switch
              id="position-updates"
              checked={notifications.positionUpdates}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, positionUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rewards">Rewards Available</Label>
              <p className="text-sm text-muted-foreground">
                Notify when you have claimable rewards
              </p>
            </div>
            <Switch
              id="rewards"
              checked={notifications.rewardsAvailable}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, rewardsAvailable: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter">Newsletter</Label>
              <p className="text-sm text-muted-foreground">
                Weekly DeFi insights and updates
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={notifications.newsletter}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, newsletter: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize how data is displayed in the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) => 
                setPreferences({ ...preferences, currency: value })
              }>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={preferences.language} onValueChange={(value) => 
                setPreferences({ ...preferences, language: value })
              }>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={preferences.theme} onValueChange={(value) => 
                setPreferences({ ...preferences, theme: value })
              }>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh">Auto Refresh</Label>
              <Select 
                value={preferences.refreshInterval} 
                onValueChange={(value) => 
                  setPreferences({ ...preferences, refreshInterval: value })
                }
                disabled={!preferences.autoRefresh}
              >
                <SelectTrigger id="refresh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="60">Every minute</SelectItem>
                  <SelectItem value="300">Every 5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">Enable Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update portfolio data
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={preferences.autoRefresh}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, autoRefresh: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy settings and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve SolFolio by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={privacy.analytics}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, analytics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="crash">Crash Reports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send crash reports to help fix issues
              </p>
            </div>
            <Switch
              id="crash"
              checked={privacy.crashReports}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, crashReports: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your portfolio statistics
              </p>
            </div>
            <Switch
              id="public"
              checked={privacy.publicProfile}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, publicProfile: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your data or clear cached information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline">
              Export Portfolio Data (CSV)
            </Button>
            <Button variant="outline">
              Export Transaction History
            </Button>
            <Button variant="outline" className="text-destructive">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            About SolFolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <Badge variant="outline">v0.1.0-prototype</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-mono">2025.1.2.001</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Network</span>
              <Badge variant="success">Mainnet</Badge>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button variant="link" className="px-0">
              <ExternalLink className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button variant="link" className="px-0">
              <ExternalLink className="w-4 h-4 mr-2" />
              Terms of Service
            </Button>
            <Button variant="link" className="px-0">
              <ExternalLink className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}