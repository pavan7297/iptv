import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Hls from 'hls.js';

@Component({
  selector: 'app-root',
  standalone: true,
  template: ` <router-outlet /> `,
  imports: [RouterOutlet],
})
export class App {}
