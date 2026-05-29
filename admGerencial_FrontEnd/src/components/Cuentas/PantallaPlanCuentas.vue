<template>
  <div class="modulo-contabilidad">
    <header class="cabecera-modulo">
      <div>
        <h1>Plan de Cuentas</h1>
        <p class="subtitulo">Estructura contable del sistema</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nueva Cuenta</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando plan de cuentas...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>

    <div v-else class="layout-contenido">
      <ListaCuentasAgrupadas :grupos="cuentasAgrupadas" @editar="abrirModalEditar" />
    </div>

    <ModalFormCuenta 
      :visible="mostrarModalForm"
      :cuentaOriginal="cuentaSeleccionada"
      @cerrar="mostrarModalForm = false"
      @guardar="guardarCuenta"
    />

    <ModalExito 
      :show="mostrarExito"
      :titulo="tituloExito"
      mensaje="La estructura del plan de cuentas se ha actualizado correctamente."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ListaCuentasAgrupadas from './ListaCuentasAgrupadas.vue';
import ModalFormCuenta from './ModalFormCuenta.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';
import { cuentasService } from '../../services/cuentasService'; // Importamos el nuevo servicio

// ==========================================
// ESTADO REACTIVO
// ==========================================
const cuentasDB = ref([]); // Arranca vacío, se llena desde la API
const cargando = ref(true);
const errorCarga = ref(null);

const mostrarModalForm = ref(false);
const mostrarExito = ref(false);
const tituloExito = ref('');
const cuentaSeleccionada = ref(null);

// ==========================================
// INICIALIZACIÓN (LLAMADA A LA API)
// ==========================================
const cargarCuentas = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    const data = await cuentasService.obtenerTodas();
    cuentasDB.value = data;
    
  } catch (err) {
    console.error('Error al cargar las cuentas contables:', err);
    errorCarga.value = 'No se pudo cargar el plan de cuentas. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarCuentas);

// ==========================================
// LÓGICA COMPUTADA (AGRUPACIÓN Y ORDEN)
// ==========================================
const cuentasAgrupadas = computed(() => {
  const ordenTipos = ['Activo', 'Pasivo', 'Patrimonio Neto', 'Ingreso', 'Egreso'];
  return ordenTipos.map(tipo => {
    const cuentasFiltradas = cuentasDB.value
      .filter(cuenta => cuenta.tipo === tipo)
      .sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      tipoContable: tipo,
      cuentas: cuentasFiltradas
    };
  });
});

// ==========================================
// MÉTODOS DE GESTIÓN
// ==========================================
const abrirModalNuevo = () => {
  cuentaSeleccionada.value = null;
  mostrarModalForm.value = true;
};

const abrirModalEditar = (cuenta) => {
  cuentaSeleccionada.value = { ...cuenta };
  mostrarModalForm.value = true;
};

const guardarCuenta = async (datos) => {
  try {
    if (datos.id) {
      // 1. Armamos la estructura limpia para la actualización
      const payloadEditarCuenta = {
        codigo: datos.codigo,
        nombre: datos.nombre,
        tipo: datos.tipo
      };

      // 2. LLAMADO REAL A LA API DE EDICIÓN
      await cuentasService.actualizar(datos.id, payloadEditarCuenta);
      
      console.log("📂 CAMBIOS GUARDADOS EN BD PARA LA CUENTA ID:", datos.id, JSON.stringify(payloadEditarCuenta, null, 2));
      tituloExito.value = "¡Cuenta Actualizada!";
      
    } else {
      // Inserción de cuenta nueva
      const payloadNuevaCuenta = {
        codigo: datos.codigo,
        nombre: datos.nombre,
        tipo: datos.tipo
      };

      await cuentasService.crear(payloadNuevaCuenta);
      console.log("📂 CUENTA CREADA EN BD:", JSON.stringify(payloadNuevaCuenta, null, 2));
      tituloExito.value = "¡Cuenta Creada!";
    }
    
    // Si la operación es exitosa (sea creación o edición), refrescamos la interfaz
    mostrarModalForm.value = false;
    await cargarCuentas(); // Trae la lista actualizada del servidor automáticamente
    mostrarExito.value = true;
    
  } catch (err) {
    console.error('Error al guardar la cuenta:', err);
    alert('Hubo un error al guardar los cambios en el servidor.');
  }
};
</script>

<style scoped>
.modulo-contabilidad {
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

.btn-nuevo {
  background: #3b82f6; 
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-nuevo:hover {
  background: #2563eb;
}

.layout-contenido {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 0.95rem;
}

.error {
  color: #ef4444;
}
</style>