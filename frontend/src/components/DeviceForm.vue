<template>
  <div class="form-container">
    <div class="form-card">
      <h2 class="form-title">Cadastrar Novo Dispositivo</h2>
      <form @submit.prevent="submitForm" class="device-form">
        <div class="form-group">
          <label for="name" class="form-label"><strong>Nome do Dispositivo</strong></label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Digite o nome do dispositivo"
            required
            maxlength="100"
            @input="sanitizeName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label for="mac" class="form-label"><strong>Endereço MAC</strong></label>
          <input
            id="mac"
            v-model="form.mac"
            type="text"
            class="form-input"
            placeholder="XX:XX:XX:XX:XX:XX"
            required
            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
            @input="sanitizeMac"
          />
          <span v-if="errors.mac" class="error-message">{{ errors.mac }}</span>
        </div>
        <div v-if="generalError" class="general-error-message">{{ generalError }}</div>
        <button type="submit" :disabled="!isFormValid" class="submit-btn">
          <span class="btn-text">Cadastrar Dispositivo</span>
          <div class="btn-loader" v-if="loading"></div>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'DeviceForm',
  emits: ['deviceCreated'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      mac: '',
    });

    const errors = ref({
      name: '',
      mac: '',
    });

    const generalError = ref('');
    const loading = ref(false);
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

    const sanitizeName = () => {
      // Remove potentially harmful characters
      form.value.name = form.value.name.replace(/[<>\"'&]/g, '').trim();
      errors.value.name = form.value.name.length > 100 ? 'Nome deve ter no máximo 100 caracteres' : '';
    };

    const sanitizeMac = () => {
      // Convert to uppercase and remove invalid characters
      form.value.mac = form.value.mac.toUpperCase().replace(/[^0-9A-F:-]/g, '');
      errors.value.mac = !macRegex.test(form.value.mac) ? 'Formato de endereço MAC inválido' : '';
    };

    const isFormValid = computed(() => {
      return form.value.name.trim() &&
             form.value.mac &&
             !errors.value.name &&
             !errors.value.mac &&
             !loading.value;
    });

    const submitForm = async () => {
      if (!isFormValid.value) return;

      loading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/devices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.value.name.trim(),
            mac: form.value.mac.toUpperCase(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          emit('deviceCreated', data);
          form.value = { name: '', mac: '' };
          errors.value = { name: '', mac: '' };
          generalError.value = '';
        } else {
          // Handle validation errors from server
          if (data.errors) {
            data.errors.forEach(err => {
              if (err.param === 'name') errors.value.name = err.msg;
              if (err.param === 'mac') errors.value.mac = err.msg;
            });
            generalError.value = '';
          } else {
            generalError.value = data.error || 'Erro ao cadastrar dispositivo';
          }
        }
      } catch (error) {
        console.error('Error:', error);
        generalError.value = 'Erro de rede. Tente novamente.';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      errors,
      generalError,
      loading,
      submitForm,
      isFormValid,
    };
  },
};
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.05), transparent);
  transition: left 0.6s;
}

.form-card:hover::before {
  left: 100%;
}

.form-title {
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.device-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: #555;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input:invalid {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.general-error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.submit-btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-card {
    padding: 2rem;
  }
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
