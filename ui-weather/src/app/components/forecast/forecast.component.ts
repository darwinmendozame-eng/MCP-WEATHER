import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../services/mcp.service';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Weather Forecast</h2>
      <div class="form-row">
        <div class="form-group">
          <label for="lat">Latitude:</label>
          <input id="lat" type="number" [(ngModel)]="latitude" placeholder="e.g., 37.7749" />
        </div>
        <div class="form-group">
          <label for="lon">Longitude:</label>
          <input id="lon" type="number" [(ngModel)]="longitude" placeholder="e.g., -122.4194" />
        </div>
        <button (click)="getForecast()" [disabled]="!latitude || !longitude">Get Forecast</button>
      </div>
      <div class="result" *ngIf="result">
        <pre>{{ result }}</pre>
      </div>
      <div class="loading" *ngIf="loading">Loading...</div>
    </div>
  `,
  styles: [`
    .card {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 24px;
      color: #eee;
    }
    h2 { margin-top: 0; color: #00d4ff; }
    .form-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 16px; flex-wrap: wrap; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 12px; color: #888; }
    input {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #0f0f23;
      color: #fff;
      width: 140px;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: #00d4ff;
      color: #000;
      cursor: pointer;
      font-weight: 600;
      height: 42px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .result pre {
      background: #0f0f23;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .loading { color: #00d4ff; }
  `]
})
export class ForecastComponent {
  latitude: number | null = null;
  longitude: number | null = null;
  result = '';
  loading = false;

  constructor(private mcpService: McpService) {}

  getForecast() {
    if (this.latitude === null || this.longitude === null) return;
    this.loading = true;
    this.result = '';
    this.mcpService.getForecast(this.latitude, this.longitude).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.result = 'Error: ' + err.message; this.loading = false; }
    });
  }
}
