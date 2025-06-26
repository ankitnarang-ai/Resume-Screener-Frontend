// src/app/shared/components/common-input/common-input.component.ts
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-common-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <mat-form-field [appearance]="appearance">

    
      <mat-label>{{ label }}</mat-label>
      
      @if (prefixIcon) {
        <mat-icon matPrefix>{{ prefixIcon }}</mat-icon>
      }
      
      <input 
        matInput 
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [readonly]="readonly"
        [required]="required"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      
      @if (suffixIcon) {
        <mat-icon matSuffix>{{ suffixIcon }}</mat-icon>
      }
      
      @if (hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      
      @if (control && control.invalid && control.touched) {
        <mat-error>
          @if (control.errors?.['required']) {
            {{ label }} is required
          }
          @if (control.errors?.['email']) {
            Please enter a valid email
          }
          @if (control.errors?.['minlength']) {
            Minimum {{ control.errors?.['minlength'].requiredLength }} characters required
          }
          @if (control.errors?.['maxlength']) {
            Maximum {{ control.errors?.['maxlength'].requiredLength }} characters allowed
          }
          @if (control.errors?.['pattern']) {
            Invalid format
          }
          @if (customErrorMessage) {
            {{ customErrorMessage }}
          }
        </mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonInputComponent),
      multi: true
    }
  ]
})
export class CommonInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() prefixIcon: string = '';
  @Input() suffixIcon: string = '';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() control: FormControl | null = null;
  @Input() customErrorMessage: string = '';

  value: string = '';
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Optional: Add focus logic if needed
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}