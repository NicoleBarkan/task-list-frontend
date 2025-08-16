import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';      
import { MatIconModule } from '@angular/material/icon';        
import { MatButtonModule } from '@angular/material/button'; 
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,  
    RouterModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatMenuModule,      
    MatIconModule,    
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedLang = 'en';
  translate = inject(TranslateService);
  platformId = inject(PLATFORM_ID);

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);
    const fallbackLang = 'en';
    const savedLang = isBrowser ? localStorage.getItem('lang') || fallbackLang : fallbackLang;

    this.translate.use(fallbackLang);
    this.translate.use(savedLang);
    this.selectedLang = savedLang;
  }

  switchLang(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
    this.translate.use(lang);
    this.selectedLang = lang;
  }
}
