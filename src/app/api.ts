import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ANTES: private apiUrl = 'http://localhost:3000/api';
private apiUrl = 'https://clinica-backend-mvp.onrender.com'; // <--- Pon tu URL de Render real aquí

  constructor(private http: HttpClient) { }

  // Función para enviar los datos y recibir el PDF
  generarCertificado(datos: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/certificados`, datos, {
      responseType: 'blob' // Súper importante para que entienda que recibe un archivo y no texto
    });
  }

  // 2. NUEVA: Consultar si el certificado es válido
  validarCertificado(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validar/${id}`);
  }

}