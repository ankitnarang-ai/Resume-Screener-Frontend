// src/app/shared/components/common-select/common-select.component.ts
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-common-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <mat-form-field [appearance]="appearance" class="w-full">
      <mat-label>{{ label }}</mat-label>
      
      @if (prefixIcon) {
        <mat-icon matPrefix>{{ prefixIcon }}</mat-icon>
      }
      
      <mat-select 
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [multiple]="multiple"
        (selectionChange)="onSelectionChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      >
        @if (multiple && showSelectAll && options.length > 1) {
          <mat-option 
            [value]="'select-all'" 
            (click)="toggleSelectAll()"
          >
            {{ isAllSelected() ? 'Deselect All' : 'Select All' }}
          </mat-option>
        }
        
        @for (option of options; track option.value) {
          <mat-option 
            [value]="option.value"
            [disabled]="option.disabled"
          >
            {{ option.label }}
          </mat-option>
        }
      </mat-select>
      
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
      useExisting: forwardRef(() => CommonSelectComponent),
      multi: true
    }
  ]
})
export class CommonSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() options: SelectOption[] = [];
  @Input() prefixIcon: string = '';
  @Input() suffixIcon: string = '';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;
  @Input() showSelectAll: boolean = false;
  @Input() control: FormControl | null = null;
  @Input() customErrorMessage: string = '';

  value: any = this.multiple ? [] : null;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  onSelectionChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Optional: Add focus logic if needed
  }

  toggleSelectAll(): void {
    if (!this.multiple) return;

    const allValues = this.options
      .filter(option => !option.disabled)
      .map(option => option.value);

    if (this.isAllSelected()) {
      this.value = [];
    } else {
      this.value = [...allValues];
    }
    
    this.onChange(this.value);
  }

  isAllSelected(): boolean {
    if (!this.multiple || !Array.isArray(this.value)) return false;
    
    const enabledOptions = this.options.filter(option => !option.disabled);
    return enabledOptions.length > 0 && 
           enabledOptions.every(option => this.value.includes(option.value));
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || (this.multiple ? [] : null);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}