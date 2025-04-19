import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, finalize, tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [  MessageModule,
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
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.scss'
})

export class LoginRegisterComponent {
  private readonly outhService = inject(OuthServiceService)
  private readonly fb= inject(FormBuilder)
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    accept :  [false, [Validators.requiredTrue]]
  });
  readonly loading = signal<boolean>(false)
  readonly failed = signal<string>("")
  readonly visibility = signal<boolean>(false)
  readonly switchLogin = signal<boolean>(false)


login(){
  this.loading.set(true)
  this.outhService.login({
    username: this.loginForm.controls.username.value,
    password: this.loginForm.controls.password.value,
  }).pipe(filter(()=>this.loginForm.valid)).subscribe(
    {
      next: (_) => {
        this.loading.set(false);
      },
      error: (_) => {
        this.loading.set(false);
      },
    }
  )
}


register(){
  this.loading.set(true)
  this.outhService.register({
    name: this.registerForm.controls.name.value,
    surname: this.registerForm.controls.surname.value,
    username: this.registerForm.controls.username.value,
    password: this.registerForm.controls.password.value
  }).pipe(filter(()=>this.registerForm.valid),tap(()=>this.loading.set(false))).subscribe(
    {
      next: (_) => {
        this.loading.set(false);
      },
      error: (_) => {
        this.loading.set(false);
      },
    }
  )
}

}

