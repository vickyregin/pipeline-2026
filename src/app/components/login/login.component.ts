import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      <!-- Background Effects -->
      <div class="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div class="w-full max-w-md p-8 relative z-10">
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30 mb-4">
              <lucide-icon name="trending-up" class="text-white" [size]="32"></lucide-icon>
            </div>
            <h1 class="text-3xl font-extrabold text-white tracking-tight">Pipeline 2026</h1>
            <p class="text-slate-400 mt-2 text-sm font-medium">Enterprise Sales Performance Dashboard</p>
          </div>

          <div *ngIf="error()" class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
            {{ error() }}
          </div>

          <form (ngSubmit)="handleLogin()" class="space-y-5">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
              <div class="relative group">
                <lucide-icon name="users" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" [size]="18"></lucide-icon>
                <input 
                  type="text" 
                  [(ngModel)]="username" 
                  name="username" 
                  required 
                  class="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium" 
                  placeholder="Admin">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div class="relative group">
                <lucide-icon name="lock" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" [size]="18"></lucide-icon>
                <input 
                  type="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  class="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium" 
                  placeholder="••••••••">
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer">
              <span *ngIf="!loading()" class="flex items-center justify-center gap-2">
                Log In <lucide-icon name="zap" [size]="18"></lucide-icon>
              </span>
              <span *ngIf="loading()" class="flex items-center justify-center">
                <lucide-icon name="refresh-ccw" class="animate-spin" [size]="20"></lucide-icon>
              </span>
            </button>
          </form>

          <div class="mt-8 pt-8 border-t border-white/5 text-center">
             <p class="text-xs text-slate-500 uppercase tracking-widest font-bold">Secure Enterprise Access</p>
          </div>
        </div>
        
        <p class="text-center text-slate-500 text-xs mt-8">
           &copy; 2026 Pipeline CRM Systems • All Rights Reserved
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  authService = inject(AuthService);

  async handleLogin() {
    this.loading.set(true);
    this.error.set('');

    const { error } = await this.authService.signInWithCredentials(this.username, this.password);

    if (error) {
      this.error.set(error.message);
    }
    this.loading.set(false);
  }
}
