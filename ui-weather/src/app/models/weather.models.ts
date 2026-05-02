export interface Alert {
  event: string;
  area: string;
  severity: string;
  description: string;
  instructions: string;
}

export interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  detailedForecast: string;
}

export interface MpcToolResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content: { type: string; text: string }[];
  };
  error?: {
    code: number;
    message: string;
  };
}
