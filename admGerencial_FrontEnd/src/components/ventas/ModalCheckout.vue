<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h2>Confirmar Cobro Venta</h2>
        <button class="btn-cerrar-X" @click="emit('close')">&times;</button>
      </header>

      <main class="modal-cuerpo">
        <div class="bloque-total">
          <span class="total-label">TOTAL A COBRAR</span>
          <span class="total-monto">$ {{ total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <div class="form-grupo">
          <label>Documento a Emitir</label>
          <select v-model="tipoComprobante">
            <option value="Ticket">Ticket (Consumidor Final)</option>
            <option value="Factura B">Factura B (Consumidor Final)</option>
            <option value="Factura A">Factura A (Responsable Inscripto)</option>
          </select>
        </div>

        <div v-if="tipoComprobante === 'Factura A'" class="bloque-cliente effecto-aparecer">
          <h4 class="titulo-cliente">Datos del Responsable Inscripto</h4>
          <div class="grid-inputs">
            <div class="form-grupo">
              <label>CUIT *</label>
              <input type="text" v-model="clienteFactura.cuit" placeholder="Ej: 30-12345678-9" />
            </div>
            <div class="form-grupo">
              <label>Razón Social *</label>
              <input type="text" v-model="clienteFactura.razon_social" placeholder="Ej: Empresa SRL" />
            </div>
          </div>
          <div class="form-grupo">
            <label>Domicilio *</label>
            <input type="text" v-model="clienteFactura.domicilio" placeholder="Ej: Sáenz Peña, Chaco" />
          </div>
        </div>

        <hr class="divisor" />

        <div class="form-grupo">
          <label>Método de Pago</label>
          <div class="selector-pago">
            <button 
              class="pilula-pago cash" 
              :class="{ 'activa': metodoPago === 'Efectivo' }" 
              @click="setMetodo('Efectivo')"
            >
              <span class="icono">💵</span>
              <span class="texto">Efectivo</span>
            </button>
            <button 
              class="pilula-pago transfer" 
              :class="{ 'activa': metodoPago === 'Transferencia' }" 
              @click="setMetodo('Transferencia')"
            >
              <span class="icono">📲</span>
              <span class="texto">Transferencia</span>
            </button>
          </div>
        </div>

        <div v-if="metodoPago === 'Efectivo'" class="bloque-entrada effecto-aparecer">
          <div class="form-grupo">
            <label>Monto Recibido (Caja)</label>
            <div class="input-con-prefijo">
              <span class="prefijo">$</span>
              <input 
                ref="inputRecibido"
                type="number" 
                v-model.number="montoRecibido" 
                placeholder="0.00" 
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div class="bloque-vuelto" v-if="montoRecibido >= total">
            <div class="vuelto-item recibio">
              <span class="label">Recibió:</span>
              <span class="monto">$ {{ montoRecibido.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="vuelto-item cambio">
              <span class="label">Vuelto:</span>
              <span class="monto-final">$ {{ vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <div class="advertencia" v-if="montoRecibido < total && montoRecibido > 0">
            ⚠ El monto recibido es menor al total.
          </div>
        </div>

        <div v-if="metodoPago === 'Transferencia'" class="bloque-entrada transfer-info effecto-aparecer">
          <p>Se asume cobro completo por transferencia contable a Banco.</p>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="emit('close')">Cancelar</button>
        <button 
          class="btn-confirmar" 
          :class="claseBotonConfirmar"
          :disabled="!puedeConfirmar" 
          @click="confirmar"
        >
          {{ textoBotonConfirmar }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  carrito: { type: Array, required: true },
  total: { type: Number, required: true }
});

const emit = defineEmits(['close', 'confirmarVenta']);

// Estados reactivos
const tipoComprobante = ref('Ticket');
const metodoPago = ref('Efectivo');
const montoRecibido = ref(0);
const inputRecibido = ref(null);

// Estado para los datos de Factura A
const clienteFactura = ref({
  cuit: '',
  razon_social: '',
  domicilio: ''
});

// Reinicio del formulario al abrir
watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    tipoComprobante.value = 'Ticket';
    metodoPago.value = 'Efectivo';
    montoRecibido.value = props.total;
    clienteFactura.value = { cuit: '', razon_social: '', domicilio: '' };
    
    await nextTick();
    inputRecibido.value?.focus();
    inputRecibido.value?.select();
  }
});

const setMetodo = (metodo) => {
  metodoPago.value = metodo;
  if (metodo === 'Transferencia') {
    montoRecibido.value = props.total;
  } else {
    montoRecibido.value = props.total;
    nextTick(() => inputRecibido.value?.focus());
  }
};

const vuelto = computed(() => {
  if (metodoPago.value === 'Transferencia') return 0;
  return Math.max(0, montoRecibido.value - props.total);
});

// Validación dinámica combinada (Dinero + Datos Fiscales)
const puedeConfirmar = computed(() => {
  // 1. Validar el pago
  let pagoValido = false;
  if (metodoPago.value === 'Transferencia') {
    pagoValido = true;
  } else {
    pagoValido = montoRecibido.value >= props.total;
  }

  // 2. Validar que la Factura A tenga sus datos completos
  let datosFiscalesValidos = true;
  if (tipoComprobante.value === 'Factura A') {
    const c = clienteFactura.value;
    if (!c.cuit.trim() || !c.razon_social.trim() || !c.domicilio.trim()) {
      datosFiscalesValidos = false;
    }
  }

  return pagoValido && datosFiscalesValidos;
});

const claseBotonConfirmar = computed(() => {
  if (metodoPago.value === 'Transferencia') return 'btn-transfer';
  return 'btn-cash';
});

const textoBotonConfirmar = computed(() => {
  if (metodoPago.value === 'Transferencia') return 'Confirmar Transferencia';
  return 'Confirmar Cobro Efectivo';
});

const confirmar = () => {
  if (!puedeConfirmar.value) return;

  // 1. Base compartida por todos los documentos
  const payloadVenta = {
    fecha: new Date().toISOString(),
    tipo_comprobante: tipoComprobante.value,
    metodoPago: metodoPago.value,
    montoRecibido: Number(montoRecibido.value),
    vuelto: Number(vuelto.value),
    total: Number(props.total),
    items: props.carrito.map(item => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  // 2. Inyección dinámica según el comprobante seleccionado
  if (tipoComprobante.value === 'Factura B') {
    payloadVenta.cliente = {
      condicion_iva: "Consumidor Final",
      identificacion: "0"
    };
  } 
  else if (tipoComprobante.value === 'Factura A') {
    // Inyectamos los datos del formulario
    payloadVenta.cliente = {
      condicion_iva: "Responsable Inscripto",
      cuit: clienteFactura.value.cuit.trim(),
      razon_social: clienteFactura.value.razon_social.trim(),
      domicilio: clienteFactura.value.domicilio.trim()
    };
    
    // Cálculo matemático exacto para desglosar el 21% de IVA del total facturado
    const neto = Number((props.total / 1.21).toFixed(2));
    const iva = Number((props.total - neto).toFixed(2));
    
    payloadVenta.impuestos = {
      subtotal_neto: neto,
      iva_21: iva
    };
  }

  // Se envía el paquete ya procesado y estructurado al componente principal
  emit('confirmarVenta', payloadVenta);
};
</script>

<style scoped>
/* GENERAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(17, 24, 39, 0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px); 
}

.modal-contenedor {
  background: #ffffff;
  border-radius: 16px; 
  width: 100%;
  max-width: 480px; 
  max-height: 95vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); 
  border: 1px solid #e5e7eb;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* HEADER */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 10;
}

.modal-header h2 { 
  margin: 0; 
  font-size: 1.25rem; 
  color: #111827; 
  font-weight: 700; 
  letter-spacing: -0.025em;
}

.btn-cerrar-X { 
  background: none; border: none; 
  font-size: 1.75rem; color: #9ca3af; 
  cursor: pointer; 
  transition: color 0.2s;
}

.btn-cerrar-X:hover { color: #ef4444; }

/* CUERPO */
.modal-cuerpo { 
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
}

/* 1. Bloque Total */
.bloque-total {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.total-label { 
  font-size: 0.75rem; 
  font-weight: 600; 
  color: #6b7280; 
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.total-monto { 
  font-size: 2.25rem; 
  font-weight: 800; 
  color: #111827; 
  letter-spacing: -0.05em;
}

/* Formulario General */
.form-grupo { display: flex; flex-direction: column; }

.form-grupo label { 
  font-size: 0.85rem; 
  font-weight: 600; 
  color: #374151; 
  margin-bottom: 0.5rem; 
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

/* Bloque Cliente Factura A */
.bloque-cliente {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.titulo-cliente {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px dashed #cbd5e1;
  padding-bottom: 0.75rem;
}

.grid-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.divisor {
  border: 0;
  border-top: 1px dashed #e5e7eb;
  margin: 0;
}

/* Selector de Pago Visual (PILLS) */
.selector-pago {
  display: flex;
  gap: 1rem;
}

.pilula-pago {
  flex: 1;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.pilula-pago .icono { font-size: 1.75rem; }
.pilula-pago .texto { font-size: 0.95rem; font-weight: 600; color: #4b5563; }

.pilula-pago:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.pilula-pago.cash.activa {
  background: #ecfdf5;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.pilula-pago.cash.activa .texto { color: #065f46; }

.pilula-pago.transfer.activa {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.pilula-pago.transfer.activa .texto { color: #1e40af; }

/* Entradas y Vuelto */
input, select {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
  width: 100%;
}

input:focus, select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-con-prefijo { position: relative; display: flex; align-items: center; }
.prefijo { position: absolute; left: 1rem; color: #9ca3af; font-weight: 500; }
.input-con-prefijo input { padding-left: 2rem; font-weight: 600;}

.transfer-info {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 0.9rem;
  text-align: center;
}

.bloque-vuelto {
  background: #ecfdf5;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #a7f3d0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.vuelto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vuelto-item.recibio { font-size: 0.9rem; color: #065f46; }
.vuelto-item.recibio .monto { font-weight: 600; }

.vuelto-item.cambio { font-size: 1rem; color: #065f46; border-top: 1px dashed #a7f3d0; padding-top: 0.75rem; }
.vuelto-item.cambio .label { font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;}
.vuelto-item.cambio .monto-final { font-size: 1.75rem; font-weight: 800; color: #047857; letter-spacing: -0.05em; }

.advertencia {
  color: #b45309;
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 1rem;
}

/* FOOTER */
.modal-footer {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
}

.btn-cancelar {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancelar:hover { background: #f1f5f9; color: #0f172a;}

.btn-confirmar {
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cash { background: #10b981; }
.btn-cash:hover:not(:disabled) { background: #059669; }

.btn-transfer { background: #3b82f6; }
.btn-transfer:hover:not(:disabled) { background: #2563eb; }

.btn-confirmar:disabled { 
  background: #cbd5e1; 
  color: #94a3b8; 
  cursor: not-allowed; 
}

/* Animaciones */
.effecto-aparecer {
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .grid-inputs {
    grid-template-columns: 1fr;
  }
}
</style>