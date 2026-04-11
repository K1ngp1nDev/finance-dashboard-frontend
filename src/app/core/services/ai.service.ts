import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  query(question: string) {
    return this.http.post<{ answer: string }>(`${environment.apiUrl}/ai/query`, { question })
  }
}
