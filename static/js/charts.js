/**
 * FinPilot Chart.js Integration
 * Handles category donut chart, 6-month line trend, and health score gauge
 */

let categoryChartInstance = null;
let trendChartInstance = null;

function renderCategoryDonut(canvasId, categoryData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const labels = Object.keys(categoryData);
  const values = Object.values(categoryData);

  if (labels.length === 0) {
    labels.push("No Expenses Yet");
    values.push(1);
  }

  const palette = [
    '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', 
    '#f59e0b', '#06b6d4', '#6366f1', '#f43f5e', '#14b8a6'
  ];

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font: { size: 11, family: 'Plus Jakarta Sans' },
            boxWidth: 10,
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              return ` ${context.label}: ${val.toLocaleString()}`;
            }
          }
        }
      },
      cutout: '72%'
    }
  });
}

function renderIncomeExpenseTrend(canvasId, monthlyTrend) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  const months = monthlyTrend.map(t => t.month);
  const incomeValues = monthlyTrend.map(t => t.income);
  const expenseValues = monthlyTrend.map(t => t.expense);

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          fill: true
        },
        {
          label: 'Expenses',
          data: expenseValues,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.05)',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { size: 11, family: 'Plus Jakarta Sans' },
            boxWidth: 10
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}
