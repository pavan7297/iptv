import { Routes } from '@angular/router';
import { Iptv } from './pages/iptv';
import { Bits } from './pages/bits';
import { IframesComponent } from './pages/iframes';

export const routes: Routes = [
  { path: '', redirectTo: 'iptv', pathMatch: 'full' },

  { path: 'iptv', component: Iptv },
  { path: 'vid', component: Bits },
  { path: 'iframes', component: IframesComponent },

  { path: '**', redirectTo: 'iptv' },
];
