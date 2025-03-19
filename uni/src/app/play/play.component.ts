import { Component, signal } from '@angular/core';
import { ApiServiceService } from '../../service/api-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent {
  playForm : FormGroup;
  playOpen = signal<boolean>(false)
  loading = signal<boolean>(false)
  constructor(
              private fb: FormBuilder,
              private router : Router
  ){
    this.playForm = this.fb.nonNullable.group({
      code: ["", [Validators.required, Validators.minLength(6),Validators.maxLength(6)]],
    });

    
}

play(){
    if(this.playForm.valid){
      this.router.navigate(['/game/'+this.playForm.controls["code"].value]);
    }
}

}
