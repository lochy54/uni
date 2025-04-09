import { Component, computed, inject, input, signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { ApiServiceService, playerSens, sensibility } from '../../service/api-service.service';
import { ErrorServiceService } from '../../service/error-service.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexSeries,
  ApexOptions
} from 'ng-apexcharts';
@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})

interface ChartOptions  {
  series: ApexSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

export class MainMenuComponent {
  showCode = signal<string|undefined>(undefined)
  stats = signal<ChartOptions[]>([])


  private outhService = inject(OuthServiceService)
  username = toSignal(this.outhService.username!)
 constructor(
              private apiService : ApiServiceService,
              private errorService:ErrorServiceService
 ){

  apiService.getSens().subscribe({
    next : (val) =>{
 
      this.stats.set(val.map((player) => ({
        series: [
          {
            name: player.player,
            data: player.pression.map(p => ({ x: p.timestap, y: p.pression }))
          }
        ],
        chart: {
          type: 'line',
          height: 250
        },
        xaxis: {
          type: 'numeric',
          title: { text: 'Timestamp' }
        },
        title: {
          text: `${player.player}'s Pressure Over Time`
        }
      })))
    },
    error : (err) =>{
      errorService.setError(err.error)
    }
  })

 }


 generateCode(){
      this.apiService.generateCode().subscribe({
        next : (val)=>{
          this.showCode.set(val)
        },
        error : (err)=>{
          this.errorService.setError(err.error)
        }
      })
 }
}
