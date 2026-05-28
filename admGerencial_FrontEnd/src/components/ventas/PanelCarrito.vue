<script setup>
import { computed } from 'vue';

const props = defineProps({
  carrito: {
    type: Array,
    required: true
  }
});

defineEmits(['eliminarItem', 'iniciarCobro']);

const total = computed(() => {
  return props.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
});
</script>

<template>
  <aside class="panel-carrito">
    <div class="cabecera-carrito">
      <h2>Detalle de Venta</h2>
      <span class="contador-items">{{ carrito.length }} ítems</span>
    </div>

    <div class="cuerpo-carrito">
      <div v-if="carrito.length === 0" class="carrito-vacio">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="icono-vacio">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        <p>El carrito está vacío.</p>
      </div>

      <TransitionGroup name="item-carrito" tag="ul" class="lista-carrito" v-else>
        <li v-for="(item, index) in carrito" :key="item.id" class="item-ticket">
          <div class="item-info">
            <span class="item-nombre">{{ item.nombre }}</span>
            <span class="item-detalles">{{ item.cantidad }} u. x $ {{ item.precio.toLocaleString('es-AR') }}</span>
          </div>
          <div class="item-subtotal">
            $ {{ (item.precio * item.cantidad).toLocaleString('es-AR') }}
          </div>
          <button @click="$emit('eliminarItem', index)" class="btn-remove">
            &times;
          </button>
        </li>
      </TransitionGroup>
    </div>

    <div class="pie-carrito">
      <div class="fila-total">
        <span>Total a Cobrar</span>
        <span class="total-monto">$ {{ total.toLocaleString('es-AR') }}</span>
      </div>
        <button 
            class="btn-cobrar" 
            :disabled="carrito.length === 0"
            @click="$emit('iniciarCobro')"
            >
            Finalizar Venta
        </button>
    </div>
  </aside>
</template>

<style scoped>
.panel-carrito {
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.cabecera-carrito {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cabecera-carrito h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.contador-items {
  font-size: 0.85rem;
  color: #718096;
  background-color: #edf2f7;
  padding: 3px 10px;
  border-radius: 12px;
}

.cuerpo-carrito {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.carrito-vacio {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #a0aec0;
}

.icono-vacio {
  width: 48px;
  height: 48px;
  margin-bottom: 15px;
  stroke-width: 1;
}

.lista-carrito {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item-ticket {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.item-ticket:hover {
  background-color: #fffaf0; /* Tono beige muy suave */
}

.item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-nombre {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.95rem;
}

.item-detalles {
  color: #718096;
  font-size: 0.8rem;
  margin-top: 2px;
}

.item-subtotal {
  font-weight: 600;
  color: #2d3748;
  margin-right: 15px;
}

.btn-remove {
  background: none;
  border: none;
  color: #fc8181;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0; /* Oculto por defecto */
  transition: opacity 0.2s ease;
  position: absolute;
  right: 15px;
}

.item-ticket:hover .btn-remove {
  opacity: 1; /* Aparece al hover */
}

.pie-carrito {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.fila-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 1rem;
  color: #4a5568;
}

.total-monto {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.btn-cobrar {
  width: 100%;
  padding: 15px;
  background-color: #48bb78; /* Verde éxito */
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cobrar:hover:not(:disabled) {
  background-color: #38a169;
  transform: translateY(-2px);
}

.btn-cobrar:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

/* --- ANIMACIONES DEL CARRITO --- */
.item-carrito-enter-active,
.item-carrito-leave-active {
  transition: all 0.3s ease;
}

.item-carrito-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.item-carrito-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>