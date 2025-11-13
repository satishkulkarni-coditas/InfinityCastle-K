import { Component, OnInit } from '@angular/core';
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
      min-height: 100vh;
    }
    
    :host-context(body.in-iframe) {
      height: 100%;
      min-height: 100%;
    }
    
    main {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Compliance Application';
  
  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {
    // Check if running in iframe
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      console.log('Compliance app running in iframe');
      // Add iframe-specific styling
      document.body.classList.add('in-iframe');
    }
    
    // Check for SSO token in URL fragment (from Platform Portal)
    this.handleSSOToken();
  }
  
  private handleSSOToken(): void {
    // Extract token from URL fragment: #access_token=...&token_type=Bearer&expires_in=300
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        console.log('SSO token detected, exchanging for Compliance token...');
        // Don't clear hash immediately in iframe - let it process first
        // Clear the hash from URL after a short delay
        setTimeout(() => {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }, 100);
        
        // Exchange Keycloak token for Compliance token
        this.authService.exchangeSSOToken(accessToken).subscribe({
          next: (response) => {
            console.log('SSO authentication successful');
            // Token is stored in AuthService, user is now authenticated
            // Don't reload - let Angular's change detection handle the UI update
            // The authService.isAuthenticated() will return true and show the sidebar
          },
          error: (error) => {
            console.error('SSO token exchange failed:', error);
            // If SSO fails, user will need to log in normally
          }
        });
      }
    }
  }
}

