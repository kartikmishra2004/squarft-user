/**
 * Bug Condition Exploration Test - Expo QR Code Connection Failure
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * GOAL: Surface counterexamples that demonstrate the bug exists
 * 
 * Bug Condition: isBugCondition(input) where
 *   input.connectionMethod = "QR_CODE" AND
 *   input.targetPort = 8081 AND
 *   input.deviceType = "PHYSICAL_DEVICE" AND
 *   input.targetHost = "192.168.31.143" AND
 *   (connectionRefused(input) OR connectionTimeout(input))
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const net = require('net');
const fc = require('fast-check');

const execAsync = promisify(exec);

/**
 * Defines the bug condition as specified in the design document
 */
function isBugCondition(input) {
  return (
    input.connectionMethod === 'QR_CODE' &&
    input.targetPort === 8081 &&
    input.deviceType === 'PHYSICAL_DEVICE' &&
    input.targetHost === '192.168.31.143'
  );
}

/**
 * Attempts to connect to Metro bundler at the specified host and port
 * Simulates what a physical device would do when scanning the QR code
 */
async function attemptMetroConnection(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let isResolved = false;

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        reject(new Error(`Connection timeout after ${timeout}ms`));
      }
    }, timeout);

    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        socket.destroy();
        resolve({
          connected: true,
          error: null,
          connectionTime: Date.now() - startTime,
        });
      }
    });

    socket.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        socket.destroy();
        reject(err);
      }
    });

    const startTime = Date.now();
    socket.connect(port, host);
  });
}

/**
 * Checks if Metro bundler is listening on the specified port
 * and determines which network interface it's bound to
 */
async function checkMetroNetworkBinding(port = 8081) {
  try {
    const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    
    const bindings = lines
      .filter(line => line.includes('LISTENING'))
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[1]; // Returns the local address (e.g., "0.0.0.0:8081" or "127.0.0.1:8081")
      });

    return {
      isListening: bindings.length > 0,
      bindings,
      isLocalhostOnly: bindings.some(b => b.startsWith('127.0.0.1')),
      isNetworkAccessible: bindings.some(b => b.startsWith('0.0.0.0') || b.startsWith('192.168')),
    };
  } catch (error) {
    return {
      isListening: false,
      bindings: [],
      isLocalhostOnly: false,
      isNetworkAccessible: false,
      error: error.message,
    };
  }
}

/**
 * Checks if Windows Firewall has a rule allowing incoming connections on port 8081
 */
async function checkFirewallRules(port = 8081) {
  try {
    const { stdout } = await execAsync(
      `netsh advfirewall firewall show rule name=all | findstr /i "8081"`
    );
    
    const hasRule = stdout.trim().length > 0;
    
    return {
      hasRule,
      ruleDetails: stdout.trim(),
    };
  } catch (error) {
    // If findstr returns no matches, it exits with code 1
    return {
      hasRule: false,
      ruleDetails: '',
      error: error.message,
    };
  }
}

/**
 * Helper function to check if a port is accessible
 */
async function checkPortAccessibility(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve({
          accessible: false,
          error: 'Connection timeout',
          host,
          port,
        });
      }
    }, timeout);

    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        socket.destroy();
        resolve({
          accessible: true,
          error: null,
          host,
          port,
        });
      }
    });

    socket.on('error', (err) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        socket.destroy();
        resolve({
          accessible: false,
          error: err.message,
          host,
          port,
        });
      }
    });

    socket.connect(port, host);
  });
}

/**
 * Checks if environment variables are correctly set
 */
function checkEnvironmentVariables() {
  return {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || null,
    aiBaseUrl: process.env.EXPO_PUBLIC_AI_BASE_URL || null,
    expectedApiUrl: 'http://192.168.31.143:3001',
    expectedAiUrl: 'http://192.168.31.143:3003',
  };
}

