import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { SewageApiService, CurrentReading, Prediction, HistoryData } from '../services/sewage-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentReading: CurrentReading | null = null;
  prediction: Prediction | null = null;
  
  debrisChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  gasChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  
  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    }
  };

  constructor(private apiService: SewageApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      current: this.apiService.getCurrent(),
      prediction: this.apiService.getPrediction(),
      history: this.apiService.getHistory()
    }).subscribe(({ current, prediction, history }) => {
      this.currentReading = current;
      this.prediction = prediction;
      this.updateCharts(history);
    });
  }

  triggerReading() {
    this.apiService.triggerReading().subscribe(() => {
      this.loadData(); // Refresh data after trigger
    });
  }

  private updateCharts(history: HistoryData) {
    const labels = history.labels.map(l => new Date(l).toLocaleTimeString());
    
    // Chart A: Debris
    this.debrisChartData = {
      labels,
      datasets: [
        {
          data: history.depth,
          label: 'Debris Depth (mm)',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Chart B: Gas
    this.gasChartData = {
      labels,
      datasets: [
        { data: history.methane, label: 'CH4 (ppm)', borderColor: '#ef4444', tension: 0.4 },
        { data: history.h2s, label: 'H2S (ppm)', borderColor: '#f59e0b', tension: 0.4 },
        { data: history.ammonia, label: 'NH3 (ppm)', borderColor: '#10b981', tension: 0.4 }
      ]
    };
  }
}
