import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

// Since this is a simple single-page app, the routes array is empty.
// We keep provideRouter for a standard setup.
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideClientHydration()
  ]
};
