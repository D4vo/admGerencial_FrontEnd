<template>
  <div class="pantalla-compras">
    <header class="header">
      <h2>Ingreso de Mercadería</h2>
      <p>Registre las compras a proveedores y sus comprobantes</p>
    </header>

    <div class="layout-grid">
      <div class="col-principal">
        <FormularioItemCompra @agregar-item="onAgregarItem" />
        <TablaDetalleCompra :detalles="detallesCompra" @eliminar-item="onEliminarItem" />
      </div>

      <div class="col-lateral">
        <PanelResumenCompra
            ref="panelRef"
          :total="totalCompra" 
          :cargando="cargando"
          @confirmar-compra="enviarAlBackend" 
        />
      </div>
    </div>

    <ModalExito 
      v-if="mostrarModal" 
      :visible="true"
      :mostrar="true"
      :show="true"
      :isOpen="true"
      titulo="¡Compra Registrada!"
      mensaje="El stock y los libros contables han sido actualizados."
      @close="cerrarModalYLimpiar"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FormularioItemCompra from './FormularioItemCompra.vue'
import TablaDetalleCompra from './TablaDetalleCompra.vue'
import PanelResumenCompra from './PanelResumenCompra.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'

const detallesCompra = ref([])
const cargando = ref(false)
const mostrarModal = ref(false) 
const panelRef = ref(null)

const totalCompra = computed(() => {
  return detallesCompra.value.reduce((acc, item) => acc + (item.cantidad * item.costo_unitario), 0)
})

const onAgregarItem = (nuevoItem) => detallesCompra.value.push(nuevoItem)
const onEliminarItem = (index) => detallesCompra.value.splice(index, 1)

const enviarAlBackend = async (datosCabecera) => {
  if (detallesCompra.value.length === 0) return

  cargando.value = true

  const payload = {
    fecha: new Date().toISOString().split('T')[0],
    tipo_comprobante: datosCabecera.tipo_comprobante,
    nro_comprobante: datosCabecera.nro_comprobante,
    total: totalCompra.value,
    detalles: detallesCompra.value
  }
 
  try {
    console.log("Enviando JSON al backend:", JSON.stringify(payload, null, 2))
    
    // Simulación de la API
    await new Promise(resolve => setTimeout(resolve, 1500)) 
    
    // Mostramos el modal
    mostrarModal.value = true
  } catch (error) {
    console.error("Error en la API:", error)
  } finally {
    cargando.value = false
  }
}

const cerrarModalYLimpiar = () => {
  mostrarModal.value = false
  detallesCompra.value = [] // Esto ya lo tenías, limpia la tabla
  
  // Esto es lo nuevo: manda a limpiar el panel lateral
  if (panelRef.value) {
    panelRef.value.resetearFormulario()
  }
}
</script>

<style scoped>
.pantalla-compras { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif; 
}
.header { margin-bottom: 2rem; }
.header h2 { margin: 0 0 0.5rem 0; font-size: 1.8rem; color: #111827; font-weight: 700; }
.header p { margin: 0; color: #6b7280; font-size: 1rem; }
.layout-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); 
  gap: 2rem; 
  align-items: start; 
}

/* Si la pantalla es chica, se apilan */
@media (max-width: 900px) {
  .layout-grid { grid-template-columns: 1fr; }
}
</style>