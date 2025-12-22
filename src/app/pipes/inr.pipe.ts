import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'inr',
    standalone: true
})
export class InrPipe implements PipeTransform {
    transform(val: number): string {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(val);
    }
}
