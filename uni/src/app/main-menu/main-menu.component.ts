import { Component, computed, input, signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { ApiServiceService } from '../../service/api-service.service';
import { ErrorServiceService } from '../../service/error-service.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  showCode = signal<string|undefined>(undefined)
   username = computed<{
      username: string;
      token: string;
  } >(()=> this.outhService.username()!)
 constructor(private outhService : OuthServiceService,
              private apiService : ApiServiceService,
              private errorService:ErrorServiceService
 ){}


 generateCode(){
      this.apiService.generateCode(this.username().token).subscribe({
        next : (val)=>{
          this.showCode.set(val)
        },
        error : (err)=>{
          this.errorService.setError(err.message)
        }
      })
 }
}
