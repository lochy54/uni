import { Component, computed, inject, signal } from '@angular/core';
import { ErrorServiceService } from '../../service/error-service.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-toaster-error',
  standalone: true,
  imports: [],
  templateUrl: './toaster-error.component.html',
  styleUrl: './toaster-error.component.scss'
})
export class ToasterErrorComponent {
  private errorService = inject(ErrorServiceService)
  errorList = toSignal(this.errorService.errorS)
  constructor(){
  }
}
