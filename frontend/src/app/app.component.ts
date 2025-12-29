import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  showHeader = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      // Hide header on landing, login, and register pages
      const currentRoute = this.router.url;
      this.showHeader = !['/', '/login', '/register'].includes(currentRoute);
    });
  }
}
