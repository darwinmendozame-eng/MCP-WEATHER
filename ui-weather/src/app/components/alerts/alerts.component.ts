import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { McpService } from '../../services/mcp.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2>Weather Alerts</h2>
      <div class="form-group">
        <label for="state">State (e.g., CA, NY, TX):</label>
        <input
          id="state"
          type="text"
          [(ngModel)]="state"
          maxlength="2"
          placeholder="Enter state code"
        />
        <button (click)="getAlerts()" [disabled]="!state">Get Alerts</button>
      </div>
      <div class="translation-bar" *ngIf="result">
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
      <div class="result" *ngIf="result">
        <pre>{{ translatedResult || result }}</pre>
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
    .form-group { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .translation-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background: #0f0f23;
      border-radius: 8px;
    }
    .translation-bar label { font-size: 14px; color: #888; }
    .translation-bar select {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #333;
      background: #1a1a2e;
      color: #fff;
      cursor: pointer;
    }
    .translate-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      background: #7c3aed;
      color: #fff;
      cursor: pointer;
      font-weight: 600;
    }
    .translate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    input {
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #0f0f23;
      color: #fff;
      flex: 1;
    }
    button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: #00d4ff;
      color: #000;
      cursor: pointer;
      font-weight: 600;
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
export class AlertsComponent {
  state = '';
  result = '';
  translatedResult = '';
  loading = false;
  translating = false;
  targetLang = 'es';

  constructor(
    private mcpService: McpService,
    private translationService: TranslationService
  ) {}

  getAlerts() {
    if (!this.state) return;
    this.loading = true;
    this.result = '';
    this.translatedResult = '';
    this.mcpService.getAlerts(this.state.toUpperCase()).subscribe({
      next: (data) => { this.result = data; this.loading = false; },
      error: (err) => { this.result = 'Error: ' + err.message; this.loading = false; }
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
    this.translationService.translateText(this.result, this.targetLang).subscribe({
      next: (translated) => { this.translatedResult = translated; this.translating = false; },
      error: () => { this.translating = false; }
    });
  }
}
