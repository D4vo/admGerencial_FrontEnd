<template>
  <div class="contenedor-lista">
    <div v-for="grupo in grupos" :key="grupo.tipoContable" class="card-grupo">
      
      <div class="cabecera-grupo" :class="claseColor(grupo.tipoContable)">
        <h3>{{ grupo.tipoContable }}</h3>
        <span class="contador">{{ grupo.cuentas.length }} cuentas</span>
      </div>

      <div class="cuerpo-grupo">
        <table v-if="grupo.cuentas.length > 0">
          <thead>
            <tr>
              <th class="col-codigo">Código</th>
              <th class="col-nombre">Nombre de la Cuenta</th>
              <th class="col-accion">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cuenta in grupo.cuentas" :key="cuenta.id">
              <td class="col-codigo codigo-texto">{{ cuenta.codigo }}</td>
              <td class="col-nombre">{{ cuenta.nombre }}</td>
              <td class="col-accion">
                <button class="btn-editar" @click="emit('editar', cuenta)">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="sin-cuentas">
          No hay cuentas registradas en este rubro.
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  grupos: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['editar']);

const claseColor = (tipo) => {
  const colores = {
    'Activo': 'bg-activo',
    'Pasivo': 'bg-pasivo',
    'Patrimonio Neto': 'bg-pn',
    'Ingreso': 'bg-ingreso',
    'Egreso': 'bg-egreso'
  };
  return colores[tipo] || 'bg-default';
};
</script>

<style scoped>
.contenedor-lista {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.card-grupo {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.cabecera-grupo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  border-bottom: 1px solid #e5e7eb;
}

.cabecera-grupo h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contador {
  background: rgba(255, 255, 255, 0.5);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

/* Colores de acento para la cabecera según el tipo */
.bg-activo { background-color: #d1fae5; }      /* Verde muy suave */
.bg-pasivo { background-color: #fee2e2; }      /* Rojo muy suave */
.bg-pn { background-color: #f3e8ff; }          /* Violeta muy suave */
.bg-ingreso { background-color: #dbeafe; }     /* Azul muy suave */
.bg-egreso { background-color: #ffedd5; }      /* Naranja muy suave */
.bg-default { background-color: #f3f4f6; }

.cuerpo-grupo {
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: 12px 25px;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 15px 25px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

/* Tipografía de código contable */
.codigo-texto {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
  color: #4b5563;
  letter-spacing: 0.5px;
}

.col-codigo { width: 150px; }
.col-nombre { font-weight: 500; }
.col-accion { width: 100px; text-align: right; }

.btn-editar {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-editar:hover {
  background: #e5e7eb;
  color: #111827;
}

.sin-cuentas {
  padding: 30px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}
</style>