/**
 * Escapa caracteres HTML para prevenir XSS.
 * Use em todo conteúdo inserido via innerHTML que venha do usuário.
 */
export const esc = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Formata valor monetário em BRL.
 */
export const formatBRL = (value) =>
  (parseFloat(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

/**
 * Formata data de string ISO para pt-BR, evitando bug de timezone do Safari.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
};
