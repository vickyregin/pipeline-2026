import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-schema-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
    <div class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
              <lucide-icon name="database" [size]="20"></lucide-icon>
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-800">Supabase Setup</h3>
              <p class="text-xs text-slate-500">Run this SQL in your Supabase SQL Editor</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        
        <div class="flex-1 overflow-auto bg-slate-900 p-4 relative group">
           <pre class="text-sm font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">{{ sqlQuery }}</pre>
           <button 
             (click)="handleCopy()"
             class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
           >
             <lucide-icon [name]="copied() ? 'check' : 'copy'" [size]="14" [class]="copied() ? 'text-emerald-400' : ''"></lucide-icon>
             {{ copied() ? 'Copied!' : 'Copy SQL' }}
           </button>
        </div>

        <div class="p-4 bg-white border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
           <span>Updated to include <code>business_type</code> analytics field.</span>
           <button (click)="close.emit()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
             Close
           </button>
        </div>
      </div>
    </div>
  `
})
export class SchemaModalComponent {
    @Output() close = new EventEmitter<void>();
    copied = signal(false);

    // We duplicated the SQL in the template for presentation with ngNonBindable, 
    // but we also need it in a variable for clipboard copy.
    // Note: innerText from the pre tag could also be used but having it as a const is cleaner.
    sqlQuery = `-- 1. Create Sales Reps Table
CREATE TABLE IF NOT EXISTS public.sales_reps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    quota NUMERIC DEFAULT 0,
    variable_pay_pool NUMERIC DEFAULT 0,
    team_members TEXT[]
);

-- 2. Create Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    title TEXT,
    value NUMERIC DEFAULT 0,
    stage TEXT,
    category TEXT,
    business_type TEXT DEFAULT 'New Business',
    assigned_rep_id TEXT REFERENCES public.sales_reps(id),
    close_date DATE,
    probability INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    stage_history JSONB DEFAULT '{}'::jsonb
);

-- 3. Add columns if table exists (Safe Update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='notes') THEN
        ALTER TABLE public.deals ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='stage_history') THEN
        ALTER TABLE public.deals ADD COLUMN stage_history JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='business_type') THEN
        ALTER TABLE public.deals ADD COLUMN business_type TEXT DEFAULT 'New Business';
    END IF;
END $$;

-- 4. Enable RLS (Security)
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public Access for Demo)
DROP POLICY IF EXISTS "Public Access Reps" ON public.sales_reps;
CREATE POLICY "Public Access Reps" ON public.sales_reps FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Access Deals" ON public.deals;
CREATE POLICY "Public Access Deals" ON public.deals FOR ALL USING (true);

-- 6. Insert Mock Reps (Optional - Run once)
INSERT INTO public.sales_reps (id, name, avatar, quota, variable_pay_pool, team_members)
VALUES 
('george', 'George', 'https://api.dicebear.com/7.x/avataaars/svg?seed=George', 40000000, 800000, NULL),
('hari', 'Hari', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hari', 45000000, 900000, NULL),
('team-dva', 'Team DVA', 'https://api.dicebear.com/7.x/identicon/svg?seed=DVA', 45000000, 900000, ARRAY['Dinesh', 'Venkat', 'Arjun']),
('team-la', 'Team LA', 'https://api.dicebear.com/7.x/identicon/svg?seed=LA', 45000000, 900000, ARRAY['Logesh', 'Ajay']),
('team-snv', 'Team SNV', 'https://api.dicebear.com/7.x/identicon/svg?seed=SNV', 45000000, 900000, ARRAY['Sasi', 'Nirupama', 'Vicky'])
ON CONFLICT (id) DO NOTHING;
`;

    handleCopy() {
        navigator.clipboard.writeText(this.sqlQuery);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
    }
}
