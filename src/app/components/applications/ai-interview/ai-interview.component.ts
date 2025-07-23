import { ChangeDetectorRef, Component, Inject, NgZone, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { WebSocketService } from '../../../services/web-sockets/web-socket.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../environment';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

interface ChatMessage {
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './ai-interview.component.html',
  styleUrl: './ai-interview.component.scss'
})
export class AiInterviewComponent implements OnInit, OnDestroy {

  inputValue: string = '';
  outputValue: string = '';
  isListening: boolean = false;
  isTyping: boolean = false;

  url = `${environment.WEBSOCKET_URL}`;
  
  private socketSub?: Subscription;
  private recognition?: any;
  userDetails: any = '';

  chatMessages: ChatMessage[] = [
    {
      type: 'ai',
      message: 'Hello! I\'m your AI interviewer. I\'m ready to conduct your interview when you are.',
      timestamp: new Date()
    }
  ];

  statusText: string = 'Welcome! Click "Start Voice Interview" to begin. I\'ll ask you questions and you can respond naturally.';

  constructor(
    private websocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {

    const token = this.activateRoute.snapshot.queryParamMap.get('token');

    if(token) {
      this.userDetails = this.authService.checkAuthStatus().subscribe({
        next: (res) => {
          console.log("user authenticated", res)
        },
        error: (err) => {
          console.error("error: ", err)
        }
      })
    }

    // Check if current role is hr than don't allow
    const currentUser = this.authService.currentUserValue;

    if(currentUser.role === 'hr') {
      this.router.navigate(['/'])
      throw new Error("Hr are not allowed to access this page")
    }

    console.log("user dateaidls", currentUser);

    if (isPlatformBrowser(this.platformId)) {
      this.socketConnect();
  
      this.socketSub = this.websocketService.onMessage().subscribe((event: MessageEvent) => {
        console.log("WebSocket message received:", event.data);
        
        this.ngZone.run(() => {
          this.outputValue = event.data;
          this.speakText(this.outputValue);
          this.hideTypingIndicator();
          this.addChatMessage('ai', event.data);
          this.updateStatus('🎙️ I\'m listening for your next response...');
          this.cdr.detectChanges();
        });
      });
    }
  }

  socketConnect() {
    this.websocketService.connect(this.url);
  }

  sendMessage() {
    if (!this.inputValue.trim()) return;
    console.log("hello", this.inputValue);
    
    console.log('Sending message:', this.inputValue);
    this.websocketService.sendMessage(this.inputValue);
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Reset input
    this.inputValue = '';
  }

  startVoiceInterview() {
  if (!isPlatformBrowser(this.platformId)) return;

  // Stop any existing recognition first
  if (this.recognition) {
    this.recognition.stop();
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  this.recognition = new SpeechRecognition();
  this.recognition.lang = 'en-US';
  this.recognition.interimResults = false;
  this.recognition.maxAlternatives = 1;
  this.recognition.continuous = true;

  // Reset event handlers
  this.recognition.onstart = () => {
    this.ngZone.run(() => {
      this.isListening = true;
      this.updateStatus('Listening... Please speak your answer.');
      this.cdr.detectChanges();
    });
  };

  this.recognition.onresult = (event: any) => {
    const voiceText = event.results[event.results.length - 1][0].transcript;
    console.log('🎙️ Voice to Text:', voiceText);
    
    this.ngZone.run(() => {
      this.inputValue = voiceText;
      this.addChatMessage('user', voiceText);
      this.sendMessage();
      this.cdr.detectChanges();
    });
  };

  this.recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    this.ngZone.run(() => {
      this.updateStatus('❌ Speech recognition error: ' + event.error);
      this.isListening = false;
      if (this.recognition) {
        this.recognition.stop();
      }
      this.cdr.detectChanges();
    });
  };

  this.recognition.onend = () => {
    if (this.isListening) {
      // Add a small delay before restarting
      setTimeout(() => {
        if (this.isListening && this.recognition) {
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
            this.recognition = undefined;
            this.startVoiceInterview(); // Restart fresh
          }
        }
      }, 500);
    }
  };

  try {
    this.recognition.start();
  } catch (e) {
    console.error('Error starting recognition:', e);
    this.updateStatus('Error starting voice recognition. Please try again.');
  }
}

  stopVoiceInterview() {
  this.isListening = false;
  if (this.recognition) {
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
    this.recognition = undefined;
  }
  this.updateStatus('Interview stopped. Click "Start Voice Interview" to begin again.');
  this.cdr.detectChanges();
}

  addChatMessage(type: 'user' | 'ai', message: string) {
    const newMessage: ChatMessage = {
      type: type,
      message: message,
      timestamp: new Date()
    };
    
    this.chatMessages.push(newMessage);
    this.cdr.detectChanges();
    
    // Scroll to bottom after view update
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  showTypingIndicator() {
    this.isTyping = true;
    this.cdr.detectChanges();
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    this.cdr.detectChanges();
  }

  clearChat() {
    this.chatMessages = [
      {
        type: 'ai',
        message: 'Hello! I\'m your AI interviewer. I\'m ready to conduct your interview when you are.',
        timestamp: new Date()
      }
    ];
    this.cdr.detectChanges();
  }

  updateStatus(message: string) {
    this.statusText = message;
  }

  private restartRecognition() {
  if (!this.isListening) return;
  
  if (this.recognition) {
    this.recognition.stop();
    this.recognition = undefined;
  }
  
  setTimeout(() => {
    if (this.isListening) {
      this.startVoiceInterview();
    }
  }, 1000);
}

  private scrollToBottom() {
    if (isPlatformBrowser(this.platformId)) {
      const chatContainer = document.getElementById('chatMessages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }

  speakText(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;

  speechSynthesis.speak(utterance);
}


  ngOnDestroy() {
    this.socketSub?.unsubscribe();
    this.websocketService.close();
    
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}