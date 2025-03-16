import { Component, computed, effect, signal, Signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { animation } from '@angular/animations';

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
  switchLogin = signal<boolean>(false)
  constructor(private outhService: OuthServiceService,
              private fb: FormBuilder
  ){

    this.loginForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3),Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      age : [undefined, [Validators.required,Validators.min(0)]],
      cf: ['', [Validators.required, Validators.maxLength(16), Validators.minLength(16)]],
    });

  }





}
