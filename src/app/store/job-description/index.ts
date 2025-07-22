import { signal } from "@angular/core";

const jdSignal = signal<string>('');

export const setJD = (jd: string) => {
    return jdSignal.set(jd)
}

export const getJD = () => {
    return jdSignal()
}