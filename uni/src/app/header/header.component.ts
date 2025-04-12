import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OuthServiceService } from '../../service/outh-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly router = inject(Router)
  private readonly outHserveice = inject(OuthServiceService)
return(){
  if(this.outHserveice.username){
    this.outHserveice.logOut()
    this.router.navigate(['']);
  }
}
}
