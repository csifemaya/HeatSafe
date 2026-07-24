// File: js/history.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  const historyKey = 'csif:history';

  function getHistory() {
    return ns.utils?.storage?.get(historyKey, []);
  }

  function saveEntry(entry) {
    const history = getHistory();
    history.unshift(entry);
    ns.utils?.storage?.set(historyKey, history.slice(0, 100));
    return history;
  }

  function deleteEntry(index) {
    const history = getHistory();
    history.splice(index, 1);
    ns.utils?.storage?.set(historyKey, history);
    return history;
  }

  function renderHistory(filter = '') {
    const history = getHistory();
    const rows = history.map((item, index) => ({ ...item, __index: index })).filter((item) => (item.date || '').includes(filter) || (item.comment || '').includes(filter));
    const tbody = document.getElementById('historyTable');
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map((item) => `
      <tr>
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td>${item.gps}</td>
        <td>${item.wbgt}</td>
        <td>${item.temperature}</td>
        <td>${item.humidity}</td>
        <td>${item.work}</td>
        <td>${item.result}</td>
        <td>${item.comment}</td>
        <td><button class="btn btn-sm btn-outline-danger" data-delete="${item.__index}">✕</button></td>
      </tr>
    `).join('') : '<tr><td colspan="10" class="text-muted">Sin historial aún.</td></tr>';
    tbody.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => {
      deleteEntry(Number(button.getAttribute('data-delete')));
      renderHistory(document.getElementById('historySearch').value);
      ns.renderCharts();
    }));
  }

  function exportHistory() {
    const data = JSON.stringify(getHistory(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'csif-history.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  Object.assign(ns, { getHistory, saveEntry, deleteEntry, renderHistory, exportHistory });
})(window);
