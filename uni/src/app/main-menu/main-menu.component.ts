import { Component, computed, inject, input, signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { ApiServiceService, sensibility } from '../../service/api-service.service';
import { MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { Toast } from 'primeng/toast';



@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [FooterComponent, HeaderComponent,Toast],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})


export class MainMenuComponent {
  showCode = signal<string|undefined>(undefined)
  playerlist = signal<string[]>([])
  loading = signal<boolean>(false)
  errorService = inject(MessageService)
  private outhService = inject(OuthServiceService)
  username = toSignal(this.outhService.username!)
 constructor(
              private apiService : ApiServiceService,
 ){
 }


 generateCode(){
      this.apiService.generateCode().subscribe({
        next : (val)=>{
          this.showCode.set(val)
        },
        error : (err)=>{
          this.errorService.add(({ severity: 'error', summary: 'Error', detail: err.error}));

        }
      })
 }



}
