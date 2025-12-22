import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private router = inject(Router);

    // Using a simple signal to track if user is logged in for the hardcoded demo
    user = signal<any>(null);
    loading = signal(false);

    isAdmin = computed(() => {
        return !!this.user();
    });

    constructor() {
        // Check localStorage for persisted session
        const savedUser = localStorage.getItem('pipeline_user');
        if (savedUser) {
            this.user.set(JSON.parse(savedUser));
        }
    }

    async signInWithCredentials(username: string, password: string) {
        this.loading.set(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (username === 'Admin' && password === 'Flashkart2026') {
            const userData = { email: 'admin@flashkart.com', username: 'Admin' };
            this.user.set(userData);
            localStorage.setItem('pipeline_user', JSON.stringify(userData));
            this.loading.set(false);
            this.router.navigate(['/dashboard']);
            return { error: null };
        } else {
            this.loading.set(false);
            return { error: { message: 'Invalid username or password' } };
        }
    }

    signOut() {
        this.user.set(null);
        localStorage.removeItem('pipeline_user');
        this.router.navigate(['/dashboard']); // Redirect to public dashboard
    }

    get isAuthenticated() {
        return !!this.user();
    }
}
