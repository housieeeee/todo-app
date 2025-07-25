import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';  // Import your routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  // Pass the defined routes
    provideClientHydration()
  ]
};
