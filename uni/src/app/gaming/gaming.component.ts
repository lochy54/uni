import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../../service/api-service.service';
import { ErrorServiceService } from '../../service/error-service.service';
import { BleSelectorComponent } from "./ble-selector/ble-selector.component";
import { ToasterErrorComponent } from "../toaster-error/toaster-error.component";
import { BleServiceService } from '../../service/ble-service.service';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-gaming',
  standalone: true,
  imports: [BleSelectorComponent, ToasterErrorComponent, HeaderComponent, FooterComponent],
  templateUrl: './gaming.component.html',
  styleUrl: './gaming.component.scss'
})
export class GamingComponent implements OnInit {
  gameCode: string = '';
  username = signal<string|undefined>(undefined)
  pression = computed<number | undefined>(()=>this.bleService.pressureSignal())
  gaming = signal<boolean>(false)
  constructor(private route: ActivatedRoute, private apiService : ApiServiceService, private errorService:ErrorServiceService,private router : Router,
              private bleService: BleServiceService
  ) {}
  gameList = [
      {
        nome : "flappy" ,
        icon : "flappy"
      }

  ]

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.gameCode = params.get('code') || ''; 
      this.apiService.isCodeActive(this.gameCode).subscribe({
          error : (_)=> {
            this.router.navigate(['/']);
          },
      })
    });
}
}





// fare interfaccia selezione giachi

// fare interfaccia volume (componente)
// fare interfaccia pausa (componente)

