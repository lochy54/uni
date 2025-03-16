import { Component, computed } from '@angular/core';
import { ErrorServiceService } from '../../service/error-service.service';

@Component({
  selector: 'app-toaster-error',
  standalone: true,
  imports: [],
  templateUrl: './toaster-error.component.html',
  styleUrl: './toaster-error.component.scss'
})
export class ToasterErrorComponent {
  errorList = computed<string[]>(()=>{
    return this.errorService.errorS
  })
  constructor(private errorService : ErrorServiceService){}
}
