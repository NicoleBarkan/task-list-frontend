import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtAuthInterceptor } from './interceptors/jwt-auth.interceptor';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BackendTranslateLoader } from './backend-translate-loader';

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { tasksFeature } from './store/tasks/tasks.reducer';
import { TasksEffects } from './store/tasks/tasks.effects';

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new BackendTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserAnimationsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatDialogModule,
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] }
      })
    ),
    provideStore(),
    provideState(tasksFeature),
    provideEffects([TasksEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
  ]
};
