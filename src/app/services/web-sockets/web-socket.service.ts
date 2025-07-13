import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: WebSocket | null = null;
  private messageSubject = new Subject<MessageEvent>();
  private isBrowser: boolean;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }


  connect(url: string): void {
    if (!this.isBrowser) {
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.messageSubject.next(event)
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event);
      this.socket = null;
    };
  }

  sendMessage(message: string) {
    if (!this.isBrowser || !(this.socket?.readyState === WebSocket.OPEN)) {
      console.log('Cannot send message: WebSocket not connected');
      return;
    }

    this.socket?.send(message);
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  close(): void {
    if (!this.isBrowser) return
    this.socket?.close()
  }
}
