import { Injectable } from '@angular/core';
import { Observable, from, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class McpService {
  private readonly endpoint = 'http://localhost:8000/mcp';
  private sessionId: string | null = null;

  private async fetchWithSession(url: string, body: object): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };

    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    // Extract session ID from response headers (case-insensitive)
    const sessionHeader = response.headers.get('mcp-session-id');
    if (sessionHeader && !this.sessionId) {
      this.sessionId = sessionHeader;
      console.log('Session ID acquired:', this.sessionId);
    }

    const text = await response.text();
    console.log('Raw response:', text.substring(0, 200));

    // SSE format: "event: message\ndata: {...}"
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        return JSON.parse(line.slice(6));
      }
    }
    return JSON.parse(text);
  }

  private async initialize(): Promise<void> {
    if (this.sessionId) {
      console.log('Already have session:', this.sessionId);
      return;
    }

    console.log('Initializing session...');
    const response = await this.fetchWithSession(this.endpoint, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'weather-ui', version: '1.0' }
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }
    console.log('Init response:', JSON.stringify(response).substring(0, 100));
  }

  callTool(toolName: string, args: Record<string, unknown>): Observable<string> {
    return from(this.initialize()).pipe(
      switchMap(() => {
        console.log('Calling tool with session:', this.sessionId);
        return from(this.fetchWithSession(this.endpoint, {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        }));
      }),
      switchMap((response: any) => {
        console.log('Tool response:', JSON.stringify(response).substring(0, 200));
        if (response.error) {
          return of('Error: ' + response.error.message);
        }
        return of(response.result?.content?.[0]?.text || 'No data');
      })
    );
  }

  getAlerts(state: string): Observable<string> {
    return this.callTool('get_alerts', { state });
  }

  getForecast(latitude: number, longitude: number): Observable<string> {
    return this.callTool('get_forecast', { latitude, longitude });
  }
}
