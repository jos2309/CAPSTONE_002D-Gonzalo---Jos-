import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MinigameBackendData {
  id: number;
  title: string;
  description?: string;
  code?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MinigamesService {
  private http = inject(HttpClient);
  // Endpoint apuntando al backend local de minijuegos
  private readonly baseUrl = 'http://127.0.0.1:8000/api/v1/minigames/';

  getMinigames(): Observable<MinigameBackendData[]> {
    return this.http.get<MinigameBackendData[]>(this.baseUrl);
  }

  getMinigameById(id: number | string): Observable<MinigameBackendData> {
    return this.http.get<MinigameBackendData>(`${this.baseUrl}${id}/`);
  }
}
