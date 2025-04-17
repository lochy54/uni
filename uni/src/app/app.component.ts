/// <reference types="web-bluetooth" />
import { Component, computed, effect } from '@angular/core';
import { BleServiceService } from '../service/ble-service.service';
import { LoginRegisterComponent } from "./login-register/login-register.component";
import { OuthServiceService } from '../service/outh-service.service';
import { PlayComponent } from "./play/play.component";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet,Toast]
})
export class AppComponent {

}
