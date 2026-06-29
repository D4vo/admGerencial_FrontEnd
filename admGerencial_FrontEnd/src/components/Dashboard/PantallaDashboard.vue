<template>
  <div class="dashboard">
    <header class="dash-header">
      <div>
        <h1>Dashboard</h1>
        <p class="dash-sub">Resumen general del sistema contable</p>
      </div>
      <span class="dash-fecha">{{ fechaHoy }}</span>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando indicadores...</div>

    <template v-else-if="data">
      <!-- FILA 1: KPIs -->
      <div class="kpis-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Ventas del mes</span>
            <span :class="['kpi-badge', data.kpis.variacion_ventas >= 0 ? 'badge-up' : 'badge-down']">
              {{ data.kpis.variacion_ventas >= 0 ? '+' : '' }}{{ data.kpis.variacion_ventas }}%
            </span>
          </div>
          <span class="kpi-valor">{{ fmt(data.kpis.ventas_mes) }}</span>
          <span class="kpi-ref">Mes anterior: {{ fmt(data.kpis.ventas_mes_anterior) }}</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Compras del mes</span></div>
          <span class="kpi-valor">{{ fmt(data.kpis.compras_mes) }}</span>
          <span class="kpi-ref">Mercadería adquirida</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header"><span class="kpi-label">Gastos del mes</span></div>
          <span class="kpi-valor">{{ fmt(data.kpis.gastos_mes) }}</span>
          <span class="kpi-ref">Servicios y otros</span>
        </div>

        <div :class="['kpi-card', data.kpis.resultado_periodo >= 0 ? 'kpi-positivo' : 'kpi-negativo']">
          <div class="kpi-header"><span class="kpi-label">Resultado del período</span></div>
          <span class="kpi-valor">{{ fmt(data.kpis.resultado_periodo) }}</span>
          <span class="kpi-ref">{{ data.kpis.resultado_periodo >= 0 ? 'Ganancia' : 'Pérdida' }} antes del cierre</span>
        </div>
      </div>

      <!-- FILA 2: Operativo -->
      <div class="operativo-grid">
        <div class="op-card">
          <div class="op-titulo">Liquidez disponible</div>
          <div class="op-filas">
            <div class="op-fila">
              <span class="op-label">Caja</span>
              <span class="op-valor">{{ fmt(data.liquidez.saldo_caja) }}</span>
            </div>
            <div class="op-fila">
              <span class="op-label">Banco</span>
              <span class="op-valor">{{ fmt(data.liquidez.saldo_banco) }}</span>
            </div>
            <div class="op-fila op-total">
              <span class="op-label">Total disponible</span>
              <span class="op-valor">{{ fmt(data.liquidez.saldo_caja + data.liquidez.saldo_banco) }}</span>
            </div>
          </div>
        </div>

        <div class="op-card">
          <div class="op-titulo">Deuda a proveedores</div>
          <div class="op-monto-grande" :class="data.deuda_proveedores > 0 ? 'monto-deuda' : 'monto-ok'">
            {{ fmt(data.deuda_proveedores) }}
          </div>
          <span class="op-ref">{{ data.deuda_proveedores > 0 ? 'Saldo pendiente total' : 'Sin deudas pendientes' }}</span>
        </div>

        <div class="op-card">
          <div class="op-titulo">Alertas de stock</div>
          <div class="op-monto-grande" :class="data.stock.total_alertas > 0 ? 'monto-alerta' : 'monto-ok'">
            {{ data.stock.total_alertas }}
          </div>
          <span class="op-ref">{{ data.stock.total_alertas > 0 ? 'producto(s) con stock bajo o agotado' : 'Todos los productos con stock suficiente' }}</span>
        </div>
      </div>

      <!-- FILA 3: Tablas -->
      <div class="tablas-grid">
        <div class="tabla-card">
          <div class="tc-titulo">Últimas ventas</div>
          <table v-if="data.ultimas_ventas.length > 0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Comprobante</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in data.ultimas_ventas" :key="v.id">
                <td class="td-fecha">{{ formatFecha(v.fecha) }}</td>
                <td><span class="td-comp">{{ v.tipo_comprobante }}</span> <span class="td-nro">{{ v.nro_comprobante }}</span></td>
                <td class="right td-monto">{{ fmt(v.total) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="tabla-vacia">Sin ventas en el período</div>
        </div>

        <div class="tabla-card">
          <div class="tc-titulo">Productos con stock crítico</div>
          <table v-if="data.stock.productos_criticos.length > 0">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="center">Stock</th>
                <th class="center">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in data.stock.productos_criticos" :key="p.id" :class="p.stock === 0 ? 'fila-critica' : ''">
                <td>{{ p.nombre }}</td>
                <td class="center" :class="p.stock === 0 ? 'stock-cero' : 'stock-bajo'">{{ p.stock }}</td>
                <td class="center td-muted">{{ p.stock_minimo }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="tabla-vacia">Sin alertas de stock</div>
        </div>
      </div>

      <!-- FILA 4: Estado contable -->
      <div class="contable-grid">
        <div class="cont-card">
          <div class="cont-titulo">Último cierre mensual</div>
          <div v-if="data.ultimo_cierre" class="cont-cierre">
            <div class="cont-fila"><span class="cont-label">Período:</span><span class="cont-valor">{{ data.ultimo_cierre.periodo }}</span></div>
            <div class="cont-fila"><span class="cont-label">Fecha:</span><span class="cont-valor">{{ formatFecha(data.ultimo_cierre.fecha_cierre) }}</span></div>
            <div class="cont-fila">
              <span class="cont-label">Resultado:</span>
              <span :class="['cont-valor', data.ultimo_cierre.resultado >= 0 ? 'val-pos' : 'val-neg']">
                {{ fmt(data.ultimo_cierre.resultado) }}
              </span>
            </div>
          </div>
          <div v-else class="tabla-vacia">Sin cierres realizados</div>
        </div>

        <div class="cont-card cont-ecuacion">
          <div class="cont-titulo">Ecuación patrimonial</div>
          <div class="ecuacion-linea">
            <div class="eq-bloque">
              <span class="eq-tipo">Activo</span>
              <span class="eq-monto">{{ fmt(data.ecuacion.activo) }}</span>
            </div>
            <span class="eq-signo">=</span>
            <div class="eq-bloque">
              <span class="eq-tipo">Pasivo</span>
              <span class="eq-monto">{{ fmt(data.ecuacion.pasivo) }}</span>
            </div>
            <span class="eq-signo">+</span>
            <div class="eq-bloque">
              <span class="eq-tipo">Patrimonio Neto</span>
              <span class="eq-monto">{{ fmt(data.ecuacion.patrimonio_neto) }}</span>
            </div>
          </div>
          <div :class="['eq-estado', data.ecuacion.verificada ? 'eq-ok' : 'eq-fail']">
            {{ data.ecuacion.verificada ? 'Verificada' : 'No balancea' }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dashboardService } from '../../services/dashboardService'

const data = ref(null)
const cargando = ref(true)

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const hoy = new Date()
const fechaHoy = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`

const cargar = async () => {
  try {
    cargando.value = true
    data.value = await dashboardService.obtener()
  } catch (e) {
    console.error('Error dashboard:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

const fmt = (v) => '$ ' + Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatFecha = (f) => {
  if (!f) return ''
  const d = new Date(f)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d.toLocaleDateString('es-AR')
}
</script>

<style scoped>
.dashboard { font-family: 'Inter', system-ui, sans-serif; }

.dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
.dash-header h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.dash-sub { margin: 3px 0 0 0; color: #64748b; font-size: 0.92rem; }
.dash-fecha { color: #94a3b8; font-size: 0.85rem; font-weight: 500; }

.estado-mensaje { text-align: center; padding: 4rem; color: #94a3b8; }

/* KPIs */
.kpis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }

.kpi-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 1.15rem 1.25rem; display: flex; flex-direction: column; gap: 0.3rem;
}
.kpi-positivo { border-left: 4px solid #10b981; }
.kpi-negativo { border-left: 4px solid #ef4444; }

.kpi-header { display: flex; justify-content: space-between; align-items: center; }
.kpi-label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
.kpi-badge { font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; }
.badge-up { background: #dcfce7; color: #166534; }
.badge-down { background: #fee2e2; color: #991b1b; }

.kpi-valor { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.kpi-ref { font-size: 0.75rem; color: #94a3b8; }

/* Operativo */
.operativo-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }

.op-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 1.15rem 1.25rem;
}
.op-titulo { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.85rem; }
.op-filas { display: flex; flex-direction: column; gap: 0.5rem; }
.op-fila { display: flex; justify-content: space-between; font-size: 0.9rem; }
.op-label { color: #475569; font-weight: 500; }
.op-valor { color: #0f172a; font-weight: 700; }
.op-total { border-top: 1px solid #e5e7eb; padding-top: 0.5rem; }

.op-monto-grande { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.3rem; }
.monto-deuda { color: #dc2626; }
.monto-alerta { color: #f59e0b; }
.monto-ok { color: #10b981; }
.op-ref { font-size: 0.78rem; color: #94a3b8; }

/* Tablas */
.tablas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }

.tabla-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 1.15rem 1.25rem; overflow: hidden;
}
.tc-titulo { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.85rem; }

table { width: 100%; border-collapse: collapse; }
th { padding: 0.45rem 0.5rem; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e7eb; text-align: left; }
td { padding: 0.55rem 0.5rem; font-size: 0.85rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
tr:last-child td { border-bottom: none; }
.right { text-align: right; }
.center { text-align: center; }

.td-fecha { color: #64748b; font-size: 0.8rem; white-space: nowrap; }
.td-comp { font-weight: 600; color: #0f172a; }
.td-nro { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
.td-monto { font-weight: 700; color: #0f172a; }
.td-muted { color: #94a3b8; }
.fila-critica td { background: #fef2f2; }
.stock-cero { color: #ef4444; font-weight: 700; }
.stock-bajo { color: #f59e0b; font-weight: 700; }

.tabla-vacia { text-align: center; padding: 1.5rem; color: #cbd5e1; font-size: 0.85rem; font-style: italic; }

/* Contable */
.contable-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }

.cont-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 1.15rem 1.25rem;
}
.cont-titulo { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.85rem; }

.cont-cierre { display: flex; flex-direction: column; gap: 0.45rem; }
.cont-fila { display: flex; justify-content: space-between; font-size: 0.88rem; }
.cont-label { color: #64748b; font-weight: 500; }
.cont-valor { color: #0f172a; font-weight: 700; }
.val-pos { color: #059669; }
.val-neg { color: #dc2626; }

/* Ecuación */
.ecuacion-linea { display: flex; align-items: center; justify-content: center; gap: 0.85rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
.eq-bloque { display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 1rem; min-width: 120px; }
.eq-tipo { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
.eq-monto { font-size: 1rem; font-weight: 800; color: #0f172a; margin-top: 0.2rem; }
.eq-signo { font-size: 1.2rem; font-weight: 800; color: #64748b; }
.eq-estado { text-align: center; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 6px; display: inline-block; }
.cont-ecuacion { text-align: center; }
.eq-ok { background: #dcfce7; color: #166534; }
.eq-fail { background: #fee2e2; color: #991b1b; }

@media (max-width: 1100px) { .kpis-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 800px) {
  .kpis-grid, .operativo-grid, .tablas-grid, .contable-grid { grid-template-columns: 1fr; }
}
</style>
