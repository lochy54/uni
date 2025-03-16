/// <reference types="web-bluetooth" />
import { Component, computed, effect } from '@angular/core';
import { BleServiceService } from '../service/ble-service.service';
import { ToasterErrorComponent } from "./toaster-error/toaster-error.component";
import { LoginComponent } from "./login/login.component";
import { OuthServiceService } from '../service/outh-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ToasterErrorComponent, LoginComponent]
})
export class AppComponent {
  username = computed<string|undefined>(()=> this.outhService.username)
  constructor(private outhService : OuthServiceService){
  }
  
}
