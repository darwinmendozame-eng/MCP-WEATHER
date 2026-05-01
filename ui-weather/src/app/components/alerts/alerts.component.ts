import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../services/mcp.service';
import { TranslationService } from '../../services/translation.service';
import { AlertDetailComponent } from '../alert-detail/alert-detail.component';
import { AlertParserService, ParsedAlert } from '../../services/alert-parser.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertDetailComponent],
  template: `
    <div class="alerts-wrapper">
      <div class="search-bar">
        <div class="form-group">
          <div class="d-flex">
            <label for="state">State:</label>
            <select (change)="onInput($event)" [value]="state">
              <option value="">Select a state...</option>
              <option *ngFor="let s of states" [value]="s.code">{{ s.code }} - {{ s.name }}</option>
            </select>
            <input
              class="w-100"
              id="state"
              type="text"
              [value]="state"
              disabled
              maxlength="2"
              placeholder="CA"
            />
            <span class="state-name" *ngIf="stateName">{{ stateName }}</span>
          </div>

          <button (click)="getAlerts()" [disabled]="!state || loading">
            {{ loading ? 'Loading...' : 'Search' }}
          </button>
        </div>
      </div>

      <div class="translation-bar" *ngIf="rawResult && !quotaExceeded">
        <label>Translate to:</label>
        <select [(ngModel)]="targetLang" (change)="onLanguageChange()">
          <option value="en">English</option>
          <option value="es">Spanish</option>
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

      <!-- Visual Alert Display -->
      <app-alert-detail
        *ngIf="!showRaw && parsedAlerts && parsedAlerts.length"
        [alertText]="translatedRaw || rawResult || ''"
        [loading]="false">
      </app-alert-detail>

      <!-- Raw Text Display -->
      <div class="raw-result" *ngIf="showRaw && rawResult">
        <pre>{{ translatedRaw || rawResult }}</pre>
      </div>

      <!-- No Results -->
      <div class="no-results" *ngIf="!loading && rawResult && (!parsedAlerts || parsedAlerts.length === 0) && showRaw">
        <pre>{{ rawResult }}</pre>
      </div>

      <!-- No Alerts Found -->
      <div class="no-alerts" *ngIf="!loading && rawResult && (!parsedAlerts || parsedAlerts.length === 0) && !showRaw">
        <div class="no-alerts-content">
          <div class="no-alerts-icon">✓</div>
          <h3>No Active Weather Alerts</h3>
          <p>There are currently no weather warnings for {{ stateName || state.toUpperCase() }}.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alerts-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-bar {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 20px;
    }

    .form-group {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .d-flex {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 75%;
    }

    .state-name {
      color: #60a5fa;
      font-weight: 600;
      font-size: 1rem;
      min-width: 120px;
    }

    label {
      color: #94a3b8;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    input {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #fff;
      flex: 2;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #60a5fa;
    }

    select {
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0f172a;
      color: #fff;
      font-size: 1rem;
      min-width: 200px;
      cursor: pointer;
    }

    select:focus {
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
      margin-right: 8px;
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

    .view-toggle {
      padding: 8px 16px;
      background: #475569;
      color: #fff;
      margin-left: auto;
    }

    .view-toggle:hover {
      background: #64748b;
    }

    .raw-result {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 24px;
    }

    .raw-result pre {
      color: #e2e8f0;
      white-space: pre-wrap;
      font-family: inherit;
      line-height: 1.6;
    }

    .no-results {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 24px;
      color: #94a3b8;
      text-align: center;
    }

    .no-alerts {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
    }

    .no-alerts-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .no-alerts-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-alerts h3 {
      color: #22c55e;
      font-size: 1.25rem;
      margin: 0;
    }

    .no-alerts p {
      color: #94a3b8;
      margin: 0;
    }
  `]
})
export class AlertsComponent {
  state = '';
  rawResult = '';
  translatedRaw = '';
  loading = false;
  translating = false;
  targetLang = 'es';
  showRaw = false;
  parsedAlerts: ParsedAlert[] = [];
  states: { code: string; name: string }[] = [];
  quotaExceeded = false;
  quotaMessage = '';

  private readonly STATE_NAMES: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia'
  };

  constructor(
    private mcpService: McpService,
    private translationService: TranslationService,
    private alertParser: AlertParserService
  ) {
    this.states = Object.entries(this.STATE_NAMES).map(([code, name]) => ({ code, name }));
  }

  getAlerts() {
    if (!this.state) return;
    this.loading = true;
    this.rawResult = '';
    this.translatedRaw = '';
    this.parsedAlerts = [];
    this.showRaw = false;
    this.quotaExceeded = false;
    this.quotaMessage = '';

    this.mcpService.getAlerts(this.state.toUpperCase()).subscribe({
      next: (data) => {
        this.rawResult = data;
        this.parsedAlerts = this.alertParser.parse(data) || [];
        this.loading = false;
      },
      error: (err) => {
        this.rawResult = 'Error: ' + err.message;
        this.loading = false;
      }
    });
  }

  onLanguageChange() {
    if (this.rawResult && this.targetLang !== 'en') {
      this.translateResult();
    } else {
      this.translatedRaw = '';
    }
  }

  translateResult() {
    if (!this.rawResult) return;
    this.translating = true;
    this.quotaExceeded = false;
    this.translationService.translateText(this.rawResult, this.targetLang).subscribe({
      next: (translated) => {
        if (translated.includes('__TRANSLATION_QUOTA_EXCEEDED__')) {
          const parts = translated.split('|');
          this.quotaExceeded = true;
          this.quotaMessage = parts[1] || 'Daily translation limit reached';
          this.translatedRaw = '';
        } else {
          this.translatedRaw = translated;
        }
        this.translating = false;
      },
      error: () => {
        this.translating = false;
      }
    });
  }

  get stateName(): string {
    const code = this.state.toUpperCase();
    return this.STATE_NAMES[code] || '';
  }

  onInput(event: Event) {
    const target = event.target as HTMLSelectElement | HTMLInputElement;
    this.state = target.value.toUpperCase();
  }
}
