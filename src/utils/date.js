export const getLocalTodayStr = () => {
  return formatLocalDate(new Date());
};

export const formatLocalDate = (dateObj) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
};
