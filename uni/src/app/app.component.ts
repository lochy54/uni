/// <reference types="web-bluetooth" />
import { Component, computed, effect } from '@angular/core';
import { BleServiceService } from './gaming/service/ble-service.service';
import { ToasterErrorComponent } from "./toaster-error/toaster-error.component";
import { LoginComponent } from "./login/login.component";
import { OuthServiceService } from '../service/outh-service.service';
import { PlayComponent } from "./play/play.component";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet]
})
export class AppComponent {

}
