import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from '../../service/api-service.service';
import { ErrorServiceService } from '../../service/error-service.service';
import { BleSelectorComponent } from "./ble-selector/ble-selector.component";
import { ToasterErrorComponent } from "../toaster-error/toaster-error.component";

@Component({
  selector: 'app-gaming',
  standalone: true,
  imports: [BleSelectorComponent, ToasterErrorComponent],
  templateUrl: './gaming.component.html',
  styleUrl: './gaming.component.scss'
})
export class GamingComponent implements OnInit {
  gameCode: string = '';

  constructor(private route: ActivatedRoute, private apiService : ApiServiceService, private errorService:ErrorServiceService,private router : Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.gameCode = params.get('code') || ''; 
      this.apiService.isCodeActive(this.gameCode).subscribe({
          error : (err)=> {
            this.errorService.setError(err.error);
            this.router.navigate(['/']);
          },
      })
    });
}
}
