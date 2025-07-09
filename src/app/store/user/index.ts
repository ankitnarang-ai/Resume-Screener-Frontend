// src/app/store/auth.store.ts
import { signal, computed } from '@angular/core';

const userSignal = signal<any>(null); // 🔐 our "smart global box"

export const setUser = (user: any) => userSignal.set(user);
export const clearUser = () => userSignal.set(null);

export const currentUser = computed(() => userSignal());
export const currentRole = computed(() => userSignal()?.role ?? null);
export const isLoggedIn = computed(() => !!userSignal());
