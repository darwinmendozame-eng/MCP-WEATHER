import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';

export interface TranslationError {
  quotaExceeded: boolean;
  nextAvailable: string;
  message: string;
}

interface CacheEntry {
  translated: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly apiUrl = 'https://api.mymemory.translated.net/get';
  private readonly chunkSize = 450;
  private readonly maxRetries = 3;
  private readonly baseDelay = 500;
  private readonly cacheExpiry = 30 * 60 * 1000; // 30 minutes

  private cache = new Map<string, CacheEntry>();

  translateText(text: string, targetLang: string): Observable<string> {
    if (!text || targetLang === 'en') {
      return from(Promise.resolve(text));
    }

    const chunks = this.splitIntoChunks(text);

    const translateChunkWithRetry = async (chunk: string): Promise<string> => {
      const cacheKey = `${targetLang}:${chunk}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.translated;
      }

      let lastError: Error | null = null;
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const params = new URLSearchParams({
            q: chunk,
            langpair: `en|${targetLang}`
          });

          const response = await fetch(`${this.apiUrl}?${params}`);
          const data = await response.json();

          // Check for quota exceeded
          if (data.responseStatus === 429 || data.quotaFinished) {
            const match = data.responseDetails?.match(/(\d+)\s*hours?\s*(\d+)\s*minutes?\s*(\d+)\s*seconds?/i);
            const nextAvailable = match
              ? `Next available in ${match[1]}h ${match[2]}m ${match[3]}s`
              : 'Daily limit reached';

            return `__TRANSLATION_QUOTA_EXCEEDED__|${nextAvailable}`;
          }

          if (data.responseStatus === 200) {
            const translated = data.responseData.translatedText;
            this.cache.set(cacheKey, { translated, timestamp: Date.now() });
            return translated;
          }
          return chunk;
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          if (attempt < this.maxRetries - 1) {
            const delay = this.baseDelay * Math.pow(2, attempt);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      return lastError ? chunk : chunk;
    };

    const translateAll = async (): Promise<string> => {
      for (const chunk of chunks) {
        const translated = await translateChunkWithRetry(chunk);
        if (translated.includes('__TRANSLATION_QUOTA_EXCEEDED__')) {
          return translated;
        }
        await new Promise(r => setTimeout(r, 150));
      }
      return chunks.map(c => c).join('\n\n');
    };

    return from(translateAll());
  }

  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = '';
    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= this.chunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If single paragraph is too big, split by sentences
        if (paragraph.length > this.chunkSize) {
          const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
          currentChunk = '';
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= this.chunkSize) {
              currentChunk += sentence;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length ? chunks : [text];
  }
}
