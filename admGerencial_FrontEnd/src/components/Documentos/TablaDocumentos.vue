<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th class="col-expand"></th>
          <th class="col-fecha">Fecha</th>
          <th class="col-operacion">Tipo</th>
          <th class="col-comprobante">Comprobante</th>
          <th class="col-entidad">Entidad</th>
          <th class="col-monto">Total</th>
          <th class="col-notas">Notas</th>
          <th class="col-accion"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="doc in documentos" :key="doc.id">
          <!-- Fila principal -->
          <tr
            :class="['fila-doc', { 'fila-nota': esNota(doc), 'fila-expandida': expandido === doc.id }]"
            @click="toggleExpandir(doc)"
          >
            <td class="col-expand">
              <span v-if="tieneDetalle(doc)" class="chevron" :class="{ abierto: expandido === doc.id }">›</span>
            </td>
            <td class="col-fecha">{{ formatearFecha(doc.fecha_emision) }}</td>
            <td class="col-operacion">
              <span :class="['badge', badgeClass(doc)]">{{ doc.tipo_operacion }}</span>
            </td>
            <td class="col-comprobante">
              <span class="tipo-comprobante">{{ doc.tipo_comprobante }}</span>
              <span class="nro-comprobante">{{ doc.nro_comprobante }}</span>
            </td>
            <td class="col-entidad">
              <span>{{ doc.entidad_nombre || '-' }}</span>
              <span v-if="doc.comprobante_padre_id" class="ref-padre">
                Ref: Doc #{{ doc.comprobante_padre_id }}
              </span>
            </td>
            <td class="col-monto">
              $ {{ Number(doc.total).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
            </td>
            <td class="col-notas">
              <span v-if="doc.cantidad_notas > 0" class="badge-notas">
                {{ doc.cantidad_notas }}
              </span>
            </td>
            <td class="col-accion" @click.stop>
              <button
                v-if="puedeGenerarNota(doc)"
                class="btn-accion"
                @click="emit('generarNota', doc)"
              >
                {{ doc.tipo_operacion === 'Compra' ? 'Registrar Nota' : 'Emitir Nota' }}
              </button>
            </td>
          </tr>

          <!-- Fila de detalle desplegable -->
          <tr v-if="expandido === doc.id" class="fila-detalle">
            <td :colspan="8">
              <div class="detalle-contenido">

                <!-- ===== DETALLE DE NOTA (NC/ND) ===== -->
                <template v-if="esNota(doc) && doc.padre_info">
                  <div class="detalle-nota">
                    <h4>Detalle de la nota</h4>

                    <div class="nota-ref-padre">
                      <div class="nota-ref-titulo">Documento original ajustado</div>
                      <div class="nota-ref-grid">
                        <div class="nota-ref-item">
                          <span class="nr-label">Operación:</span>
                          <span class="nr-valor">{{ doc.padre_info.tipo_operacion }}</span>
                        </div>
                        <div class="nota-ref-item">
                          <span class="nr-label">Comprobante:</span>
                          <span class="nr-valor">{{ doc.padre_info.tipo_comprobante }} N° {{ doc.padre_info.nro_comprobante }}</span>
                        </div>
                        <div class="nota-ref-item">
                          <span class="nr-label">Fecha original:</span>
                          <span class="nr-valor">{{ formatearFecha(doc.padre_info.fecha_emision) }}</span>
                        </div>
                        <div class="nota-ref-item">
                          <span class="nr-label">Total original:</span>
                          <span class="nr-valor">$ {{ Number(doc.padre_info.total).toFixed(2) }}</span>
                        </div>
                        <div v-if="doc.padre_info.entidad" class="nota-ref-item">
                          <span class="nr-label">Entidad:</span>
                          <span class="nr-valor">{{ doc.padre_info.entidad }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="nota-resumen-ajuste">
                      <div class="nota-resumen-titulo">Resumen del ajuste</div>
                      <div class="nota-resumen-filas">
                        <div class="nota-resumen-fila">
                          <span class="nr-label">Tipo de nota:</span>
                          <span :class="['nr-valor', esNotaCredito(doc) ? 'color-credito' : 'color-debito']">
                            {{ doc.tipo_comprobante }}
                          </span>
                        </div>
                        <div v-if="doc.nota_motivo" class="nota-resumen-fila">
                          <span class="nr-label">Motivo:</span>
                          <span class="nr-valor">{{ doc.nota_motivo }}</span>
                        </div>
                        <div class="nota-resumen-fila">
                          <span class="nr-label">Monto ajustado:</span>
                          <span class="nr-valor nr-monto">$ {{ Number(doc.total).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- ===== DETALLE DE ITEMS (VENTAS/COMPRAS) ===== -->
                <template v-else-if="doc.items_originales && doc.items_originales.length > 0">
                  <div class="detalle-items">
                    <h4>Detalle de {{ doc.tipo_operacion === 'Venta' ? 'productos vendidos' : 'productos comprados' }}</h4>
                    <table class="tabla-detalle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th class="text-center">Cantidad</th>
                          <th class="text-right">{{ doc.tipo_operacion === 'Compra' ? 'Costo Unit.' : 'Precio Unit.' }}</th>
                          <th class="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in doc.items_originales" :key="item.producto_id">
                          <td>{{ item.nombre }}</td>
                          <td class="text-center">{{ item.cantidad }}</td>
                          <td class="text-right">$ {{ Number(item.precio_unitario).toFixed(2) }}</td>
                          <td class="text-right font-semi">$ {{ (item.cantidad * item.precio_unitario).toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>

                <!-- ===== DETALLE DE GASTO ===== -->
                <template v-else-if="doc.gasto_descripcion">
                  <div class="detalle-gasto">
                    <h4>Detalle del gasto</h4>
                    <div class="info-gasto">
                      <div class="info-fila">
                        <span class="info-label">Descripción:</span>
                        <span>{{ doc.gasto_descripcion }}</span>
                      </div>
                      <div class="info-fila">
                        <span class="info-label">Cuenta contable:</span>
                        <span>{{ doc.gasto_cuenta_codigo }} - {{ doc.gasto_cuenta_nombre }}</span>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- ===== PAGO O SIN DETALLE ===== -->
                <template v-else>
                  <div class="detalle-vacio">
                    <span>{{ doc.tipo_operacion === 'Pago' ? 'Pago registrado contra cuenta de proveedor.' : 'Documento sin detalle de productos.' }}</span>
                  </div>
                </template>

                <!-- Info del proveedor si existe -->
                <div v-if="doc.proveedor_nombre" class="info-proveedor-detalle">
                  <span class="info-label">Proveedor:</span>
                  <span>{{ doc.proveedor_nombre }}</span>
                </div>
              </div>
            </td>
          </tr>
        </template>

        <tr v-if="documentos.length === 0">
          <td colspan="8" class="sin-datos">No hay documentos que coincidan con la búsqueda.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  documentos: { type: Array, required: true },
})

const emit = defineEmits(['generarNota'])
const expandido = ref(null)

const toggleExpandir = (doc) => {
  if (!tieneDetalle(doc)) return
  expandido.value = expandido.value === doc.id ? null : doc.id
}

const tieneDetalle = (doc) => {
  return (
    (doc.items_originales && doc.items_originales.length > 0) ||
    doc.gasto_descripcion ||
    doc.tipo_operacion === 'Pago' ||
    (esNota(doc) && doc.padre_info)
  )
}

const esNota = (doc) => {
  return doc.comprobante_padre_id !== null && doc.comprobante_padre_id !== undefined
}

const esNotaCredito = (doc) => {
  return doc.tipo_comprobante?.toLowerCase().includes('crédito') || doc.tipo_comprobante?.toLowerCase().includes('credito')
}

const puedeGenerarNota = (doc) => {
  return (
    (doc.tipo_operacion === 'Venta' || doc.tipo_operacion === 'Compra') &&
    !esNota(doc)
  )
}

const badgeClass = (doc) => {
  if (esNota(doc)) return 'badge-nota'
  switch (doc.tipo_operacion) {
    case 'Venta': return 'badge-venta'
    case 'Compra': return 'badge-compra'
    case 'Gasto': return 'badge-gasto'
    case 'Pago': return 'badge-pago'
    default: return 'badge-otro'
  }
}

const formatearFecha = (fechaString) => {
  if (!fechaString) return ''
  const fecha = new Date(fechaString)
  fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset())
  return fecha.toLocaleDateString('es-AR')
}
</script>

<style scoped>
.card-tabla {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead th {
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

tbody td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.9rem;
  vertical-align: middle;
}

.fila-doc {
  cursor: pointer;
  transition: background 0.15s;
}
.fila-doc:hover td { background: #f8fafc; }
.fila-expandida td { background: #f1f5f9; }
.fila-nota td { opacity: 0.85; }

.col-expand { width: 32px; text-align: center; }
.chevron {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: bold;
  color: #94a3b8;
  transition: transform 0.2s;
  user-select: none;
}
.chevron.abierto { transform: rotate(90deg); color: #3b82f6; }

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.badge-venta { background: #dcfce7; color: #166534; }
.badge-compra { background: #dbeafe; color: #1e40af; }
.badge-gasto { background: #ffedd5; color: #9a3412; }
.badge-pago { background: #ede9fe; color: #5b21b6; }
.badge-nota { background: #f1f5f9; color: #475569; }
.badge-otro { background: #f3f4f6; color: #6b7280; }

.badge-notas {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.7rem;
  font-weight: 700;
}

.col-comprobante { min-width: 140px; }
.tipo-comprobante { display: block; font-weight: 600; color: #0f172a; font-size: 0.88rem; }
.nro-comprobante { font-family: 'Courier New', monospace; font-size: 0.8rem; color: #94a3b8; }

.col-entidad { min-width: 140px; }
.ref-padre { display: block; font-size: 0.75rem; color: #94a3b8; font-style: italic; margin-top: 2px; }

.col-monto { text-align: right; font-weight: 700; color: #0f172a; white-space: nowrap; }
.col-notas { text-align: center; width: 50px; }

.col-accion { text-align: right; width: 130px; }
.btn-accion {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #3b82f6;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-accion:hover { background: #eff6ff; border-color: #93c5fd; }

/* Detalle desplegable */
.fila-detalle td { padding: 0; background: #fafbfc; }

.detalle-contenido {
  padding: 1rem 1.25rem 1.25rem 3rem;
  border-top: 1px solid #e2e8f0;
  animation: slideDown 0.2s ease-out;
}

.detalle-items h4,
.detalle-gasto h4,
.detalle-nota h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Tabla detalle items */
.tabla-detalle { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
.tabla-detalle th {
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
  background: transparent;
}
.tabla-detalle td {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}
.text-center { text-align: center; }
.text-right { text-align: right; }
.font-semi { font-weight: 600; }

/* Detalle gasto */
.info-gasto {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.info-fila { display: flex; gap: 0.5rem; font-size: 0.88rem; color: #334155; }
.info-label { font-weight: 600; color: #64748b; min-width: 130px; flex-shrink: 0; }

.info-proveedor-detalle {
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #475569;
  display: flex;
  gap: 0.5rem;
}

.detalle-vacio { padding: 0.75rem 0; color: #94a3b8; font-size: 0.88rem; font-style: italic; }

/* ===== Detalle de NOTA (NC/ND) ===== */
.detalle-nota {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.nota-ref-padre {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.nota-ref-titulo,
.nota-resumen-titulo {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.nota-ref-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem 1.5rem;
}

.nota-ref-item {
  display: flex;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.nr-label { color: #64748b; font-weight: 500; }
.nr-valor { color: #0f172a; font-weight: 600; }

.nota-resumen-ajuste {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.nota-resumen-filas {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nota-resumen-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
}

.color-credito { color: #dc2626; }
.color-debito { color: #2563eb; }
.nr-monto { font-weight: 700; font-size: 1rem; }

.col-fecha { white-space: nowrap; color: #64748b; font-size: 0.85rem; }
.sin-datos { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
