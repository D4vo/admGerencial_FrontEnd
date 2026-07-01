<template>
  <div class="modulo-balance">
    <header class="cabecera-modulo">
      <div>
        <h1>Balance General</h1>
        <p class="subtitulo">Estado de Situación Patrimonial</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button :class="['tab', { activo: modo === 'simple' }]" @click="modo = 'simple'">Balance</button>
        <button :class="['tab', { activo: modo === 'comparativo' }]" @click="modo = 'comparativo'">Comparativo</button>
      </div>
    </header>

    <!-- ===================== MODO SIMPLE ===================== -->
    <template v-if="modo === 'simple'">
      <div class="barra-fecha">
        <div class="fecha-grupo">
          <label>Estado patrimonial al</label>
          <input type="date" v-model="fechaCorte" />
        </div>
        <button class="btn-generar" @click="cargarBalance">Generar Balance</button>
      </div>

      <div v-if="cargando" class="estado-mensaje">Calculando balance...</div>
      <div v-else-if="!balance" class="estado-mensaje">Seleccione una fecha y genere el balance.</div>

      <template v-else>
        <div class="reporte-header">
          <div class="reporte-titulo">Estado de Situación Patrimonial</div>
          <div class="reporte-fecha">Al {{ formatearFecha(balance.fecha_corte) }}</div>
        </div>

        <div class="balance-layout">
          <!-- ACTIVO -->
          <div class="balance-columna">
            <div class="col-header activo-header"><span class="col-titulo">Activo</span></div>
            <div class="col-body">
              <div v-for="c in balance.activo.cuentas" :key="c.cuenta_id" class="cuenta-fila">
                <div class="cuenta-info">
                  <span class="cuenta-codigo">{{ c.codigo }}</span>
                  <span class="cuenta-nombre">{{ c.nombre }}</span>
                </div>
                <span class="cuenta-saldo">{{ fmt(c.saldo) }}</span>
              </div>
              <div v-if="balance.activo.cuentas.length === 0" class="sin-cuentas">Sin cuentas de activo con saldo</div>
            </div>
            <div class="col-total activo-total">
              <span>Total Activo</span>
              <span class="total-monto">{{ fmt(balance.activo.total) }}</span>
            </div>
          </div>

          <!-- PASIVO + PN -->
          <div class="balance-columna">
            <div class="col-header pasivo-header"><span class="col-titulo">Pasivo</span></div>
            <div class="col-body">
              <div v-for="c in balance.pasivo.cuentas" :key="c.cuenta_id" class="cuenta-fila">
                <div class="cuenta-info">
                  <span class="cuenta-codigo">{{ c.codigo }}</span>
                  <span class="cuenta-nombre">{{ c.nombre }}</span>
                </div>
                <span class="cuenta-saldo">{{ fmt(c.saldo) }}</span>
              </div>
              <div v-if="balance.pasivo.cuentas.length === 0" class="sin-cuentas">Sin cuentas de pasivo con saldo</div>
            </div>
            <div class="col-subtotal"><span>Total Pasivo</span><span>{{ fmt(balance.pasivo.total) }}</span></div>

            <div class="col-header pn-header"><span class="col-titulo">Patrimonio Neto</span></div>
            <div class="col-body">
              <div v-for="c in balance.patrimonio_neto.cuentas" :key="c.cuenta_id" class="cuenta-fila">
                <div class="cuenta-info">
                  <span class="cuenta-codigo">{{ c.codigo }}</span>
                  <span class="cuenta-nombre">{{ c.nombre }}</span>
                </div>
                <span class="cuenta-saldo">{{ fmt(c.saldo) }}</span>
              </div>
              <div v-if="balance.patrimonio_neto.resultado_ejercicio !== 0" class="cuenta-fila cuenta-resultado">
                <div class="cuenta-info">
                  <span class="cuenta-codigo"></span>
                  <span class="cuenta-nombre resultado-label">
                    {{ balance.patrimonio_neto.resultado_ejercicio >= 0 ? 'Resultado positivo del ejercicio' : 'Resultado negativo del ejercicio' }}
                  </span>
                </div>
                <span :class="['cuenta-saldo', balance.patrimonio_neto.resultado_ejercicio >= 0 ? 'saldo-positivo' : 'saldo-negativo']">
                  {{ fmt(balance.patrimonio_neto.resultado_ejercicio) }}
                </span>
              </div>
            </div>
            <div class="col-subtotal"><span>Total Patrimonio Neto</span><span>{{ fmt(balance.patrimonio_neto.total) }}</span></div>

            <div class="col-total pasivo-total">
              <span>Total Pasivo + Patrimonio Neto</span>
              <span class="total-monto">{{ fmt(balance.total_pasivo_patrimonio) }}</span>
            </div>
          </div>
        </div>

        <!-- Ecuación -->
        <div :class="['ecuacion-box', balance.ecuacion_verificada ? 'ecuacion-ok' : 'ecuacion-error']">
          <div class="ecuacion-formula">
            <span class="eq-term">Activo {{ fmt(balance.activo.total) }}</span>
            <span class="eq-signo">=</span>
            <span class="eq-term">Pasivo {{ fmt(balance.pasivo.total) }}</span>
            <span class="eq-signo">+</span>
            <span class="eq-term">P. Neto {{ fmt(balance.patrimonio_neto.total) }}</span>
          </div>
          <div class="ecuacion-estado">
            <span v-if="balance.ecuacion_verificada" class="eq-ok">Ecuación patrimonial verificada</span>
            <span v-else class="eq-fail">Diferencia: {{ fmt(Math.abs(balance.activo.total - balance.total_pasivo_patrimonio)) }}</span>
          </div>
        </div>
      </template>
    </template>

    <!-- ===================== MODO COMPARATIVO ===================== -->
    <template v-if="modo === 'comparativo'">
      <div class="barra-fecha">
        <div class="fecha-grupo">
          <label>Período 1 (al)</label>
          <input type="date" v-model="compFecha1" />
        </div>
        <div class="fecha-grupo">
          <label>Período 2 (al)</label>
          <input type="date" v-model="compFecha2" />
        </div>
        <button class="btn-generar" :disabled="!compFecha1 || !compFecha2" @click="cargarComparativo">Comparar</button>
      </div>

      <div v-if="cargandoComp" class="estado-mensaje">Calculando balances...</div>
      <div v-else-if="!comp" class="estado-mensaje">Seleccione dos fechas de corte para comparar.</div>

      <template v-else>
        <div class="reporte-header">
          <div class="reporte-titulo">Balance Comparativo</div>
          <div class="reporte-fecha">{{ formatearFecha(comp.fecha1) }} vs {{ formatearFecha(comp.fecha2) }}</div>
        </div>

        <!-- Tabla comparativa -->
        <div class="comp-card">
          <!-- ACTIVO -->
          <div class="comp-seccion-header activo-header"><span class="col-titulo">Activo</span></div>
          <table class="comp-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cuenta</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha1) }}</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha2) }}</th>
                <th class="text-right">Variación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in comp.activo" :key="c.codigo">
                <td class="cuenta-codigo">{{ c.codigo }}</td>
                <td>{{ c.nombre }}</td>
                <td class="text-right">{{ fmt(c.saldo1) }}</td>
                <td class="text-right">{{ fmt(c.saldo2) }}</td>
                <td :class="['text-right', 'variacion', c.variacion > 0 ? 'var-pos' : c.variacion < 0 ? 'var-neg' : '']">
                  {{ c.variacion > 0 ? '+' : '' }}{{ fmt(c.variacion) }}
                </td>
              </tr>
              <tr v-if="comp.activo.length === 0"><td colspan="5" class="sin-datos">Sin cuentas con saldo</td></tr>
            </tbody>
            <tfoot>
              <tr class="fila-total">
                <td colspan="2">Total Activo</td>
                <td class="text-right">{{ fmt(comp.total_activo1) }}</td>
                <td class="text-right">{{ fmt(comp.total_activo2) }}</td>
                <td :class="['text-right', 'variacion', comp.var_activo > 0 ? 'var-pos' : comp.var_activo < 0 ? 'var-neg' : '']">
                  {{ comp.var_activo > 0 ? '+' : '' }}{{ fmt(comp.var_activo) }}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- PASIVO -->
          <div class="comp-seccion-header pasivo-header"><span class="col-titulo">Pasivo</span></div>
          <table class="comp-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cuenta</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha1) }}</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha2) }}</th>
                <th class="text-right">Variación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in comp.pasivo" :key="c.codigo">
                <td class="cuenta-codigo">{{ c.codigo }}</td>
                <td>{{ c.nombre }}</td>
                <td class="text-right">{{ fmt(c.saldo1) }}</td>
                <td class="text-right">{{ fmt(c.saldo2) }}</td>
                <td :class="['text-right', 'variacion', c.variacion > 0 ? 'var-pos' : c.variacion < 0 ? 'var-neg' : '']">
                  {{ c.variacion > 0 ? '+' : '' }}{{ fmt(c.variacion) }}
                </td>
              </tr>
              <tr v-if="comp.pasivo.length === 0"><td colspan="5" class="sin-datos">Sin cuentas con saldo</td></tr>
            </tbody>
            <tfoot>
              <tr class="fila-total">
                <td colspan="2">Total Pasivo</td>
                <td class="text-right">{{ fmt(comp.total_pasivo1) }}</td>
                <td class="text-right">{{ fmt(comp.total_pasivo2) }}</td>
                <td :class="['text-right', 'variacion', comp.var_pasivo > 0 ? 'var-pos' : comp.var_pasivo < 0 ? 'var-neg' : '']">
                  {{ comp.var_pasivo > 0 ? '+' : '' }}{{ fmt(comp.var_pasivo) }}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- PATRIMONIO NETO -->
          <div class="comp-seccion-header pn-header"><span class="col-titulo">Patrimonio Neto</span></div>
          <table class="comp-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cuenta</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha1) }}</th>
                <th class="text-right">{{ formatFechaCorta(comp.fecha2) }}</th>
                <th class="text-right">Variación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in comp.patrimonio" :key="c.codigo">
                <td class="cuenta-codigo">{{ c.codigo }}</td>
                <td>{{ c.nombre }}</td>
                <td class="text-right">{{ fmt(c.saldo1) }}</td>
                <td class="text-right">{{ fmt(c.saldo2) }}</td>
                <td :class="['text-right', 'variacion', c.variacion > 0 ? 'var-pos' : c.variacion < 0 ? 'var-neg' : '']">
                  {{ c.variacion > 0 ? '+' : '' }}{{ fmt(c.variacion) }}
                </td>
              </tr>
              <tr v-if="comp.resultado1 !== 0 || comp.resultado2 !== 0" class="fila-resultado">
                <td class="cuenta-codigo"></td>
                <td class="resultado-label">Resultado del ejercicio</td>
                <td class="text-right">{{ fmt(comp.resultado1) }}</td>
                <td class="text-right">{{ fmt(comp.resultado2) }}</td>
                <td :class="['text-right', 'variacion', (comp.resultado2 - comp.resultado1) > 0 ? 'var-pos' : (comp.resultado2 - comp.resultado1) < 0 ? 'var-neg' : '']">
                  {{ (comp.resultado2 - comp.resultado1) > 0 ? '+' : '' }}{{ fmt(comp.resultado2 - comp.resultado1) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="fila-total">
                <td colspan="2">Total Patrimonio Neto</td>
                <td class="text-right">{{ fmt(comp.total_pn1) }}</td>
                <td class="text-right">{{ fmt(comp.total_pn2) }}</td>
                <td :class="['text-right', 'variacion', comp.var_pn > 0 ? 'var-pos' : comp.var_pn < 0 ? 'var-neg' : '']">
                  {{ comp.var_pn > 0 ? '+' : '' }}{{ fmt(comp.var_pn) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { contabilidadService } from '../../services/contabilidadService'
import { fechaLocalHoy } from '../../utils/fecha'

const modo = ref('simple')

// ===== SIMPLE =====
const fechaCorte = ref(fechaLocalHoy())
const balance = ref(null)
const cargando = ref(false)

const cargarBalance = async () => {
  cargando.value = true
  try {
    balance.value = await contabilidadService.obtenerBalance(fechaCorte.value)
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    cargando.value = false
  }
}
onMounted(cargarBalance)

// ===== COMPARATIVO =====
const compFecha1 = ref('')
const compFecha2 = ref('')
const comp = ref(null)
const cargandoComp = ref(false)

const cargarComparativo = async () => {
  cargandoComp.value = true
  comp.value = null
  try {
    const [b1, b2] = await Promise.all([
      contabilidadService.obtenerBalance(compFecha1.value),
      contabilidadService.obtenerBalance(compFecha2.value),
    ])
    comp.value = buildComparativo(b1, b2)
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    cargandoComp.value = false
  }
}

function buildComparativo(b1, b2) {
  const merge = (arr1, arr2) => {
    const map = new Map()
    for (const c of arr1) map.set(c.codigo, { codigo: c.codigo, nombre: c.nombre, saldo1: c.saldo, saldo2: 0 })
    for (const c of arr2) {
      if (map.has(c.codigo)) {
        map.get(c.codigo).saldo2 = c.saldo
      } else {
        map.set(c.codigo, { codigo: c.codigo, nombre: c.nombre, saldo1: 0, saldo2: c.saldo })
      }
    }
    const list = [...map.values()].sort((a, b) => a.codigo.localeCompare(b.codigo))
    list.forEach((c) => (c.variacion = round2(c.saldo2 - c.saldo1)))
    return list
  }

  const round2 = (v) => Math.round(v * 100) / 100

  return {
    fecha1: b1.fecha_corte,
    fecha2: b2.fecha_corte,
    activo: merge(b1.activo.cuentas, b2.activo.cuentas),
    pasivo: merge(b1.pasivo.cuentas, b2.pasivo.cuentas),
    patrimonio: merge(b1.patrimonio_neto.cuentas, b2.patrimonio_neto.cuentas),
    resultado1: b1.patrimonio_neto.resultado_ejercicio,
    resultado2: b2.patrimonio_neto.resultado_ejercicio,
    total_activo1: b1.activo.total,
    total_activo2: b2.activo.total,
    var_activo: round2(b2.activo.total - b1.activo.total),
    total_pasivo1: b1.pasivo.total,
    total_pasivo2: b2.pasivo.total,
    var_pasivo: round2(b2.pasivo.total - b1.pasivo.total),
    total_pn1: b1.patrimonio_neto.total,
    total_pn2: b2.patrimonio_neto.total,
    var_pn: round2(b2.patrimonio_neto.total - b1.patrimonio_neto.total),
  }
}

// ===== Helpers =====
const fmt = (v) => '$ ' + Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatearFecha = (s) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`
}

const formatFechaCorta = (s) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

</script>

<style scoped>
.modulo-balance { padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }

/* Tabs */
.tabs { display: flex; gap: 0.25rem; background: #f1f5f9; border-radius: 10px; padding: 0.2rem; }
.tab {
  padding: 0.45rem 1rem; border: none; border-radius: 8px; background: transparent;
  font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s;
}
.tab:hover { color: #334155; }
.tab.activo { background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

/* Barra fecha */
.barra-fecha { display: flex; align-items: flex-end; gap: 0.85rem; margin-bottom: 1.5rem; background: #fff; padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid #e5e7eb; }
.fecha-grupo { display: flex; flex-direction: column; }
.fecha-grupo label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3rem; }
.fecha-grupo input { padding: 0.5rem 0.7rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.88rem; outline: none; }
.fecha-grupo input:focus { border-color: #3b82f6; }
.btn-generar { padding: 0.5rem 1.25rem; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-generar:hover:not(:disabled) { background: #1e293b; }
.btn-generar:disabled { background: #cbd5e1; cursor: not-allowed; }
.estado-mensaje { text-align: center; padding: 3rem; color: #94a3b8; background: #f8fafc; border-radius: 10px; border: 1px dashed #e2e8f0; }

/* Reporte header */
.reporte-header { text-align: center; padding: 1.25rem; margin-bottom: 1.5rem; background: #0f172a; border-radius: 10px; color: #fff; }
.reporte-titulo { font-size: 1.1rem; font-weight: 700; }
.reporte-fecha { font-size: 0.85rem; color: #94a3b8; margin-top: 0.25rem; }

/* Balance simple */
.balance-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
.balance-columna { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; display: flex; flex-direction: column; }
.col-header { padding: 0.75rem 1.25rem; }
.col-titulo { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.activo-header { background: #ecfdf5; color: #065f46; border-bottom: 2px solid #a7f3d0; }
.pasivo-header { background: #fef2f2; color: #991b1b; border-bottom: 2px solid #fecaca; }
.pn-header { background: #ede9fe; color: #5b21b6; border-bottom: 2px solid #c4b5fd; border-top: 1px solid #e5e7eb; }
.col-body { padding: 0.5rem 0; flex-grow: 1; }
.cuenta-fila { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 1.25rem; transition: background 0.12s; }
.cuenta-fila:hover { background: #f8fafc; }
.cuenta-info { display: flex; align-items: center; gap: 0.65rem; flex: 1; min-width: 0; }
.cuenta-codigo { font-family: 'Courier New', monospace; font-size: 0.8rem; color: #94a3b8; min-width: 60px; }
.cuenta-nombre { font-size: 0.88rem; color: #334155; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cuenta-saldo { font-size: 0.9rem; font-weight: 600; color: #0f172a; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cuenta-resultado { border-top: 1px dashed #e2e8f0; margin-top: 0.25rem; padding-top: 0.65rem; }
.resultado-label { font-style: italic; color: #64748b; }
.saldo-positivo { color: #059669; }
.saldo-negativo { color: #dc2626; }
.sin-cuentas { padding: 1.5rem; text-align: center; color: #cbd5e1; font-size: 0.85rem; font-style: italic; }
.col-subtotal { display: flex; justify-content: space-between; padding: 0.65rem 1.25rem; background: #f8fafc; border-top: 1px solid #e5e7eb; font-size: 0.85rem; font-weight: 600; color: #475569; }
.col-total { display: flex; justify-content: space-between; padding: 0.85rem 1.25rem; font-weight: 700; font-size: 0.95rem; }
.activo-total { background: #065f46; color: #fff; }
.pasivo-total { background: #1e293b; color: #fff; border-top: 2px solid #334155; }
.total-monto { font-size: 1.1rem; font-weight: 800; }

/* Ecuacion */
.ecuacion-box { border-radius: 10px; padding: 1.15rem 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.ecuacion-ok { background: #ecfdf5; border: 1px solid #a7f3d0; }
.ecuacion-error { background: #fef2f2; border: 1px solid #fecaca; }
.ecuacion-formula { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
.eq-term { font-size: 0.92rem; font-weight: 700; color: #0f172a; background: #fff; padding: 0.3rem 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; }
.eq-signo { font-size: 1.1rem; font-weight: 800; color: #64748b; }
.ecuacion-estado { font-size: 0.82rem; font-weight: 600; }
.eq-ok { color: #065f46; }
.eq-fail { color: #991b1b; }

/* ===== COMPARATIVO ===== */
.comp-card {
  background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
  overflow: hidden; margin-bottom: 1.25rem;
}

.comp-seccion-header { padding: 0.65rem 1.25rem; }

.comp-tabla { width: 100%; border-collapse: collapse; }
.comp-tabla th {
  padding: 0.6rem 1rem; font-size: 0.72rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}
.comp-tabla td {
  padding: 0.6rem 1rem; font-size: 0.88rem; color: #334155;
  border-bottom: 1px solid #f1f5f9; vertical-align: middle;
}
.comp-tabla tbody tr:hover td { background: #f8fafc; }
.text-right { text-align: right; }

.comp-tabla .cuenta-codigo { font-family: 'Courier New', monospace; font-size: 0.8rem; color: #94a3b8; }

.variacion { font-weight: 700; }
.var-pos { color: #059669; }
.var-neg { color: #dc2626; }

.fila-total td {
  background: #f1f5f9; font-weight: 700; color: #0f172a;
  border-top: 2px solid #e2e8f0; font-size: 0.9rem; padding: 0.75rem 1rem;
}

.fila-resultado td { border-top: 1px dashed #e2e8f0; font-style: italic; color: #64748b; }
.fila-resultado .resultado-label { font-style: italic; }

.sin-datos { text-align: center; padding: 1.5rem; color: #cbd5e1; font-style: italic; }

@media (max-width: 900px) { .balance-layout { grid-template-columns: 1fr; } }
</style>
