import { Component, computed, effect, signal, Signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { animation } from '@angular/animations';
import { login, user } from '../../service/api-service.service';
import { finalize } from 'rxjs';
import { ErrorServiceService } from '../../service/error-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [  
    ReactiveFormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = signal<boolean>(false)
  failed = signal<string>("")
  switchLogin = signal<boolean>(false)
  constructor(private outhService: OuthServiceService,
              private fb: FormBuilder,
              private errorService: ErrorServiceService
  ){

    this.loginForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      accept :  [false, [Validators.requiredTrue]]
    });

  }

login(){
  if(this.loginForm.valid){
    this.loading.set(true)
    let l : login = {
      username: this.loginForm.controls["username"].value,
      password: this.loginForm.controls["password"].value,
    }
    this.outhService.login(l).pipe(finalize(() => this.loading.set(false)) ).subscribe(
      {
        error : (err) =>{
          this.errorService.setError(err)
        }
      }
    )
  }
}
register(){
  if(this.registerForm.valid){
    this.loading.set(true)
    let u : user = {
      name: this.registerForm.controls["name"].value,
      surname: this.registerForm.controls["surname"].value,
      username: this.registerForm.controls["username"].value,
      password: this.registerForm.controls["password"].value
    }
    this.outhService.register(u).pipe(finalize(() => this.loading.set(false)) ).subscribe({
      error: (err) => {
          this.errorService.setError(err)
      },
    })
  }
}

}

