import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private apiUrl = 'https://api.mymemory.translated.net/get';

  translate(text: string, fromLang: string = 'en', toLang: string = 'es'): Observable<string> {
    if (!text || toLang === fromLang) {
      return of(text);
    }

    const params = new URLSearchParams({
      q: text.substring(0, 500), // MyMemory limit
      langpair: `${fromLang}|${toLang}`
    });

    return from(
      fetch(`${this.apiUrl}?${params}`)
        .then(res => res.json())
        .then(data => {
          if (data.responseStatus === 200) {
            return data.responseData.translatedText;
          }
          return text;
        })
        .catch(() => text)
    );
  }

  translateText(text: string, targetLang: string): Observable<string> {
    return this.translate(text, 'en', targetLang);
  }
}
