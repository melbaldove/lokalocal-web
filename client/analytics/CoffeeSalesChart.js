class CoffeeSalesChart {
  constructor(chart) {
    let ctx = chart.getContext('2d');

    let lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July","AUgust", "september", "october", "november", "December"],
        datasets: [{
          label: "My First dataset",
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
        }]
      },

      // Configuration options go here
      options: {}
    });
  }

  updateData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

export default CoffeeSalesChart;
