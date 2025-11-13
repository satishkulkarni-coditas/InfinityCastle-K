import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/components/header/header.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <app-header></app-header>
    <app-sidebar *ngIf="authService.isAuthenticated()">
      <main>
        <router-outlet></router-outlet>
      </main>
    </app-sidebar>
    <main *ngIf="!authService.isAuthenticated()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    main {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'TDH Application';
  
  constructor(public authService: AuthService) {}
}

