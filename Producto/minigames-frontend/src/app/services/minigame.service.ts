import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MinigameService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  // 1. Arreglo con los IDs reales de tu base de datos
  private realBookIds: string[] = [
    '21239be6-31c8-5de7-acd7-bdff74dae2a7',
    'dac238d3-02b4-57ac-b1dc-5360a5db857b',
    '5cddfa21-24e5-5ebd-9729-f05185e0705b',
    'b0a8ba6f-ff54-5766-9109-c9e9d3751e1d',
    'a921bd71-9ba7-53e1-ba2a-fb7b326b437b'
  ];

  // 2. Almacena el ID cuando el usuario use el selector de libros (null por defecto)
  private selectedBookId: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Permite fijar un libro desde el selector que construirás después.
   */
  setSelectedBookId(bookId: string | null): void {
    this.selectedBookId = bookId;
  }

  /**
   * Retorna el libro seleccionado o escoge uno al azar para la demo.
   */
  getActiveBookId(): string {
    if (this.selectedBookId) {
      return this.selectedBookId;
    }
    // Modo Demo: Selección aleatoria de la lista real
    const randomIndex = Math.floor(Math.random() * this.realBookIds.length);
    return this.realBookIds[randomIndex];
  }

  /**
   * Consulta el minijuego a Django. 
   * Si recibe un bookId lo usa; de lo contrario, usa getActiveBookId().
   */
  getMinigameByCode(gameCode: string, bookId?: string): Observable<any[]> {
    const targetBookId = bookId || this.getActiveBookId();
    return this.http.get<any[]>(`${this.apiUrl}/books/${targetBookId}/minigames/${gameCode}/`);
  }
}