import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OuthServiceService } from '../../service/outh-service.service';
import { ErrorServiceService } from '../../service/error-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
constructor(private router : Router,
            private outHserveice : OuthServiceService,
            private errorService : ErrorServiceService
          
){}
return(){
  if(this.outHserveice.username()){
    this.outHserveice.logOut().subscribe(
      {
        error : (err) =>{
          this.errorService.setError(err)
        }
      })
  }else{
    this.router.navigate(['/']);
  }
}
}
