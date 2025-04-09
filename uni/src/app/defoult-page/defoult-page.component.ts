import { Component, computed, inject } from '@angular/core';
import { OuthServiceService } from '../../service/outh-service.service';
import { LoginComponent } from '../login/login.component';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { PlayComponent } from '../play/play.component';
import { ToasterErrorComponent } from '../toaster-error/toaster-error.component';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-defoult-page',
  standalone: true,
  imports: [ToasterErrorComponent, LoginComponent, PlayComponent, MainMenuComponent, HeaderComponent, FooterComponent],
  templateUrl: './defoult-page.component.html',
  styleUrl: './defoult-page.component.scss'
})
export class DefoultPageComponent {
  private outhService = inject(OuthServiceService)
  username = toSignal(this.outhService.username)
  constructor(){
    
  }
  
}
