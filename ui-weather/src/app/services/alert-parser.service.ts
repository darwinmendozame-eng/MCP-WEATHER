import { Injectable } from '@angular/core';

export interface ParsedAlert {
  event: string;
  area: string;
  areas: string[];
  severity: string;
  what: string;
  where: string;
  when: string;
  impacts: string;
  instructions: string;
  additionalDetails?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertParserService {

  parse(text: string): ParsedAlert[] | null {
    if (!text || text.includes('Unable to fetch') || text.includes('No active alerts')) {
      return null;
    }

    // Split by --- to handle multiple alerts
    const alertTexts = text.split(/\n---\n/).filter(a => a.trim());

    const alerts: ParsedAlert[] = [];

    for (const alertText of alertTexts) {
      const parsed = this.parseSingleAlert(alertText.trim());
      if (parsed) {
        alerts.push(parsed);
      }
    }

    return alerts.length > 0 ? alerts : null;
  }

  private parseSingleAlert(text: string): ParsedAlert | null {
    if (!text) return null;

    const eventMatch = text.match(/Event:\s*(.+?)(?=\s*Area:|$)/is);
    const areaMatch = text.match(/Area:\s*(.+?)(?=\s*Severity:|$)/is);
    const severityMatch = text.match(/Severity:\s*(.+?)(?=\s*Description:|$)/is);
    const descriptionMatch = text.match(/Description:\s*([\s\S]+?)(?=\s*Instructions:|$)/is);
    const instructionsMatch = text.match(/Instructions:\s*([\s\S]+?)$/is);

    // Extract WHAT, WHERE, WHEN, IMPACTS from description
    const whatMatch = descriptionMatch ? descriptionMatch[1].match(/\* WHAT[.,]+([\s\S]+?)(?=\* WHERE|$)/is) : null;
    const whereMatch = descriptionMatch ? descriptionMatch[1].match(/\* WHERE[.,]+([\s\S]+?)(?=\* WHEN|$)/is) : null;
    const whenMatch = descriptionMatch ? descriptionMatch[1].match(/\* WHEN[.,]+([\s\S]+?)(?=\* IMPACTS|$)/is) : null;
    const impactsMatch = descriptionMatch ? descriptionMatch[1].match(/\* IMPACTS[.,]+([\s\S]+?)(?=\* (?:ADDITIONAL DETAILS|Instructions)|$)/is) : null;
    const additionalMatch = descriptionMatch ? descriptionMatch[1].match(/\* ADDITIONAL DETAILS[.,]+([\s\S]+?)$/is) : null;

    const areas = areaMatch
      ? areaMatch[1].split(/[;,]/).map(a => a.trim()).filter(a => a && a.length > 2)
      : [];

    const cleanText = (t: string) => t.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      event: eventMatch ? eventMatch[1].trim() : 'Unknown Alert',
      area: areaMatch ? areaMatch[1].trim() : '',
      areas,
      severity: severityMatch ? severityMatch[1].trim() : 'Unknown',
      what: whatMatch ? cleanText(whatMatch[1]) : '',
      where: whereMatch ? cleanText(whereMatch[1]) : '',
      when: whenMatch ? cleanText(whenMatch[1]) : '',
      impacts: impactsMatch ? cleanText(impactsMatch[1]) : '',
      instructions: instructionsMatch ? cleanText(instructionsMatch[1]) : '',
      additionalDetails: additionalMatch ? cleanText(additionalMatch[1]) : undefined
    };
  }
}
