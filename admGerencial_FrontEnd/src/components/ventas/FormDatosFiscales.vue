<template>
  <div class="bloque-fiscal effecto-aparecer">
    <h4 class="titulo-fiscal">
      <span class="icono-seccion">📋</span> Datos del Responsable Inscripto
    </h4>
    
    <div class="grid-fiscal">
      <div class="form-grupo">
        <label>CUIT <span class="requerido">*</span></label>
        <div class="input-contenedor">
          <input 
            type="text" 
            :value="modelValue.cuit" 
            @input="updateField('cuit', $event.target.value)"
            placeholder="30-12345678-9" 
            class="input-fiscal"
          />
        </div>
      </div>

      <div class="form-grupo">
        <label>Razón Social <span class="requerido">*</span></label>
        <div class="input-contenedor">
          <input 
            type="text" 
            :value="modelValue.razon_social" 
            @input="updateField('razon_social', $event.target.value)"
            placeholder="Ej: Gimnasio Ábito SRL" 
            class="input-fiscal"
          />
        </div>
      </div>
    </div>

    <div class="form-grupo">
      <label>Domicilio Fiscal <span class="requerido">*</span></label>
      <div class="input-contenedor">
        <input 
          type="text" 
          :value="modelValue.domicilio" 
          @input="updateField('domicilio', $event.target.value)"
          placeholder="Ej: Sáenz Peña, Chaco" 
          class="input-fiscal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};
</script>

<style scoped>
.bloque-fiscal {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
}

.titulo-fiscal {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px dashed #cbd5e1;
  padding-bottom: 0.75rem;
}

.icono-seccion {
  font-size: 1.1rem;
}

.grid-fiscal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-grupo {
  display: flex;
  flex-direction: column;
}

.form-grupo label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
}

.requerido {
  color: #ef4444;
}

.input-contenedor {
  position: relative;
  display: flex;
  align-items: center;
}


.input-fiscal {
  width: 100%;
  padding: 0.65rem 0.75rem 0.65rem 2.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

.input-fiscal:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@media (max-width: 480px) {
  .grid-fiscal {
    grid-template-columns: 1fr;
  }
}

.effecto-aparecer {
  animation: fadeInDown 0.25s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>