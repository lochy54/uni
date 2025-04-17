import { Component, computed, inject, input, signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import {
  ApiServiceService,
  game,
  playerStats,
} from '../../service/api-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { map } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { Title } from '@angular/platform-browser';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

Chart.register(
  zoomPlugin,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, TableModule, ChartModule ,  FloatLabelModule,
    InputTextModule,InputGroupAddonModule,
        InputGroupModule, CardModule, ProgressSpinner, ButtonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
})
export class MainMenuComponent {
  private readonly outhService = inject(OuthServiceService);
  private readonly apiService = inject(ApiServiceService);

  readonly code = signal<string | undefined>(undefined);
  readonly username = toSignal(this.outhService.username!);
  readonly loadingPlayer = signal<boolean>(false);
  readonly loadingGame = signal<boolean>(false);
  readonly loadingStat = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly player = signal<
    { status: boolean; name: string; position: number }[]
  >([]);
  readonly countPlayer = signal<number>(0);
  readonly games = signal<{ data: any; options: any }[]>([]);
  readonly countGames = signal<number>(0);
  readonly stat = signal<{
      maxPressure: number,
      maxPressureDuration: number,
      data: any,
      options: any,
      totalGames: number,
    }|undefined>(undefined);

  constructor() {}

  generateCode() {
    this.loading.set(true)
    this.code.set(undefined)
    this.apiService.generateCode().subscribe({
      next: (val) => {
        this.code.set(val);
        this.loading.set(false)
      },
      error: (_) => {
        this.loading.set(false)

      },
    });
  }

filter(value: EventTarget | null){
  return (value as HTMLInputElement).value
}

  loadPlayers(event: TableLazyLoadEvent): void {
    this.loadingPlayer.set(true);
    const startIndex = event.first || 0;
    const limit = event.rows || 10;
    const globalFilter = event.globalFilter || undefined;
    
    this.apiService
      .getPlayerNames(limit, startIndex, globalFilter)
      .pipe(
        map((res) => {
          if(!res.res)
            return  { res: [], count: 0} 
          const ret: { status: boolean; name: string; position: number }[] = [];
          res.res.forEach((val, n) => {
            ret.push({ name: val, status: false, position: n });
          });
          return { res: ret, count: res.count };
        })
      )
      .subscribe({
        next: (val) => {
          this.player.set(val.res);
          this.countPlayer.set(val.count);
          this.loadingPlayer.set(false);
        },
        error: (_) => {
          this.loadingPlayer.set(false);
        },
      });
  }

  loadGame(event: TableLazyLoadEvent, player: string): void {
    this.loadingGame.set(true);
    const startIndex = event.first || 0;
    const limit = event.rows || 10;
    this.apiService
      .getPlayerGamesByName(limit, startIndex, player)
      .pipe(
        map((val) => {
          const res: { data: any; options: any }[] = [];
          val.res.forEach((element, n) => {
            const data = {
              labels: element.map((game) => game.timestap / 1000),
              datasets: [
                {
                  label: 'Pressure (kg)',
                  data: element.map((game) => game.pression),
                  fill: true,
                  borderColor: '#8a2be2',
                  tension: 0.1,
                },
              ],
            };
            const options = {
              animation: {
                duration: 1000,
                easing: 'easeOutQuart',
              },
              plugins: {
                title: {
                  display: true,
                  text: 'Game ' + (n + startIndex),
                },
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x',
                  },
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: 'x',
                  },
                },
              },
              scales: {
                x: {
                  type: 'category',
                  title: {
                    display: true,
                    text: 'Time (s)',
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Pressure (kg)',
                  },
                },
              },
            };
            res.push({ data: data, options: options });
          });
          return { res: res, count: val.count };
        })
      )
      .subscribe({
        next: (val) => {
          this.games.set(val.res);
          this.countGames.set(val.count);
          this.loadingGame.set(false);
        },
        error: (_) => {
          this.loadingGame.set(false);
        },
      });
  }

  open(pos: number) {
    this.player.update((val) => {
      val[pos].status = !val[pos].status;
      return val;
    });
  }

  loadStat(player: string) {
    this.loadingStat.set(true);
    this.apiService
      .getPlayerStats(player)
      .pipe(
        map((element) => {
        
          const chartData = {
            labels: element.maxPressureLast.map((_, n) => 'Game: ' + n),
            datasets: [
              {
                label: 'Pressure',
                fill: true,
                backgroundColor:["rgba(138, 43, 226,0.2)"],
                borderColor: '#8a2be2',
                borderWidth: 3,
                tension: 0.1,
                data: element.maxPressureLast,
              },
            ],
          };

          const chartOptions = {
              animation: {
                duration: 1000,
                easing: 'easeOutQuart',
              },
              plugins: {
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x',
                  },
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: 'x',
                  },
                },
              },
              scales: {
                x: {
                  type: 'category',
                  title: {
                    display: true,
                    text: 'Last 100 games',
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Pressure (kg)',
                  },
                },
              },
            }
          return {
            maxPressure : element.maxPressure,
            maxPressureDuration : element.maxPressureDuration,
            totalGames : element.totalGames,
            data : chartData , 
            options : chartOptions
          };
        })
      )
      .subscribe({
        next: (val) => {
          this.stat.set(val);
          this.loadingStat.set(false);
        },
        error: (_) => {
          this.loadingStat.set(false);
        },
      });
  }

  getDate(){
    return new Date(Date.now() + 3600000).toLocaleString()
  }
}
