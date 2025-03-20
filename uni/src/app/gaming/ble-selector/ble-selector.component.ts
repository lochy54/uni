import { Component, computed, effect, EventEmitter, Output } from '@angular/core';
import { BleServiceService } from '../../../service/ble-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorServiceService } from '../../../service/error-service.service';

@Component({
  selector: 'app-ble-selector',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ble-selector.component.html',
  styleUrl: './ble-selector.component.scss'
})
export class BleSelectorComponent {
  @Output() Username : EventEmitter<string> = new EventEmitter<string>()
  bleForm: FormGroup;
  
  constructor(private bleService : BleServiceService,
              private fb : FormBuilder,
              private errorService : ErrorServiceService
  ){

     this.bleForm = this.fb.nonNullable.group({
          username: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]],
          connected: [undefined, [Validators.requiredTrue]]
        });
    }


  connect(){
    this.bleService.connect().subscribe({
      next :()=> {
          this.bleForm.controls["connected"].setValue(true)
      },
      error : (err) => {
        this.bleForm.controls["connected"].setValue(false)
        this.errorService.setError(err)
      }
    })
  }


  start(){

      if(this.bleForm.valid){
        this.Username.emit(this.bleForm.controls["username"].value)
      }
  
  }



}
