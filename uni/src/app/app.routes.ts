import { Routes } from '@angular/router';
import { GamingComponent } from './gaming/gaming.component';
import { DefoultPageComponent } from './defoult-page/defoult-page.component';

export const routes: Routes = [
    { path: 'game/:code', component: GamingComponent },
    {  path:'', component:DefoultPageComponent} 
];
