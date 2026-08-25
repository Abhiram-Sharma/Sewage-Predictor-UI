import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CurrentReading {
  debris_depth_mm: number;
  methane_ppm: number;
  h2s_ppm: number;
  ammonia_ppm: number;
}

export interface Prediction {
  estimated_cleaning_date?: string;
  days_until_blockage?: number;
  blockage_risk_score?: number;
  prediction_available?: boolean;
}

export interface HistoryData {
  labels: string[];
  depth: number[];
  methane: number[];
  h2s: number[];
  ammonia: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SewageApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCurrent(): Observable<CurrentReading> {
    return this.http.get<any>(`${this.baseUrl}/api/current`).pipe(
      map(res => res.data)
    );
  }

  getHistory(): Observable<HistoryData> {
    return this.http.get<any>(`${this.baseUrl}/api/history`).pipe(
      map(res => res.data)
    );
  }

  getPrediction(): Observable<Prediction> {
    return this.http.get<any>(`${this.baseUrl}/api/prediction`).pipe(
      map(res => res.data)
    );
  }

  triggerReading(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/trigger_reading`, {});
  }
}
