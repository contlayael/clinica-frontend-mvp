import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  // Variables del formulario
  cargando = false;

  // Variables del QR
  modoValidacion = false;
  estadoCertificado: boolean | null = null;
  mensajeValidacion = '';
  pacienteValidado = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Leemos la URL completa directamente (es más seguro)
    const urlCompleta = window.location.href; 
    console.log("Detectando URL:", urlCompleta); // Para que lo veas en la consola (F12)
    
    if (urlCompleta.includes('/validar/')) {
      this.modoValidacion = true; // Oculta el formulario
      
      // Extraemos el ID de forma exacta, sin importar cómo se pegó la URL
      const partesUrl = urlCompleta.split('/validar/');
      const id = partesUrl[1].split('/')[0]; // Toma solo el ID
      
      this.consultarQR(id);
    }
  }

  consultarQR(id: string) {
      // 1. Limpiamos el ID por si la URL traía basura al final
      const idLimpio = id.split('?')[0].split('#')[0].trim();
      console.log("📡 Consultando a Node.js el ID:", idLimpio);

      this.apiService.validarCertificado(idLimpio).subscribe({
        next: (res) => {
          console.log("✅ Respuesta de Node.js:", res); // Podrás ver esto presionando F12
          this.estadoCertificado = res.valido;
          this.mensajeValidacion = res.mensaje;
          this.pacienteValidado = res.paciente;
          // 🔔 OBLIGAMOS A ANGULAR A ACTUALIZAR EL HTML 🔔
        this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("❌ Error en la petición:", err);
          this.estadoCertificado = false;
          this.mensajeValidacion = 'Error: Certificado no encontrado o ID inválido.';
        }
      });
    }

  onSubmit(event: any) {
    event.preventDefault(); 
    this.cargando = true;

    const datos = {
      paciente: event.target.paciente.value,
      medico: event.target.medico.value,
      resultadoAntidoping: event.target.resultado.value
    };

    this.apiService.generarCertificado(datos).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificado_${datos.paciente}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.cargando = false;
        alert('¡Certificado generado con éxito!');
        event.target.reset(); 
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el certificado');
        this.cargando = false;
      }
    });
  }
}
