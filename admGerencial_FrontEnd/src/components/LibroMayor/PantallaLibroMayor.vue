<template>
  <div class="modulo-libro-mayor">
    <header class="cabecera-modulo">
      <div>
        <h1>Libro Mayor</h1>
        <p class="subtitulo">Análisis detallado y saldos por cuenta contable</p>
      </div>
      <div class="acciones-header">
        <input 
          type="text" 
          v-model="filtroCuenta" 
          placeholder="Buscar cuenta..." 
          class="input-buscador"
        />
        <button class="btn-secundario" disabled>Exportar PDF</button>
      </div>
    </header>

    <div v-if="cargando" class="estado-mensaje">Generando Libro Mayor...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>
    
    <div v-else class="layout-contenido">
      <MayorCuentaItem 
        v-for="cuenta in cuentasFiltradas" 
        :key="cuenta.cuenta_id" 
        :cuenta="cuenta" 
      />
      
      <div v-if="cuentasFiltradas.length === 0" class="estado-mensaje">
        No se encontraron cuentas con movimientos para la búsqueda actual.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { contabilidadService } from '../../services/contabilidadService'; // Conectamos la API real
import MayorCuentaItem from './MayorCuentaItem.vue';

// ==========================================
// ESTADO REACTIVO REAL
// ==========================================
const cuentasMayor = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);
const filtroCuenta = ref(''); 

// ==========================================
// INICIALIZACIÓN (LLAMADA A LA API GET)
// ==========================================
const cargarLibroMayor = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    // Petición HTTP real al backend de Python
    const data = await contabilidadService.obtenerLibroMayor();
    
    // Asignación segura garantizando la lectura del array
    cuentasMayor.value = Array.isArray(data) ? data : (data?.data || []);

  } catch (err) {
    console.error('Error al cargar el Libro Mayor:', err);
    errorCarga.value = 'No se pudo cargar el Libro Mayor. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarLibroMayor);

// Filtro computado por si se quiere buscar una cuenta por nombre o por código
const cuentasFiltradas = computed(() => {
  const query = filtroCuenta.value.toLowerCase().trim();
  if (!query) return cuentasMayor.value;

  return cuentasMayor.value.filter(c => 
    (c.cuenta_codigo && c.cuenta_codigo.toLowerCase().includes(query)) || 
    (c.cuenta_nombre && c.cuenta_nombre.toLowerCase().includes(query))
  );
});
</script>

<style scoped>
.modulo-libro-mayor {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cabecera-modulo {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.cabecera-modulo h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.subtitulo {
  margin: 5px 0 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.acciones-header {
  display: flex;
  gap: 15px;
  align-items: center;
}

.input-buscador {
  padding: 0.65rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 250px;
  outline: none;
  transition: all 0.2s;
}

.input-buscador:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-secundario {
  background: #ffffff; 
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secundario:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-secundario:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.error {
  color: #ef4444;
  border-color: #fca5a5;
  background: #fef2f2;
}

.layout-contenido {
  display: flex;
  flex-direction: column;
}
</style>