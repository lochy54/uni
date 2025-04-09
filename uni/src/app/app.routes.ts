import { Routes } from '@angular/router';
import { GamingComponent } from './gaming/gaming.component';
import { DefoultPageComponent } from './defoult-page/defoult-page.component';
import { PlayerServiceService } from './gaming/service/player-service.service';
import { OuthServiceService } from '../service/outh-service.service';

export const routes: Routes = [
    { path: 'game/:code/:username', component: GamingComponent , canActivate : [PlayerServiceService]},
    {  path:'', component:DefoultPageComponent, canActivate : [OuthServiceService]} 
];

