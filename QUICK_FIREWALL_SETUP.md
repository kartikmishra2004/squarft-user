# Quick Firewall Setup Guide

## 🚀 Fastest Way (2 steps)

### Step 1: Run Setup Script as Administrator
**Right-click** `setup-expo-firewall.bat` and select **"Run as Administrator"**

### Step 2: Set Network to Private
1. Press `Windows + I`
2. Go to **Network & Internet** → Click your connection
3. Under **Network profile type**, select **Private**

**Done!** Start Expo with `npm start` and scan the QR code.

---

## 🔧 Manual Method (PowerShell)

Run in PowerShell **as Administrator**:

```powershell
# Create firewall rule
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private -Description "Allows incoming connections from physical devices on local network to Expo Metro bundler"

# Set network to Private (replace with your network name)
Set-NetConnectionProfile -Name "YOUR_NETWORK_NAME" -NetworkCategory Private
```

---

## ✅ Verify Setup

```powershell
# Check firewall rule
Get-NetFirewallRule -DisplayName "Expo Metro Bundler"

# Check network profile
Get-NetConnectionProfile

# Check Metro bundler is listening
netstat -an | findstr 8081
```

---

## ⚠️ Critical Requirements

1. **Network MUST be Private** (not Public)
2. **Script MUST run as Administrator**
3. **Firewall rule applies to port 8081 only**

---

## 📱 Test Connection

1. Start Expo: `npm start`
2. Scan QR code with mobile device
3. App should load successfully!

If issues persist, see **FIREWALL_SETUP.md** for detailed troubleshooting.
