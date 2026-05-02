import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../services/mcp.service';
import { TranslationService } from '../../services/translation.service';

interface LocationResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forecast-wrapper">
      <div class="search-bar">
        <h2>Weather Forecast</h2>
        <div class="search-row">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search city or zip code..."
            (keyup.enter)="searchLocations()"
          />
          <button (click)="searchLocations()" [disabled]="!searchQuery || searching">
            {{ searching ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <div class="location-results" *ngIf="locations.length > 0">
          <div
            class="location-item"
            *ngFor="let loc of locations; let i = index"
            (click)="selectLocation(loc)"
          >
            <div class="location-name">{{ loc.name }}, {{ loc.admin1 || loc.country }}</div>
            <div class="location-coords">{{ loc.latitude.toFixed(4) }}, {{ loc.longitude.toFixed(4) }}</div>
          </div>
        </div>

        <div class="no-results" *ngIf="searchDone && locations.length === 0">
          No locations found. Try a different search term.
        </div>
      </div>

      <div class="translation-bar" *ngIf="result && !quotaExceeded">
        <label>Translate to:</label>
        <select [(ngModel)]="targetLang" (change)="onLanguageChange()">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="pt">Português</option>
        </select>
        <button class="translate-btn" (click)="translateResult()" [disabled]="translating">
          {{ translating ? 'Translating...' : 'Translate' }}
        </button>
      </div>

      <!-- Quota Exceeded Warning -->
      <div class="quota-warning" *ngIf="quotaExceeded">
        <div class="quota-icon">⏳</div>
        <div class="quota-content">
          <h4>Translation Limit Reached</h4>
          <p>{{ quotaMessage }}</p>
          <p class="quota-link">Visit <a href="https://mymemory.translated.net/doc/usagelimits.php" target="_blank">MyMemory</a> for more translations.</p>
        </div>
      </div>

      <div class="result" *ngIf="result">
        <pre>{{ translatedResult || result }}</pre>
      </div>

      <div class="loading" *ngIf="loading">Loading forecast...</div>

      <div class="selected-location" *ngIf="selectedLocation">
        <span class="location-label">📍 {{ selectedLocation.name }}, {{ selectedLocation.admin1 || selectedLocation.country }}</span>
      </div>
    </div>
  `,
  styles: [`
    .forecast-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-bar {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 24px;
    }

    h2 {
      margin: 0 0 16px 0;
      color: #00d4ff;
      font-size: 1.5rem;
    }

    .search-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #fff;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #60a5fa;
    }

    button {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      background: #00d4ff;
      color: #000;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    button:hover:not(:disabled) {
      background: #00b8e6;
      transform: translateY(-2px);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .location-results {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
    }

    .location-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .location-item:hover {
      background: rgba(30, 41, 59, 0.9);
      border-color: #60a5fa;
    }

    .location-name {
      color: #e2e8f0;
      font-weight: 500;
    }

    .location-coords {
      color: #64748b;
      font-size: 0.85rem;
    }

    .no-results {
      color: #94a3b8;
      text-align: center;
      padding: 16px;
    }

    .translation-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .translation-bar label {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .translation-bar select {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #fff;
      cursor: pointer;
    }

    .translate-btn {
      padding: 8px 16px;
      background: #7c3aed;
      color: #fff;
    }

    .translate-btn:hover:not(:disabled) {
      background: #6d28d9;
    }

    .quota-warning {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background: rgba(234, 179, 8, 0.1);
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 12px;
    }

    .quota-icon {
      font-size: 24px;
    }

    .quota-content h4 {
      margin: 0 0 8px 0;
      color: #eab308;
      font-size: 1rem;
    }

    .quota-content p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .quota-link a {
      color: #60a5fa;
      text-decoration: underline;
    }

    .result {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 24px;
    }

    .result pre {
      color: #e2e8f0;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
    }

    .loading {
      text-align: center;
      color: #00d4ff;
      padding: 24px;
    }

    .selected-location {
      text-align: center;
      padding: 12px;
    }

    .location-label {
      color: #60a5fa;
      font-weight: 500;
    }
  `]
})
export class ForecastComponent {
  searchQuery = '';
  locations: LocationResult[] = [];
  selectedLocation: LocationResult | null = null;
  searching = false;
  searchDone = false;
  loading = false;
  translating = false;
  quotaExceeded = false;
  quotaMessage = '';
  targetLang = 'es';
  result = '';
  translatedResult = '';

  constructor(
    private mcpService: McpService,
    private translationService: TranslationService
  ) {}

  searchLocations() {
    if (!this.searchQuery) return;
    this.searching = true;
    this.searchDone = false;
    this.locations = [];

    this.mcpService.searchLocations(this.searchQuery).subscribe({
      next: (data) => {
        this.locations = this.parseLocations(data);
        this.searchDone = true;
        this.searching = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchDone = true;
        this.searching = false;
      }
    });
  }

  selectLocation(location: LocationResult) {
    this.selectedLocation = location;
    this.locations = [];
    this.searchQuery = '';
    this.getForecast(location.latitude, location.longitude);
  }

  getForecast(latitude: number, longitude: number) {
    this.loading = true;
    this.result = '';
    this.translatedResult = '';
    this.quotaExceeded = false;

    this.mcpService.getForecast(latitude, longitude).subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: (err) => {
        this.result = 'Error: ' + err.message;
        this.loading = false;
      }
    });
  }

  onLanguageChange() {
    if (this.result && this.targetLang !== 'en') {
      this.translateResult();
    } else {
      this.translatedResult = '';
    }
  }

  translateResult() {
    if (!this.result) return;
    this.translating = true;
    this.quotaExceeded = false;
    this.translationService.translateText(this.result, this.targetLang).subscribe({
      next: (translated) => {
        if (translated.includes('__TRANSLATION_QUOTA_EXCEEDED__')) {
          const parts = translated.split('|');
          this.quotaExceeded = true;
          this.quotaMessage = parts[1] || 'Daily translation limit reached';
          this.translatedResult = '';
        } else {
          this.translatedResult = translated;
        }
        this.translating = false;
      },
      error: () => {
        this.translating = false;
      }
    });
  }

  private parseLocations(data: string): LocationResult[] {
    const locations: LocationResult[] = [];
    const lines = data.split('\n');

    for (const line of lines) {
      const latMatch = line.match(/Lat:\s*([-\d.]+)/);
      const lonMatch = line.match(/Lon:\s*([-\d.]+)/);

      if (latMatch && lonMatch) {
        const lat = parseFloat(latMatch[1]);
        const lon = parseFloat(lonMatch[1]);
        const idx = lines.indexOf(line);
        const nameLine = lines[idx - 1]?.trim();

        if (nameLine && !nameLine.startsWith('Found')) {
          const parts = nameLine.split(',').map(p => p.trim());
          const name = parts[0] || '';
          const admin1 = parts.length > 1 ? parts[1] : undefined;
          const country = parts.length > 2 ? parts[2] : 'Unknown';

          locations.push({ name, admin1, country, latitude: lat, longitude: lon });
        }
      }
    }
    return locations;
  }
}
