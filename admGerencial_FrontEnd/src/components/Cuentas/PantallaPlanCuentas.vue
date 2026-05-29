<template>
  <div class="modulo-contabilidad">
    <header class="cabecera-modulo">
      <div>
        <h1>Plan de Cuentas</h1>
        <p class="subtitulo">Estructura contable del sistema</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nueva Cuenta</button>
    </header>

    <div class="layout-contenido">
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
import { ref, computed } from 'vue';
import ListaCuentasAgrupadas from './ListaCuentasAgrupadas.vue';
import ModalFormCuenta from './ModalFormCuenta.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// Simulación de registros de la base de datos
const cuentasDB = ref([
  { id: 1, codigo: '1.01.00', nombre: 'Caja', tipo: 'Activo' },
  { id: 2, codigo: '1.01.01', nombre: 'Banco Nación C/C', tipo: 'Activo' },
  { id: 3, codigo: '1.02.00', nombre: 'Mercaderías', tipo: 'Activo' },
  { id: 4, codigo: '2.01.00', nombre: 'Proveedores', tipo: 'Pasivo' },
  { id: 5, codigo: '2.02.00', nombre: 'Sueldos a Pagar', tipo: 'Pasivo' },
  { id: 6, codigo: '3.01.00', nombre: 'Capital Social', tipo: 'Patrimonio Neto' },
  { id: 7, codigo: '3.02.00', nombre: 'Resultados Acumulados', tipo: 'Patrimonio Neto' },
  { id: 8, codigo: '4.01.00', nombre: 'Ventas', tipo: 'Ingreso' },
  { id: 9, codigo: '5.01.00', nombre: 'Costo de Mercadería Vendida', tipo: 'Egreso' },
  { id: 10, codigo: '5.02.00', nombre: 'Gastos Generales', tipo: 'Egreso' }
]);

const mostrarModalForm = ref(false);
const mostrarExito = ref(false);
const tituloExito = ref('');
const cuentaSeleccionada = ref(null);

// Computada para agrupar y ordenar por código de manera automática
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
      // Simulación de actualización (PUT)
      console.log("📂 ESTRUCTURA JSON A ENVIAR (editar cuenta):", JSON.stringify(datos, null, 2));
      
      const idx = cuentasDB.value.findIndex(c => c.id === datos.id);
      if (idx !== -1) {
        cuentasDB.value[idx] = datos;
      }
      tituloExito.value = "¡Cuenta Actualizada!";
    } else {
      // Simulación de creación (POST)
      const nuevoId = cuentasDB.value.length ? Math.max(...cuentasDB.value.map(c => c.id)) + 1 : 1;
      const nuevaCuenta = { id: nuevoId, ...datos };
      
      console.log("📂 ESTRUCTURA JSON A ENVIAR (nueva cuenta):", JSON.stringify(datos, null, 2));
      
      cuentasDB.value.push(nuevaCuenta);
      tituloExito.value = "¡Cuenta Creada!";
    }
    
    mostrarModalForm.value = false;
    mostrarExito.value = true;
  } catch (err) {
    console.error('Error al guardar la cuenta:', err);
    alert('Hubo un error al procesar la operación.');
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
</style>