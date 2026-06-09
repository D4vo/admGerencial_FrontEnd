<template>
  <div class="modulo-contabilidad">
    <header class="cabecera-modulo">
      <div>
        <h1>Plan de Cuentas</h1>
        <p class="subtitulo">Estructura contable del sistema</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nueva Cuenta</button>
    </header>

    <div class="barra-busqueda">
      <input 
        type="text" 
        v-model="textoBusqueda" 
        placeholder="Buscar por código, nombre o tipo (Ej: 1.1, Caja, Activo)..." 
        class="input-buscador"
      />
    </div>

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
import { cuentasService } from '../../services/cuentasService';

// ==========================================
// ESTADO REACTIVO
// ==========================================
const cuentasDB = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);

const textoBusqueda = ref(''); // Estado del buscador

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
// LÓGICA COMPUTADA (FILTRO, AGRUPACIÓN Y ORDEN)
// ==========================================
const cuentasAgrupadas = computed(() => {
  const query = textoBusqueda.value.toLowerCase().trim();
  const ordenTipos = ['Activo', 'Pasivo', 'Patrimonio Neto', 'Ingreso', 'Egreso'];

  // 1. Filtramos la base de datos completa primero según lo que se escriba
  let baseFiltrada = cuentasDB.value;
  if (query) {
    baseFiltrada = baseFiltrada.filter(cuenta => 
      (cuenta.codigo && cuenta.codigo.toLowerCase().includes(query)) ||
      (cuenta.nombre && cuenta.nombre.toLowerCase().includes(query)) ||
      (cuenta.tipo && cuenta.tipo.toLowerCase().includes(query))
    );
  }

  // 2. Agrupamos y ordenamos lo que quedó del filtro
  return ordenTipos.map(tipo => {
    const cuentasDelTipo = baseFiltrada
      .filter(cuenta => cuenta.tipo === tipo)
      .sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      tipoContable: tipo,
      cuentas: cuentasDelTipo
    };
  }).filter(grupo => grupo.cuentas.length > 0); // Ocultamos los grupos que quedaron vacíos tras la búsqueda
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
      const payloadEditarCuenta = {
        codigo: datos.codigo,
        nombre: datos.nombre,
        tipo: datos.tipo
      };

      await cuentasService.actualizar(datos.id, payloadEditarCuenta);
      console.log("📂 CAMBIOS GUARDADOS EN BD PARA LA CUENTA ID:", datos.id, JSON.stringify(payloadEditarCuenta, null, 2));
      tituloExito.value = "¡Cuenta Actualizada!";
      
    } else {
      const payloadNuevaCuenta = {
        codigo: datos.codigo,
        nombre: datos.nombre,
        tipo: datos.tipo
      };

      await cuentasService.crear(payloadNuevaCuenta);
      console.log("📂 CUENTA CREADA EN BD:", JSON.stringify(payloadNuevaCuenta, null, 2));
      tituloExito.value = "¡Cuenta Creada!";
    }
    
    mostrarModalForm.value = false;
    await cargarCuentas(); 
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

/* NUEVO: Estilos de la barra de búsqueda */
.barra-busqueda {
  margin-bottom: 25px;
}

.input-buscador {
  width: 100%;
  padding: 0.85rem 1.2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1f2937;
  background-color: #f9fafb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  outline: none;
}

.input-buscador:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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