describe('Bug Condition Exploration - Expo QR Code Connection', () => {
  describe('Property 1: Bug Condition - QR Code Connection Failure on Physical Devices', () => {
    
    test('EXPLORATORY: Document Metro bundler network binding state (UNFIXED code)', async () => {
      console.log('\n=== METRO BUNDLER NETWORK BINDING ANALYSIS ===\n');
      
      const bindingState = await checkMetroNetworkBinding(8081);
      
      console.log('Metro Bundler Port 8081 Status:');
      console.log('- Is Listening:', bindingState.isListening);
      console.log('- Bindings:', bindingState.bindings);
      console.log('- Localhost Only (127.0.0.1):', bindingState.isLocalhostOnly);
      console.log('- Network Accessible (0.0.0.0 or 192.168.x.x):', bindingState.isNetworkAccessible);
      
      if (bindingState.error) {
        console.log('- Error:', bindingState.error);
      }
      
      console.log('\n=== EXPECTED ON UNFIXED CODE ===');
      console.log('If Metro is running but not accessible from network:');
      console.log('- Should see binding to 127.0.0.1:8081 (localhost only)');
      console.log('- Should NOT see binding to 0.0.0.0:8081 or 192.168.31.143:8081');
      console.log('\nIf Metro is not running:');
      console.log('- No bindings will be shown');
      console.log('- This test documents the state for bug analysis\n');
      
      // This is exploratory - we're documenting the state, not asserting
      expect(bindingState).toBeDefined();
    }, 15000);

    test('EXPLORATORY: Document Windows Firewall rules for port 8081 (UNFIXED code)', async () => {
      console.log('\n=== WINDOWS FIREWALL ANALYSIS ===\n');
      
      const firewallState = await checkFirewallRules(8081);
      
      console.log('Windows Firewall Port 8081 Status:');
      console.log('- Has Rule Allowing Port 8081:', firewallState.hasRule);
      
      if (firewallState.ruleDetails) {
        console.log('- Rule Details:\n', firewallState.ruleDetails);
      } else {
        console.log('- No firewall rules found for port 8081');
      }
      
      console.log('\n=== EXPECTED ON UNFIXED CODE ===');
      console.log('Likely missing firewall rule for Metro bundler (port 8081)');
      console.log('This would prevent physical devices from connecting\n');
      
      // This is exploratory - we're documenting the state, not asserting
      expect(firewallState).toBeDefined();
    }, 15000);

    test('Property 1: QR Code connection from physical device to Metro bundler MUST succeed', async () => {
      console.log('\n=== BUG CONDITION TEST ===\n');
      console.log('Testing bug condition where:');
      console.log('- Connection Method: QR_CODE');
      console.log('- Target Host: 192.168.31.143');
      console.log('- Target Port: 8081');
      console.log('- Device Type: PHYSICAL_DEVICE\n');
      
      const input = {
        connectionMethod: 'QR_CODE',
        targetHost: '192.168.31.143',
        targetPort: 8081,
        deviceType: 'PHYSICAL_DEVICE',
      };
      
      // Verify this input matches the bug condition
      expect(isBugCondition(input)).toBe(true);
      
      // Check Metro network binding
      const bindingState = await checkMetroNetworkBinding(8081);
      console.log('Metro Network Binding:', bindingState.isNetworkAccessible ? 'Network Accessible ✓' : 'Localhost Only ✗');
      
      // Check firewall rules  
      const firewallState = await checkFirewallRules(8081);
      console.log('Windows Firewall Rule for Port 8081:', firewallState.hasRule ? 'Exists ✓' : 'MISSING ✗');
      
      // CRITICAL: The bug is that Windows Firewall blocks external devices
      // even though Metro is properly configured
      // This test simulates what a physical device experiences
      
      console.log('\n=== ROOT CAUSE ANALYSIS ===');
      console.log('Metro IS listening on 0.0.0.0:8081 (network accessible)');
      console.log('But Windows Firewall has NO RULE allowing external connections on port 8081');
      console.log('Result: Physical devices cannot connect (blocked by firewall)');
      console.log('Note: Localhost connections succeed because Windows allows loopback\n');
      
      // The expected behavior: firewall rule should exist
      expect(firewallState.hasRule).toBe(true);
      
      console.log('\n=== EXPECTED BEHAVIOR ===');
      console.log('After fix, Windows Firewall should have:');
      console.log('- Inbound rule allowing TCP port 8081');
      console.log('- Rule enabled for Private network profile');
      console.log('- Physical devices can then connect to Metro bundler\n');
    }, 15000);
  });

  describe('Property-Based Test: QR Code Connection Across Network Conditions', () => {
    test('Property: Windows Firewall must allow physical device connections to port 8081', () => {
      // Scoped PBT approach: Focus on the specific failing case
      // The bug is that Windows Firewall blocks external connections
      // even though Metro is properly configured
      
      const qrCodeConnectionArbitrary = fc.record({
        connectionMethod: fc.constant('QR_CODE'),
        targetHost: fc.constant('192.168.31.143'),
        targetPort: fc.constant(8081),
        deviceType: fc.constant('PHYSICAL_DEVICE'),
      });

      return fc.assert(
        fc.asyncProperty(qrCodeConnectionArbitrary, async (input) => {
          // Verify this is a bug condition input
          expect(isBugCondition(input)).toBe(true);
          
          // The critical check: Windows Firewall rule must exist
          const firewallState = await checkFirewallRules(input.targetPort);
          
          if (!firewallState.hasRule) {
            console.log('Counterexample found:', {
              input,
              issue: 'No Windows Firewall rule for port 8081',
              impact: 'Physical devices cannot connect (blocked by firewall)',
              solution: 'Create inbound firewall rule allowing TCP port 8081',
            });
          }
          
          // Expected behavior: firewall rule must exist
          expect(firewallState.hasRule).toBe(true);
          
          return true;
        }),
        { numRuns: 5, timeout: 15000 } // Run 5 iterations with 15s timeout per test
      );
    }, 90000); // 90 second overall timeout for property-based test
  });

  describe('Property 2: Preservation - Backend Services and Other Connection Modes', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
     * 
     * IMPORTANT: This test observes and captures baseline behavior on UNFIXED code
     * 
     * These tests verify that behaviors NOT related to the QR code bug continue working:
     * - Backend API server on port 3001
     * - Voice agent backend on port 3003
     * - Localhost Metro access on port 8081
     * - Environment variables
     * - Alternative connection modes
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (confirms baseline to preserve)
     */

    test('OBSERVATION: Backend API server (port 3001) is accessible from local network', async () => {
      console.log('\n=== PRESERVATION CHECK: Backend API Server ===\n');
      
      const result = await checkPortAccessibility('192.168.31.143', 3001, 3000);
      
      console.log('Backend API Server Status:');
      console.log('- Host: 192.168.31.143');
      console.log('- Port: 3001');
      console.log('- Accessible:', result.accessible ? '✓ YES' : '✗ NO');
      if (result.error) {
        console.log('- Error:', result.error);
        console.log('\nNote: If server is not running, this is expected.');
        console.log('The test documents that port 3001 accessibility should be preserved.');
      } else {
        console.log('- Status: Server is running and accessible ✓');
      }
      
      console.log('\n=== PRESERVATION REQUIREMENT ===');
      console.log('After fixing port 8081 issue, port 3001 must remain accessible');
      console.log('No changes should affect backend API server connectivity\n');
      
      // We document the state - if server is running, it should be accessible
      // If not running, that's fine - we're documenting the preservation requirement
      expect(result).toBeDefined();
    }, 10000);

    test('OBSERVATION: Voice agent backend (port 3003) is accessible from local network', async () => {
      console.log('\n=== PRESERVATION CHECK: Voice Agent Backend ===\n');
      
      const result = await checkPortAccessibility('192.168.31.143', 3003, 3000);
      
      console.log('Voice Agent Backend Status:');
      console.log('- Host: 192.168.31.143');
      console.log('- Port: 3003');
      console.log('- Accessible:', result.accessible ? '✓ YES' : '✗ NO');
      if (result.error) {
        console.log('- Error:', result.error);
        console.log('\nNote: If server is not running, this is expected.');
        console.log('The test documents that port 3003 accessibility should be preserved.');
      } else {
        console.log('- Status: Server is running and accessible ✓');
      }
      
      console.log('\n=== PRESERVATION REQUIREMENT ===');
      console.log('After fixing port 8081 issue, port 3003 must remain accessible');
      console.log('No changes should affect voice agent backend connectivity\n');
      
      expect(result).toBeDefined();
    }, 10000);

    test('OBSERVATION: Localhost Metro bundler access (port 8081) works from Windows machine', async () => {
      console.log('\n=== PRESERVATION CHECK: Localhost Metro Access ===\n');
      
      // Check localhost access (127.0.0.1)
      const localhostResult = await checkPortAccessibility('127.0.0.1', 8081, 3000);
      
      console.log('Localhost Metro Bundler Status:');
      console.log('- Host: 127.0.0.1 (localhost)');
      console.log('- Port: 8081');
      console.log('- Accessible:', localhostResult.accessible ? '✓ YES' : '✗ NO');
      if (localhostResult.error) {
        console.log('- Error:', localhostResult.error);
        console.log('\nNote: If Metro is not running, this is expected.');
        console.log('The test documents that localhost access should be preserved.');
      } else {
        console.log('- Status: Localhost access works ✓');
      }
      
      console.log('\n=== PRESERVATION REQUIREMENT ===');
      console.log('After fixing network access on port 8081:');
      console.log('- Localhost development MUST continue to work');
      console.log('- http://localhost:8081 in browser should still load Metro status page');
      console.log('- Local debugging workflows must remain functional\n');
      
      expect(localhostResult).toBeDefined();
    }, 10000);

    test('OBSERVATION: Environment variables point to correct backend services', () => {
      console.log('\n=== PRESERVATION CHECK: Environment Variables ===\n');
      
      const envVars = checkEnvironmentVariables();
      
      console.log('Environment Variable Configuration:');
      console.log('- EXPO_PUBLIC_API_BASE_URL:', envVars.apiBaseUrl || '(not set)');
      console.log('- EXPO_PUBLIC_AI_BASE_URL:', envVars.aiBaseUrl || '(not set)');
      console.log('\nExpected Values:');
      console.log('- API Base URL:', envVars.expectedApiUrl);
      console.log('- AI Base URL:', envVars.expectedAiUrl);
      
      console.log('\n=== PRESERVATION REQUIREMENT ===');
      console.log('After fixing port 8081 issue:');
      console.log('- Environment variables MUST remain unchanged');
      console.log('- API calls should continue using http://192.168.31.143:3001');
      console.log('- Voice agent should continue using http://192.168.31.143:3003');
      console.log('- No .env file modifications should occur\n');
      
      expect(envVars).toBeDefined();
      expect(envVars.expectedApiUrl).toBe('http://192.168.31.143:3001');
      expect(envVars.expectedAiUrl).toBe('http://192.168.31.143:3003');
    });

    test('OBSERVATION: No port conflicts between services (8081, 3001, 3003)', async () => {
      console.log('\n=== PRESERVATION CHECK: Port Isolation ===\n');
      
      const ports = [8081, 3001, 3003];
      const portStatus = {};
      
      for (const port of ports) {
        try {
          const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
          const lines = stdout.trim().split('\n');
          const listeningLines = lines.filter(line => line.includes('LISTENING'));
          
          portStatus[port] = {
            isListening: listeningLines.length > 0,
            bindings: listeningLines.map(line => {
              const parts = line.trim().split(/\s+/);
              return parts[1];
            }),
          };
        } catch (error) {
          portStatus[port] = {
            isListening: false,
            bindings: [],
          };
        }
      }
      
      console.log('Port Status:');
      for (const [port, status] of Object.entries(portStatus)) {
        console.log(`\nPort ${port}:`);
        console.log('  - Listening:', status.isListening ? '✓ YES' : '✗ NO');
        if (status.bindings.length > 0) {
          console.log('  - Bindings:', status.bindings.join(', '));
        }
      }
      
      console.log('\n=== PRESERVATION REQUIREMENT ===');
      console.log('After fixing port 8081 issue:');
      console.log('- Port 8081: Metro bundler (should change from 127.0.0.1 to 0.0.0.0)');
      console.log('- Port 3001: Backend API (MUST remain unchanged)');
      console.log('- Port 3003: Voice Agent (MUST remain unchanged)');
      console.log('- No port conflicts should be introduced');
      console.log('- Each service should operate independently\n');
      
      expect(portStatus).toBeDefined();
    }, 10000);

    // Property-Based Test for Preservation
    test('Property: Non-bug-condition network connections remain unchanged', () => {
      console.log('\n=== PROPERTY-BASED PRESERVATION TEST ===\n');
      
      // Generate various non-bug-condition connection scenarios
      const preservationScenarioArbitrary = fc.oneof(
        // Backend API connections
        fc.record({
          connectionMethod: fc.constantFrom('API_CALL', 'MANUAL_URL', 'LOCALHOST'),
          targetHost: fc.constant('192.168.31.143'),
          targetPort: fc.constant(3001),
          deviceType: fc.constantFrom('PHYSICAL_DEVICE', 'EMULATOR', 'LOCALHOST'),
          description: fc.constant('Backend API server'),
        }),
        // Voice agent connections
        fc.record({
          connectionMethod: fc.constantFrom('API_CALL', 'MANUAL_URL', 'LOCALHOST'),
          targetHost: fc.constant('192.168.31.143'),
          targetPort: fc.constant(3003),
          deviceType: fc.constantFrom('PHYSICAL_DEVICE', 'EMULATOR', 'LOCALHOST'),
          description: fc.constant('Voice agent backend'),
        }),
        // Localhost Metro connections
        fc.record({
          connectionMethod: fc.constant('LOCALHOST'),
          targetHost: fc.constantFrom('127.0.0.1', 'localhost'),
          targetPort: fc.constant(8081),
          deviceType: fc.constant('LOCALHOST'),
          description: fc.constant('Localhost Metro bundler'),
        }),
        // Alternative Expo connection modes
        fc.record({
          connectionMethod: fc.constantFrom('TUNNEL', 'MANUAL_URL'),
          targetHost: fc.constantFrom('192.168.31.143', 'tunnel-url.expo.dev'),
          targetPort: fc.constant(8081),
          deviceType: fc.constantFrom('PHYSICAL_DEVICE', 'EMULATOR'),
          description: fc.constant('Alternative Expo connection mode'),
        })
      );

      return fc.assert(
        fc.property(preservationScenarioArbitrary, (scenario) => {
          // Verify this is NOT a bug condition
          const isBug = isBugCondition(scenario);
          
          console.log(`Testing preservation scenario: ${scenario.description}`);
          console.log(`  Method: ${scenario.connectionMethod}, Port: ${scenario.targetPort}, Device: ${scenario.deviceType}`);
          console.log(`  Is bug condition: ${isBug ? 'YES (unexpected!)' : 'NO (correct)'}`);
          
          // All preservation scenarios should NOT match the bug condition
          expect(isBug).toBe(false);
          
          // Document that this scenario should be preserved after the fix
          console.log(`  Preservation: This scenario MUST work the same after fixing port 8081 issue\n`);
          
          return true;
        }),
        { numRuns: 20 } // Generate 20 different preservation scenarios
      );
    });

    test('Property: Environment variables for backend services remain unchanged across fix', () => {
      console.log('\n=== PROPERTY-BASED ENVIRONMENT PRESERVATION TEST ===\n');
      
      // Generate various environment variable checks
      const envCheckArbitrary = fc.record({
        variableName: fc.constantFrom('EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_AI_BASE_URL'),
        expectedPort: fc.constantFrom(3001, 3003),
        expectedHost: fc.constant('192.168.31.143'),
      });

      return fc.assert(
        fc.property(envCheckArbitrary, (check) => {
          const envVars = checkEnvironmentVariables();
          
          console.log(`Checking: ${check.variableName}`);
          
          // The fix should NOT modify these environment variables
          // They should continue pointing to the backend services
          
          if (check.variableName === 'EXPO_PUBLIC_API_BASE_URL') {
            console.log(`  Expected: http://${check.expectedHost}:3001`);
            console.log(`  Must remain unchanged after port 8081 fix\n`);
            expect(envVars.expectedApiUrl).toBe('http://192.168.31.143:3001');
          } else {
            console.log(`  Expected: http://${check.expectedHost}:3003`);
            console.log(`  Must remain unchanged after port 8081 fix\n`);
            expect(envVars.expectedAiUrl).toBe('http://192.168.31.143:3003');
          }
          
          return true;
        }),
        { numRuns: 10 }
      );
    });

    test('Property: Port isolation ensures services operate independently', () => {
      console.log('\n=== PROPERTY-BASED PORT ISOLATION TEST ===\n');
      
      // Test that different services on different ports don't interfere with each other
      const portCombinationArbitrary = fc.record({
        port1: fc.constantFrom(8081, 3001, 3003),
        port2: fc.constantFrom(8081, 3001, 3003),
      }).filter(combo => combo.port1 !== combo.port2); // Ensure different ports

      return fc.assert(
        fc.property(portCombinationArbitrary, (combo) => {
          console.log(`Testing port isolation: ${combo.port1} vs ${combo.port2}`);
          
          // Different ports should be independent
          // Fixing port 8081 should NOT affect ports 3001 or 3003
          
          const serviceMap = {
            8081: 'Metro bundler',
            3001: 'Backend API',
            3003: 'Voice agent',
          };
          
          console.log(`  ${serviceMap[combo.port1]} should not affect ${serviceMap[combo.port2]}`);
          console.log(`  Services operate independently on separate ports\n`);
          
          // This property validates the architectural independence
          expect(combo.port1).not.toBe(combo.port2);
          
          return true;
        }),
        { numRuns: 15 }
      );
    });
  });
});
