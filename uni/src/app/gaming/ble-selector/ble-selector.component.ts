import { Component, computed, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { BleServiceService } from '../../../service/ble-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SoundServiceService } from '../../../service/sound-service.service';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-ble-selector',
  standalone: true,
  imports:  [  MessageModule,
      ProgressSpinnerModule,
      InputGroupAddonModule,
      InputGroupModule,
      CardModule,
      FloatLabelModule,
      CheckboxModule,
      ButtonModule,
      PasswordModule,
      InputTextModule,
      ReactiveFormsModule ],
  templateUrl: './ble-selector.component.html',
  styleUrl: './ble-selector.component.scss'
})
export class BleSelectorComponent {
  @Output() Start : EventEmitter<boolean> = new EventEmitter<boolean>()

  private readonly bleService = inject(BleServiceService)
  private readonly fb = inject(FormBuilder)
  private readonly errorService = inject(MessageService)
  private readonly audioService = inject(SoundServiceService)

  readonly bleForm = this.fb.nonNullable.group({
    connected: [false, [Validators.requiredTrue]]
  });
  readonly loading = signal<boolean>(false)



  connect(){
    this.loading.set(true)
    this.bleService.connect().pipe(finalize(() => this.loading.set(false)) ).subscribe({
      next :()=> {
          this.bleForm.controls.connected.setValue(true)
          this.audioService.playConnSound()
      },
      error : (err) => {
        this.bleForm.controls.connected.setValue(false)
        this.errorService.add(({ severity: 'error', summary: 'Error', detail: err.message}));
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
