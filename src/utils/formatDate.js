export const toDateKey  = (d = new Date()) => d.toISOString().split('T')[0];
export const todayKey   = () => toDateKey(new Date());

export const formatDate = (key) => {
  const d = new Date(key + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};
