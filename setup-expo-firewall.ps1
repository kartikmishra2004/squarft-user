# Expo Metro Bundler Firewall Configuration Script
# This script must be run as Administrator

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Expo Metro Bundler Firewall Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if rule already exists
Write-Host "Step 1: Checking for existing firewall rule..." -ForegroundColor Yellow
$existingRule = Get-NetFirewallRule -DisplayName "Expo Metro Bundler" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "  Found existing rule. Removing it first..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Expo Metro Bundler"
    Write-Host "  Removed existing rule." -ForegroundColor Green
}

# Step 2: Create new firewall rule
Write-Host "Step 2: Creating new firewall rule for port 8081..." -ForegroundColor Yellow
try {
    New-NetFirewallRule `
        -DisplayName "Expo Metro Bundler" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 8081 `
        -Action Allow `
        -Profile Private `
        -Description "Allows incoming connections from physical devices on local network to Expo Metro bundler" `
        -ErrorAction Stop | Out-Null
    
    Write-Host "  Firewall rule created successfully!" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to create firewall rule: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Verify the rule was created
Write-Host "Step 3: Verifying firewall rule..." -ForegroundColor Yellow
$newRule = Get-NetFirewallRule -DisplayName "Expo Metro Bundler" -ErrorAction SilentlyContinue

if ($newRule) {
    Write-Host "  Rule verified:" -ForegroundColor Green
    Write-Host "    - Display Name: $($newRule.DisplayName)"
    Write-Host "    - Enabled: $($newRule.Enabled)"
    Write-Host "    - Direction: $($newRule.Direction)"
    Write-Host "    - Action: $($newRule.Action)"
} else {
    Write-Host "  ERROR: Rule was not created properly" -ForegroundColor Red
    exit 1
}

# Step 4: Check network profile
Write-Host ""
Write-Host "Step 4: Checking network profile..." -ForegroundColor Yellow
$networkProfile = Get-NetConnectionProfile

Write-Host "  Current network profile(s):" -ForegroundColor Cyan
$networkProfile | ForEach-Object {
    Write-Host "    - $($_.Name): $($_.NetworkCategory)"
    
    if ($_.NetworkCategory -eq "Public") {
        Write-Host "      WARNING: Network is set to Public. The firewall rule is configured for Private networks only." -ForegroundColor Red
        Write-Host "      You MUST change the network to Private for devices to connect." -ForegroundColor Red
    } elseif ($_.NetworkCategory -eq "Private") {
        Write-Host "      Network is correctly set to Private." -ForegroundColor Green
    }
}

# Step 5: Instructions for changing network profile
Write-Host ""
Write-Host "=== Configuration Complete ===" -ForegroundColor Cyan
Write-Host ""

if ($networkProfile.NetworkCategory -contains "Public") {
    Write-Host "IMPORTANT: Your network is currently set to Public." -ForegroundColor Red
    Write-Host "To change it to Private:" -ForegroundColor Yellow
    Write-Host "  1. Open Settings (Windows + I)"
    Write-Host "  2. Go to Network & Internet"
    Write-Host "  3. Click on your connection (Wi-Fi or Ethernet)"
    Write-Host "  4. Under 'Network profile type', select 'Private'"
    Write-Host ""
    Write-Host "OR run this command in PowerShell as Administrator:" -ForegroundColor Yellow
    $networkProfile | ForEach-Object {
        if ($_.NetworkCategory -eq "Public") {
            Write-Host "  Set-NetConnectionProfile -Name '$($_.Name)' -NetworkCategory Private" -ForegroundColor Cyan
        }
    }
    Write-Host ""
}

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Ensure your network is set to Private (see above)"
Write-Host "  2. Start your Expo development server: npm start"
Write-Host "  3. Scan the QR code with your physical device"
Write-Host "  4. Your device should now connect successfully!"
Write-Host ""
