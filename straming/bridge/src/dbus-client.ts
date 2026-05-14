/**
 * D-Bus client for Focus Timer integration
 * Connects to Focus Timer's D-Bus interface and provides access to Timer and Session interfaces
 */

import dbus from 'dbus-next';
import type { TimerInterface, SessionInterface, ConnectionStatus } from './types.js';

const DBUS_NAME = 'io.github.focustimerhq.FocusTimer';
const DBUS_PATH = '/io/github/focustimerhq/FocusTimer';
const TIMER_INTERFACE = 'io.github.focustimerhq.FocusTimer.Timer';
const SESSION_INTERFACE = 'io.github.focustimerhq.FocusTimer.Session';
const PROPERTIES_INTERFACE = 'org.freedesktop.DBus.Properties';

/**
 * D-Bus Properties interface
 */
interface PropertiesInterface {
  Get(interfaceName: string, propertyName: string): Promise<{ value: any }>;
  GetAll(interfaceName: string): Promise<Record<string, { value: any }>>;
  Set(interfaceName: string, propertyName: string, value: any): Promise<void>;
}

/**
 * D-Bus client for Focus Timer
 */
export class DBusClient {
  private bus: dbus.MessageBus | null = null;
  private timerProxy: TimerInterface | null = null;
  private sessionProxy: SessionInterface | null = null;
  private propertiesProxy: PropertiesInterface | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectInterval: number = 5000; // 5 seconds for initial connection
  private operationalReconnectInterval: number = 2000; // 2 seconds during operation
  private wasConnected: boolean = false;

  /**
   * Connect to Focus Timer D-Bus interface
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    try {
      // Connect to session bus
      this.bus = dbus.sessionBus();
      
      // Get Focus Timer proxy object
      const obj = await this.bus.getProxyObject(DBUS_NAME, DBUS_PATH);
      
      // Get Timer interface proxy
      this.timerProxy = obj.getInterface(TIMER_INTERFACE) as unknown as TimerInterface;
      
      // Get Session interface proxy
      this.sessionProxy = obj.getInterface(SESSION_INTERFACE) as unknown as SessionInterface;
      
      // Get Properties interface proxy
      this.propertiesProxy = obj.getInterface(PROPERTIES_INTERFACE) as unknown as PropertiesInterface;
      
      this.connectionStatus = 'connected';
      this.wasConnected = true;
      
      console.log('[DBusClient] Connected to Focus Timer D-Bus interface');
    } catch (error) {
      this.connectionStatus = 'disconnected';
      this.timerProxy = null;
      this.sessionProxy = null;
      this.propertiesProxy = null;
      
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Focus Timer D-Bus: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Disconnect from D-Bus
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.bus) {
      this.bus.disconnect();
      this.bus = null;
    }
    
    this.timerProxy = null;
    this.sessionProxy = null;
    this.propertiesProxy = null;
    this.connectionStatus = 'disconnected';
    
    console.log('[DBusClient] Disconnected from Focus Timer D-Bus interface');
  }

  /**
   * Start automatic reconnection attempts
   * @param onReconnect Callback when reconnection succeeds
   */
  startReconnecting(onReconnect?: () => void): void {
    if (this.reconnectTimer) {
      return; // Already reconnecting
    }
    
    this.connectionStatus = 'reconnecting';
    
    // Use different interval based on whether we were previously connected
    const interval = this.wasConnected 
      ? this.operationalReconnectInterval 
      : this.reconnectInterval;
    
    console.log(`[DBusClient] Starting reconnection attempts every ${interval}ms`);
    
    const attemptReconnect = async () => {
      try {
        await this.connect();
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        console.log('[DBusClient] Reconnection successful');
        
        if (onReconnect) {
          onReconnect();
        }
      } catch (error) {
        // Connection failed, schedule next attempt
        this.reconnectTimer = setTimeout(attemptReconnect, interval);
      }
    };
    
    // Start first attempt
    this.reconnectTimer = setTimeout(attemptReconnect, interval);
  }

  /**
   * Stop reconnection attempts
   */
  stopReconnecting(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionStatus === 'reconnecting') {
      this.connectionStatus = 'disconnected';
    }
  }

  /**
   * Get Timer interface proxy
   * @throws Error if not connected
   */
  getTimerInterface(): TimerInterface {
    if (!this.timerProxy) {
      throw new Error('Not connected to Focus Timer D-Bus interface');
    }
    return this.timerProxy;
  }

  /**
   * Get Session interface proxy
   * @throws Error if not connected
   */
  getSessionInterface(): SessionInterface {
    if (!this.sessionProxy) {
      throw new Error('Not connected to Focus Timer D-Bus interface');
    }
    return this.sessionProxy;
  }

  /**
   * Get Properties interface proxy
   * @throws Error if not connected
   */
  getPropertiesInterface(): PropertiesInterface {
    if (!this.propertiesProxy) {
      throw new Error('Not connected to Focus Timer D-Bus interface');
    }
    return this.propertiesProxy;
  }

  /**
   * Get a Timer property value
   * @param propertyName Name of the property
   * @returns Property value
   */
  async getTimerProperty(propertyName: string): Promise<any> {
    const props = this.getPropertiesInterface();
    const result = await props.Get(TIMER_INTERFACE, propertyName);
    return result.value;
  }

  /**
   * Get a Session property value
   * @param propertyName Name of the property
   * @returns Property value
   */
  async getSessionProperty(propertyName: string): Promise<any> {
    const props = this.getPropertiesInterface();
    const result = await props.Get(SESSION_INTERFACE, propertyName);
    return result.value;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.timerProxy !== null;
  }

  /**
   * Convert microseconds to seconds
   * @param microseconds Timestamp in microseconds
   * @returns Timestamp in seconds
   */
  static microsecondsToSeconds(microseconds: bigint): number {
    return Number(microseconds) / 1_000_000;
  }

  /**
   * Convert seconds to microseconds
   * @param seconds Timestamp in seconds
   * @returns Timestamp in microseconds
   */
  static secondsToMicroseconds(seconds: number): bigint {
    return BigInt(Math.round(seconds * 1_000_000));
  }
}
