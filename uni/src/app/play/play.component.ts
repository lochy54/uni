import { Component, inject, signal } from '@angular/core';
import { ApiServiceService } from '../../service/api-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { filter, tap } from 'rxjs';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [MessageModule,
      ProgressSpinnerModule,
      InputGroupAddonModule,
      InputGroupModule,
      CardModule,
      FloatLabelModule,
      CheckboxModule,
      ButtonModule,
      PasswordModule,
      InputTextModule,
      ReactiveFormsModule],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent {

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly apiService = inject(ApiServiceService)
  private readonly errorService= inject(MessageService)

  readonly playForm : FormGroup = this.fb.nonNullable.group({
    code: ["", [Validators.required, Validators.minLength(6),Validators.maxLength(6)]],
    username: ["", [Validators.required, Validators.minLength(3),Validators.maxLength(20)]]
  })

  readonly playOpen = signal<boolean>(false)
  readonly loading = signal<boolean>(false)

    

play(){
  this.loading.set(true)
  this.apiService.isCodeActive(this.playForm.controls["code"].value).pipe(filter(()=>this.playForm.valid),tap(()=>this.loading.set(false))).subscribe({
    next : (_) => {this.router.navigate(['/game/'+this.playForm.controls["code"].value+"/"+this.playForm.controls["username"].value]);},
    error : (err)=> {
      this.loading.set(false)
      this.errorService.add(({ severity: 'error', summary: 'Error', detail: err.error}));
    },
  })

}

}

