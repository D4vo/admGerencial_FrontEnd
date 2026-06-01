<template>
  <div class="modulo-libro-diario">
    <header class="cabecera-modulo">
      <div>
        <h1>Libro Diario</h1>
        <p class="subtitulo">Registro cronológico de operaciones contables</p>
      </div>
      <div class="acciones-header">
        <button class="btn-secundario" disabled>Exportar PDF</button>
      </div>
    </header>

    <div v-if="cargando" class="estado-mensaje">
      Generando Libro Diario...
    </div>
    <div v-else-if="errorCarga" class="estado-mensaje error">
      {{ errorCarga }}
    </div>
    
    <div v-else class="layout-contenido">
      <TablaLibroDiario :asientos="listaAsientos" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { contabilidadService } from '../../services/contabilidadService'; // Importamos el servicio
import TablaLibroDiario from './TablaLibroDiario.vue';

// ==========================================
// ESTADO REACTIVO
// ==========================================
const listaAsientos = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);

// ==========================================
// INICIALIZACIÓN
// ==========================================
const cargarLibroDiario = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    // Llamado real a la API
    const data = await contabilidadService.obtenerLibroDiario();
    
    // Asignación segura del array
    listaAsientos.value = Array.isArray(data) ? data : (data?.data || []);

  } catch (err) {
    console.error('Error al cargar el Libro Diario:', err);
    errorCarga.value = 'No se pudieron cargar los registros contables. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarLibroDiario);
</script>

<style scoped>
.modulo-libro-diario {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cabecera-modulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.cabecera-modulo h1 {
  margin: 0;
  font-size: 1.6rem;
  color: #111827;
  font-weight: 700;
}

.subtitulo {
  margin: 5px 0 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.acciones-header {
  display: flex;
  gap: 10px;
}

.btn-secundario {
  background: #ffffff; 
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secundario:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
}

.btn-secundario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 0.95rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

.error {
  color: #ef4444;
  border-color: #fca5a5;
  background: #fef2f2;
}

.layout-contenido {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>