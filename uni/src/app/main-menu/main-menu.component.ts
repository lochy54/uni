import { Component, computed, input } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { ApiServiceService } from '../../service/api-service.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
   username = computed<{
      username: string;
      token: string;
  } >(()=> this.outhService.username()!)
 constructor(private outhService : OuthServiceService,
              private apiService : ApiServiceService
 ){}
 generateCode(){
      this.apiService.generateCode(this.username().token).subscribe()
 }
}
