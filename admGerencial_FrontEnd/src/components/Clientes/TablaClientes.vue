<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th>CUIT / DNI</th>
          <th>Razón Social / Nombre</th>
          <th>Condición IVA</th>
          <th>Domicilio Fiscal</th>
          <th>Teléfono</th>
          <th>Estado</th>
          <th class="col-accion">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cliente, index) in clientes" :key="index" :class="{ 'fila-inactiva': cliente.activo === false }">
          <td class="font-mono">{{ cliente.cuit }}</td>
          <td class="font-bold">{{ cliente.razon_social }}</td>
          <td>
            <span class="badge" :class="claseBadge(cliente.condicion_iva)">
              {{ cliente.condicion_iva }}
            </span>
          </td>
          <td class="texto-muted">{{ cliente.domicilio_fiscal || '---' }}</td>
          <td class="texto-muted">{{ cliente.telefono || '---' }}</td>
          <td>
            <span class="badge-estado" :class="cliente.activo === false ? 'badge-inactivo' : 'badge-activo'">
              {{ cliente.activo === false ? 'Inactivo' : 'Activo' }}
            </span>
          </td>
          <td class="col-accion">
            <span v-if="cliente.cuit === '00000000000'" class="badge-sistema">Sistema</span>
            <template v-else>
              <button class="btn-edit" @click="emit('editar', cliente)">Editar</button>
              <button v-if="cliente.activo === false" class="btn-reactivar" @click="emit('cambiar-estado', cliente)">Reactivar</button>
              <button v-else class="btn-baja" @click="emit('cambiar-estado', cliente)">Dar de baja</button>
            </template>
          </td>
        </tr>
        <tr v-if="clientes.length === 0">
          <td colspan="7" class="sin-datos">No hay clientes registrados en el sistema.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  clientes: { type: Array, required: true }
});

const emit = defineEmits(['cambiar-estado', 'editar']);

const claseBadge = (condicion) => {
  switch(condicion) {
    case 'Responsable Inscripto': return 'badge-ri';
    case 'Monotributista': return 'badge-mt';
    case 'Exento': return 'badge-ex';
    default: return 'badge-cf';
  }
};
</script>

<style scoped>
.card-tabla { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 1rem 1.5rem; background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
tr:hover td { background-color: #f8fafc; }

.font-mono { font-family: 'Courier New', Courier, monospace; color: #475569; font-size: 0.95rem; font-weight: 600; }
.font-bold { font-weight: 700; color: #0f172a; }
.texto-muted { color: #94a3b8; font-size: 0.9rem; }
.col-accion { text-align: right; }

.badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.badge-ri { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.badge-mt { background: #fef08a; color: #b45309; border: 1px solid #fde047; }
.badge-ex { background: #f3f4f6; color: #475569; border: 1px solid #e2e8f0; }
.badge-cf { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

.badge-sistema { background: #e2e8f0; color: #64748b; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
.sin-datos { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }

.fila-inactiva td { opacity: 0.6; }
.badge-estado { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.badge-activo { background: #dcfce7; color: #166534; }
.badge-inactivo { background: #f1f5f9; color: #64748b; }
.btn-edit { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-right: 0.4rem; }
.btn-edit:hover { background: #e5e7eb; }
.btn-baja { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-baja:hover { background: #ffe4e6; }
.btn-reactivar { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-reactivar:hover { background: #d1fae5; }
</style>