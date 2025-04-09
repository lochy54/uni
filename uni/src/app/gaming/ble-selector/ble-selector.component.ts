import { Component, computed, effect, EventEmitter, Output, signal } from '@angular/core';
import { BleServiceService } from '../service/ble-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorServiceService } from '../../../service/error-service.service';
import { SoundServiceService } from '../service/sound-service.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-ble-selector',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ble-selector.component.html',
  styleUrl: './ble-selector.component.scss'
})
export class BleSelectorComponent {
  @Output() Start : EventEmitter<boolean> = new EventEmitter<boolean>()
  bleForm: FormGroup;
  loading = signal<boolean>(false)
  constructor(private bleService : BleServiceService,
              private fb : FormBuilder,
              private errorService : ErrorServiceService,
              private audioService : SoundServiceService
  ){

     this.bleForm = this.fb.nonNullable.group({
          connected: [undefined, [Validators.requiredTrue]]
        });
    }


  connect(){
    this.loading.set(true)
    this.bleService.connect().pipe(finalize(() => this.loading.set(false)) ).subscribe({
      next :()=> {
          this.bleForm.controls["connected"].setValue(true)
          this.audioService.playConnSound()
      },
      error : (err) => {
        this.bleForm.controls["connected"].setValue(false)
        this.errorService.setError(err.message)
      }
    })
  }


  start(){

      if(this.bleForm.valid){
        this.audioService.playStartSound()
        this.Start.emit(true)
      }
  
  }



}
