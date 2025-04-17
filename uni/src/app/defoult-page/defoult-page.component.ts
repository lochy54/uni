import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { PlayComponent } from '../play/play.component';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-defoult-page',
  standalone: true,
  imports: [ LoginRegisterComponent, PlayComponent, HeaderComponent, FooterComponent,DividerModule],
  templateUrl: './defoult-page.component.html',
  styleUrl: './defoult-page.component.scss'
})
export class DefoultPageComponent {
  readonly isWideScreen = signal<boolean>(window.innerWidth > window.innerHeight+300)
  @HostListener('window:resize', [])
  onResize() {
    this.isWideScreen.set(window.innerWidth > window.innerHeight+300)
  }

}
