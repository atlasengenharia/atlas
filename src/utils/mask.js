/**
 * Converte um valor numérico em string formatada (ex: 1200.50 -> "1.200,50")
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converte uma string formatada em número (ex: "1.200,50" -> 1200.5)
 */
export const parseCurrency = (value) => {
  if (!value) return 0;
  // Remove tudo exceto dígitos
  const cleanValue = value.replace(/\D/g, '');
  return parseFloat(cleanValue) / 100;
};

/**
 * Aplica a máscara de moeda em tempo real a um input
 */
export const applyCurrencyMask = (input) => {
  let value = input.value.replace(/\D/g, '');
  if (value === '') {
    input.value = '';
    return;
  }
  
  const amount = parseFloat(value) / 100;
  input.value = formatCurrency(amount);
};
