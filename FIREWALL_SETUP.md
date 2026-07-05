# Windows Firewall Setup for Expo Metro Bundler

This document explains how to configure Windows Firewall to allow physical devices on your local network to connect to the Expo Metro bundler on port 8081.

## Problem

When running `expo start` or `npm start`, physical devices scanning the QR code cannot connect to the Metro bundler at `192.168.31.143:8081` because Windows Firewall blocks incoming connections on port 8081.

## Solution

Create a Windows Firewall inbound rule that allows TCP connections on port 8081 from devices on your private network.

---

## Option 1: Automated Setup (Recommended)

### Step 1: Run the PowerShell Script

1. Open PowerShell **as Administrator**:
   - Press `Windows + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. Navigate to the project directory:
   ```powershell
   cd d:\SqarFt\squarft-user
   ```

3. Run the setup script:
   ```powershell
   .\setup-expo-firewall.ps1
   ```

4. The script will:
   - ✅ Check if a rule already exists (and remove it if necessary)
   - ✅ Create a new firewall rule for port 8081
   - ✅ Verify the rule was created successfully
   - ✅ Check your network profile (Public vs Private)
   - ✅ Provide instructions for changing to Private if needed

### Step 2: Set Network to Private (CRITICAL)

**Your network MUST be set to "Private" for the firewall rule to work.**

The script will tell you if your network is currently set to Public. If so:

#### Method A: Using Windows Settings (Easiest)
1. Press `Windows + I` to open Settings
2. Go to **Network & Internet**
3. Click on your connection (Wi-Fi or Ethernet)
4. Under **Network profile type**, select **Private**

#### Method B: Using PowerShell (Quick)
Run this command in PowerShell as Administrator (replace with your network name from the script output):
```powershell
Set-NetConnectionProfile -Name "AirFiber_1 2" -NetworkCategory Private
```

### Step 3: Verify the Setup

1. Start Expo:
   ```bash
   npm start
   ```

2. Check that Metro bundler is running:
   ```powershell
   netstat -an | findstr 8081
   ```
   You should see: `0.0.0.0:8081` or `192.168.31.143:8081`

3. Scan the QR code with your physical device
4. The app should now load successfully! 🎉

---

## Option 2: Manual Setup via GUI

### Step 1: Open Windows Defender Firewall

1. Press `Windows + R`
2. Type: `wf.msc`
3. Press Enter

### Step 2: Create Inbound Rule

1. In the left pane, click **Inbound Rules**
2. In the right pane, click **New Rule...**
3. Select **Port** → Click **Next**
4. Select **TCP** and enter **8081** in "Specific local ports" → Click **Next**
5. Select **Allow the connection** → Click **Next**
6. **IMPORTANT**: Check only **Private** (uncheck Domain and Public) → Click **Next**
7. Name: `Expo Metro Bundler` → Click **Finish**

### Step 3: Set Network to Private

Follow Step 2 from Option 1 above to set your network profile to Private.

---

## Option 3: Manual PowerShell Command

Run this single command in PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private -Description "Allows incoming connections from physical devices on local network to Expo Metro bundler"
```

Then set your network to Private using the methods described in Step 2 above.

---

## Verification Commands

### Check if the firewall rule exists:
```powershell
Get-NetFirewallRule -DisplayName "Expo Metro Bundler" | Select-Object DisplayName, Enabled, Direction, Action
```

### Check your network profile:
```powershell
Get-NetConnectionProfile | Select-Object Name, NetworkCategory, InterfaceAlias
```

### Verify Metro bundler is listening on the correct interface:
```powershell
netstat -an | findstr 8081
```

Expected output: `TCP    0.0.0.0:8081           0.0.0.0:0              LISTENING`

### Test connectivity from your mobile device:
On your mobile device connected to the same Wi-Fi network, use a network testing app to ping or test TCP connection to `192.168.31.143:8081`

---

## Troubleshooting

### Issue: Device still cannot connect

1. **Verify firewall rule exists:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Expo Metro Bundler"
   ```

2. **Verify network is Private:**
   ```powershell
   Get-NetConnectionProfile
   ```
   If it shows "Public", change it to "Private" using the instructions above.

3. **Verify Metro is listening on network interface:**
   ```powershell
   netstat -an | findstr 8081
   ```
   Should show `0.0.0.0:8081` or `192.168.31.143:8081`, NOT `127.0.0.1:8081`

4. **Check if other software is blocking:**
   - Temporarily disable any third-party antivirus/firewall software
   - Check if VPN software is interfering

5. **Verify devices are on the same network:**
   - Both your PC and mobile device must be connected to the same Wi-Fi network
   - Check your PC's IP address: `ipconfig`
   - Verify the IP in the QR code matches your PC's IP

### Issue: IP address changed

If your PC's IP address changes (DHCP):
1. Check new IP address: `ipconfig`
2. Update the `--host` flag in `package.json` if you're using explicit IP
3. Restart Expo development server
4. The firewall rule will still work (it's based on port, not IP)

### Issue: Script execution is disabled

If you get "script execution is disabled" error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Security Considerations

### Why "Private" profile only?

The firewall rule is configured for **Private** networks only, which means:
- ✅ Devices can connect when you're on your home/office network (Private)
- ✅ Connection is blocked when you're on public Wi-Fi (Public) for security
- ✅ This protects your development server from external access

### Port 8081 specifics

- Port 8081 is only for the **Metro bundler** (development server)
- It does NOT affect your backend API (port 3001) or voice agent (port 3003)
- The rule only allows **incoming** connections, not outgoing
- The rule is only active when Metro bundler is actually running

---

## Related Documentation

- For complete network setup instructions, see: `EXPO_NETWORK_SETUP.md` (if available)
- For Expo start script configuration, see: `package.json` scripts section
- For Metro bundler configuration, see: `metro.config.js`

---

## Summary

1. ✅ Run `setup-expo-firewall.ps1` as Administrator
2. ✅ Set network profile to "Private"
3. ✅ Start Expo with `npm start`
4. ✅ Scan QR code with physical device
5. ✅ App should load successfully!

If you encounter issues, follow the troubleshooting steps above or consult the design document at `.kiro/specs/expo-qr-connection-fix/design.md`.
