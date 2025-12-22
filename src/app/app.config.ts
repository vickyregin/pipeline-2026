import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {
  LucideAngularModule,
  LayoutDashboard, Kanban, Users, TrendingUp, Plus, Activity,
  Sparkles, RefreshCcw, Table2, Trash2, Target, Trophy,
  BarChart2, Search, PieChart, Database, Filter, Calendar,
  Zap, ChevronLeft, ChevronRight, Briefcase, X, Calculator,
  ArrowRight, ArrowLeft, Building2, Edit2, Copy, Check,
  Mail, Lock, LogOut, ShieldCheck
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(LucideAngularModule.pick({
      LayoutDashboard, Kanban, Users, TrendingUp, Plus, Activity,
      Sparkles, RefreshCcw, Table2, Trash2, Target, Trophy,
      BarChart2, Search, PieChart, Database, Filter, Calendar,
      Zap, ChevronLeft, ChevronRight, Briefcase, X, Calculator,
      ArrowRight, ArrowLeft, Building2, Edit2, Copy, Check,
      Mail, Lock, LogOut, ShieldCheck
    }))
  ]
};
