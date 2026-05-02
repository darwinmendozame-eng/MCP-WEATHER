import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParsedAlert } from '../../services/alert-parser.service';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-container">
      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Consultando datos meteorológicos...</p>
      </div>

      <!-- Alerts Carousel -->
      <div class="carousel-container" *ngIf="!loading && alerts && alerts.length > 1">
        <div class="carousel">
          <button class="nav-btn prev" (click)="prevAlert()" [disabled]="currentIndex === 0">❮</button>
          <div class="carousel-track">
            <div class="carousel-indicator">
              <span *ngFor="let alert of alerts; let i = index"
                    class="dot"
                    [class.active]="i === currentIndex"
                    (click)="goToAlert(i)">
              </span>
            </div>
            <span class="counter">{{ currentIndex + 1 }} / {{ alerts.length }}</span>
          </div>
          <button class="nav-btn next" (click)="nextAlert()" [disabled]="currentIndex === alerts.length - 1">❯</button>
        </div>
      </div>

      <!-- Single Alert Card (no carousel needed) -->
      <div class="alert-card" *ngIf="!loading && alerts && alerts.length === 1">
        <div class="severity-badge" [ngClass]="getSeverityClass(alerts[0].severity)">
          <span class="pulse"></span>
          Severidad: {{ alerts[0].severity }}
        </div>

        <div class="event-title">
          <div class="event-icon">{{ getEventIcon(alerts[0].event) }}</div>
          <span>{{ alerts[0].event }}</span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="label">🌡️ Details</div>
            <div class="value">{{ alerts[0].what }}</div>
          </div>

          <div class="info-item">
            <div class="label">📍 Location</div>
            <div class="value">{{ alerts[0].where }}</div>
          </div>

          <div class="info-item">
            <div class="label">⏰ Schedule</div>
            <div class="value">{{ alerts[0].when }}</div>
          </div>

          <div class="info-item" *ngIf="alerts[0].impacts">
            <div class="label">⚠️ Impact</div>
            <div class="value">{{ alerts[0].impacts | slice:0:120 }}{{ alerts[0].impacts.length > 120 ? '...' : '' }}</div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div class="timeline-title">📋 Event Details</div>

          <div class="timeline-item" *ngIf="alerts[0].what">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>What?</h4>
              <p>{{ alerts[0].what }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[0].where">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>Where?</h4>
              <p>{{ alerts[0].where }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[0].when">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>When?</h4>
              <p>{{ alerts[0].when }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[0].impacts">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>Impacts</h4>
              <p>{{ alerts[0].impacts }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[0].additionalDetails">
            <div class="timeline-dot additional"></div>
            <div class="timeline-content">
              <h4>Additional Details</h4>
              <p>{{ alerts[0].additionalDetails }}</p>
            </div>
          </div>
        </div>

        <!-- Áreas Afectadas -->
        <div class="areas-section" *ngIf="alerts[0].areas && alerts[0].areas.length">
          <div class="areas-title">🗺️ Affected Areas</div>
          <div class="areas-tags">
            <span class="area-tag" *ngFor="let area of alerts[0].areas">{{ area }}</span>
          </div>
        </div>

        <!-- Instrucciones -->
        <div class="instructions" *ngIf="alerts[0].instructions">
          <h3>🛡️ Cautionary Instructions</h3>
          <p>{{ alerts[0].instructions }}</p>
        </div>
      </div>

      <!-- Alert Card with Navigation (when multiple alerts) -->
      <div class="alert-card" *ngIf="!loading && alerts && alerts.length > 1">
        <div class="severity-badge" [ngClass]="getSeverityClass(alerts[currentIndex].severity)">
          <span class="pulse"></span>
          Severidad: {{ alerts[currentIndex].severity }}
        </div>

        <div class="event-title">
          <div class="event-icon">{{ getEventIcon(alerts[currentIndex].event) }}</div>
          <span>{{ alerts[currentIndex].event }}</span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="label">🌡️ Details</div>
            <div class="value">{{ alerts[currentIndex].what }}</div>
          </div>

          <div class="info-item">
            <div class="label">📍 Location</div>
            <div class="value">{{ alerts[currentIndex].where }}</div>
          </div>

          <div class="info-item">
            <div class="label">⏰ Schedule</div>
            <div class="value">{{ alerts[currentIndex].when }}</div>
          </div>

          <div class="info-item" *ngIf="alerts[currentIndex].impacts">
            <div class="label">⚠️ Impact</div>
            <div class="value">{{ alerts[currentIndex].impacts | slice:0:120 }}{{ alerts[currentIndex].impacts.length > 120 ? '...' : '' }}</div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div class="timeline-title">📋 Event Details</div>

          <div class="timeline-item" *ngIf="alerts[currentIndex].what">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>What?</h4>
              <p>{{ alerts[currentIndex].what }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[currentIndex].where">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>Where?</h4>
              <p>{{ alerts[currentIndex].where }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[currentIndex].when">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>When?</h4>
              <p>{{ alerts[currentIndex].when }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[currentIndex].impacts">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>Impacts</h4>
              <p>{{ alerts[currentIndex].impacts }}</p>
            </div>
          </div>

          <div class="timeline-item" *ngIf="alerts[currentIndex].additionalDetails">
            <div class="timeline-dot additional"></div>
            <div class="timeline-content">
              <h4>Additional Details</h4>
              <p>{{ alerts[currentIndex].additionalDetails }}</p>
            </div>
          </div>
        </div>

        <!-- Áreas Afectadas -->
        <div class="areas-section" *ngIf="alerts[currentIndex].areas && alerts[currentIndex].areas.length">
          <div class="areas-title">🗺️ Affected Areas</div>
          <div class="areas-tags">
            <span class="area-tag" *ngFor="let area of alerts[currentIndex].areas">{{ area }}</span>
          </div>
        </div>

        <!-- Instrucciones -->
        <div class="instructions" *ngIf="alerts[currentIndex].instructions">
          <h3>🛡️ Cautionary Instructions</h3>
          <p>{{ alerts[currentIndex].instructions }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer" *ngIf="alerts && alerts.length">
        <div class="update-time">
          🕐 Última actualización: {{ lastUpdate | date:'medium' }}
        </div>
      </div>
    </div>

    <!-- Partículas de hielo -->
    <div class="particles" *ngIf="!loading && alerts && alerts.length">
      <div class="particle" *ngFor="let p of particles"
           [style.left]="p.x + '%'"
           [style.animationDuration]="p.duration + 's'"
           [style.animationDelay]="p.delay + 's'"
           [style.opacity]="p.opacity"
           [style.fontSize]="p.size + 'px'">
        {{ p.symbol }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      min-height: 100vh;
    }

    .alerts-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      position: relative;
      z-index: 10;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 40px;
      animation: fadeInDown 1s ease-out;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header .subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(96, 165, 250, 0.3);
      border-top-color: #60a5fa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Alerts List */
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    /* Alert Card */
    .alert-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 1s ease-out;
      position: relative;
      overflow: hidden;
    }

    .alert-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa);
    }

    /* Severity Badge */
    .severity-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid;
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .severity-badge .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .severity-badge.minor {
      color: #60a5fa;
      border-color: rgba(96, 165, 250, 0.3);
      background: rgba(96, 165, 250, 0.15);
    }
    .severity-badge.minor .pulse { background: #60a5fa; }

    .severity-badge.moderate {
      color: #fbbf24;
      border-color: rgba(251, 191, 36, 0.3);
      background: rgba(251, 191, 36, 0.15);
    }
    .severity-badge.moderate .pulse { background: #fbbf24; }

    .severity-badge.severe, .severity-badge.extreme {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.15);
    }
    .severity-badge.severe .pulse, .severity-badge.extreme .pulse { background: #ef4444; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Event Title */
    .event-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 20px;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .event-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .info-item {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 20px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .info-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(96, 165, 250, 0.3);
    }

    .info-item .label {
      font-size: 0.85rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-item .value {
      font-size: 1.1rem;
      color: #f1f5f9;
      line-height: 1.5;
      font-weight: 500;
    }

    /* Timeline */
    .timeline {
      margin-top: 30px;
      padding: 20px;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .timeline-title {
      font-size: 1.2rem;
      margin-bottom: 20px;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .timeline-item {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      position: relative;
      padding-left: 30px;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 8px;
      bottom: -20px;
      width: 2px;
      background: linear-gradient(to bottom, #60a5fa, transparent);
    }

    .timeline-item:last-child::before {
      display: none;
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 6px;
      width: 18px;
      height: 18px;
      background: #0f172a;
      border: 3px solid #60a5fa;
      border-radius: 50%;
      z-index: 2;
    }

    .timeline-dot.additional {
      border-color: #a78bfa;
    }

    .timeline-content h4 {
      color: #60a5fa;
      margin-bottom: 5px;
      font-size: 1rem;
    }

    .timeline-content p {
      color: #cbd5e1;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    /* Areas */
    .areas-section {
      margin-top: 30px;
    }

    .areas-title {
      font-size: 1.2rem;
      margin-bottom: 15px;
      color: #e2e8f0;
    }

    .areas-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .area-tag {
      background: rgba(96, 165, 250, 0.1);
      border: 1px solid rgba(96, 165, 250, 0.2);
      color: #93c5fd;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .area-tag:hover {
      background: rgba(96, 165, 250, 0.2);
      transform: scale(1.05);
    }

    /* Instructions */
    .instructions {
      margin-top: 30px;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1));
      border: 1px solid rgba(96, 165, 250, 0.2);
      border-radius: 16px;
      padding: 25px;
      position: relative;
      overflow: hidden;
    }

    .instructions::before {
      content: '⚠️';
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 3rem;
      opacity: 0.1;
    }

    .instructions h3 {
      color: #fbbf24;
      margin-bottom: 10px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .instructions p {
      color: #e2e8f0;
      line-height: 1.6;
      font-size: 1rem;
    }

    /* Carousel */
    .carousel-container {
      margin-bottom: 20px;
    }

    .carousel {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 15px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    .nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid rgba(96, 165, 250, 0.3);
      background: rgba(30, 41, 59, 0.8);
      color: #60a5fa;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.2);
      border-color: #60a5fa;
      transform: scale(1.1);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carousel-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .carousel-indicator {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(148, 163, 184, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dot:hover {
      background: rgba(96, 165, 250, 0.5);
    }

    .dot.active {
      background: #60a5fa;
      transform: scale(1.3);
    }

    .counter {
      font-size: 0.9rem;
      color: #94a3b8;
      font-weight: 500;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #64748b;
      font-size: 0.9rem;
    }

    .update-time {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.5);
      padding: 10px 20px;
      border-radius: 50px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }

    /* Particles */
    .particles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      top: -20px;
      color: rgba(255, 255, 255, 0.6);
      animation: fall linear infinite;
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header h1 {
        font-size: 1.8rem;
      }

      .event-title {
        font-size: 1.5rem;
        flex-direction: column;
        text-align: center;
      }

      .alert-card {
        padding: 25px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AlertDetailComponent implements OnChanges {
  @Input() alertText: string = '';
  @Input() loading: boolean = false;

  alerts: ParsedAlert[] = [];
  currentIndex: number = 0;
  lastUpdate: Date = new Date();
  particles: { x: number; duration: number; delay: number; opacity: number; size: number; symbol: string }[] = [];

  private readonly symbols = ['❄', '❅', '❆', '•', '·'];

  ngOnChanges() {
    if (this.alertText) {
      // Import dynamically to avoid circular dependency
      import('../../services/alert-parser.service').then(({ AlertParserService }) => {
        const parser = new AlertParserService();
        this.alerts = parser.parse(this.alertText) || [];
        this.currentIndex = 0;
        this.lastUpdate = new Date();
        this.generateParticles();
      });
    }
  }

  nextAlert() {
    if (this.currentIndex < this.alerts.length - 1) {
      this.currentIndex++;
    }
  }

  prevAlert() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goToAlert(index: number) {
    this.currentIndex = index;
  }

  getSeverityClass(severity: string): string {
    const sev = severity.toLowerCase();
    if (sev.includes('minor')) return 'minor';
    if (sev.includes('moderate')) return 'moderate';
    if (sev.includes('severe') || sev.includes('extreme')) return 'severe';
    return 'minor';
  }

  getEventIcon(event: string): string {
    const e = event.toLowerCase();
    if (e.includes('beach') || e.includes('wave') || e.includes('surf')) return '🌊';
    if (e.includes('air') || e.includes('ozone') || e.includes('quality')) return '💨';
    if (e.includes('frost') || e.includes('freeze') || e.includes('cold')) return '❄️';
    if (e.includes('heat') || e.includes('hot')) return '🔥';
    if (e.includes('wind') || e.includes('gale')) return '💨';
    if (e.includes('flood') || e.includes('rain')) return '🌧️';
    if (e.includes('snow') || e.includes('blizzard')) return '🌨️';
    if (e.includes('thunder') || e.includes('storm')) return '⛈️';
    if (e.includes('tornado')) return '🌪️';
    if (e.includes('fire') || e.includes('wildfire')) return '🔥';
    return '⚠️';
  }

  private generateParticles() {
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 10 + 10,
        symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)]
      });
    }
  }
}
