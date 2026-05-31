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
import TablaLibroDiario from './TablaLibroDiario.vue';

// ==========================================
// ESTADO ESTÁTICO (Simulación de API)
// ==========================================
const asientosSimulados = [
  {
    "nro_asiento": 1,
    "fecha": "2026-05-30T10:15:00",
    "descripcion": "Venta Mostrador - Efectivo",
    "detalles": [
      { "cuenta_codigo": "1.1.1.01", "cuenta_nombre": "Caja", "debe": 12000.00, "haber": 0.00 },
      { "cuenta_codigo": "5.1.01", "cuenta_nombre": "Costo de Mercaderías Vendidas", "debe": 5500.00, "haber": 0.00 },
      { "cuenta_codigo": "4.1.01", "cuenta_nombre": "Ventas", "debe": 0.00, "haber": 12000.00 },
      { "cuenta_codigo": "1.1.5.01", "cuenta_nombre": "Mercaderías", "debe": 0.00, "haber": 5500.00 }
    ],
    "total_debe": 17500.00,
    "total_haber": 17500.00
  },
  {
    "nro_asiento": 2,
    "fecha": "2026-05-31T09:30:00",
    "descripcion": "Compra s/ Factura A 0444",
    "detalles": [
      { "cuenta_codigo": "1.1.5.01", "cuenta_nombre": "Mercaderías", "debe": 45000.00, "haber": 0.00 },
      { "cuenta_codigo": "1.1.1.02", "cuenta_nombre": "Banco c/c", "debe": 0.00, "haber": 45000.00 }
    ],
    "total_debe": 45000.00,
    "total_haber": 45000.00
  }
];

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
    
    // Simulamos un delay de red de 800ms para mantener el feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Inyectamos el array estático
    listaAsientos.value = asientosSimulados;

  } catch (err) {
    console.error('Error al cargar el Libro Diario:', err);
    errorCarga.value = 'No se pudieron cargar los registros contables.';
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