import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MpcToolResponse } from '../models/weather.models';

@Injectable({ providedIn: 'root' })
export class McpService {
  private endpoint = 'http://localhost:8000/mcp';

  constructor(private http: HttpClient) {}

  callTool(toolName: string, args: Record<string, unknown>): Observable<string> {
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    return this.http.post<MpcToolResponse>(this.endpoint, payload).pipe(
      map(response => response.result?.content?.[0]?.text || '')
    );
  }

  getAlerts(state: string): Observable<string> {
    return this.callTool('get_alerts', { state });
  }

  getForecast(latitude: number, longitude: number): Observable<string> {
    return this.callTool('get_forecast', { latitude, longitude });
  }
}
