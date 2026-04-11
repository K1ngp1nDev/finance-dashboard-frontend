import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AiService } from '../../core/services/ai.service'

interface Message {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my top spending category?',
  'How much on food this week?',
]

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col h-full bg-white rounded-2xl shadow overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">AI Assistant</h2>
        <p class="text-xs text-slate-400">Ask about your spending</p>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        @if (messages().length === 0) {
          <div class="space-y-2 pt-2">
            @for (s of suggestions; track s) {
              <button (click)="ask(s)"
                class="w-full text-left text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg px-3 py-2 transition-colors">
                {{ s }}
              </button>
            }
          </div>
        }
        @for (msg of messages(); track $index) {
          <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs max-w-[85%]'
              : 'bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs max-w-[85%] whitespace-pre-wrap'">
              {{ msg.text }}
            </div>
          </div>
        }
        @if (loading()) {
          <div class="flex justify-start">
            <div class="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1">
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        }
      </div>

      <div class="px-4 py-3 border-t border-slate-100">
        <form (ngSubmit)="sendInput()" class="flex gap-2">
          <input [(ngModel)]="input" name="q" placeholder="Ask anything…"
            [disabled]="loading()"
            class="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
          <button type="submit" [disabled]="!input.trim() || loading()"
            class="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AiChatComponent {
  messages = signal<Message[]>([])
  input = ''
  loading = signal(false)
  readonly suggestions = SUGGESTIONS

  constructor(private aiService: AiService) {}

  sendInput() {
    if (!this.input.trim()) return
    this.ask(this.input)
    this.input = ''
  }

  ask(question: string) {
    this.messages.update((m) => [...m, { role: 'user', text: question }])
    this.loading.set(true)
    this.aiService.query(question).subscribe({
      next: (res) => {
        this.messages.update((m) => [...m, { role: 'ai', text: res.answer }])
        this.loading.set(false)
      },
      error: () => {
        this.messages.update((m) => [...m, { role: 'ai', text: 'Something went wrong. Try again.' }])
        this.loading.set(false)
      },
    })
  }
}
