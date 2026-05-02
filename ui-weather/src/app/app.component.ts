import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AlertsComponent } from './components/alerts/alerts.component';
import { ForecastComponent } from './components/forecast/forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AlertsComponent, ForecastComponent],
  template: `
    <div class="container">
      <header>
        <h1>🌦️ Weather MCP</h1>
        <p>Weather data via Model Context Protocol</p>
      </header>
      <main>
        <app-alerts></app-alerts>
        <app-forecast></app-forecast>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    header {
      text-align: center;
      margin-bottom: 32px;
    }
    header h1 {
      margin: 0;
      font-size: 2.5rem;
      color: #00d4ff;
    }
    header p {
      margin: 8px 0 0;
      color: #888;
    }
    main {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `]
})
export class AppComponent {}
