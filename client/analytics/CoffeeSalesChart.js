const Rx = require('rxjs/Rx');
const axios = require('axios');

class CoffeeSalesChart {
  constructor(chart) {
    let ctx = chart.getContext('2d');
    let changer = document.getElementById('coffeeSalesChartChanger');
    chart.style.height = '128px';

    Rx.Observable.fromEvent(changer, 'change')
      .map(e => e.target.value)
      .startWith(
        axios.get(`/api/transaction/getSalesVolumeByYear`, {params: {year: changer.value}})
          .then(response => {
            let {data} = response;

            this.updateData(this.lineChart, data.map(datum => datum.amount))
            return changer.value;
          })
      )
      .subscribe(value => {
        return axios.get(`/api/transaction/getSalesVolumeByYear`, {params: {year: value}})
          .then(response => {
            let {data} = response;

            this.updateData(this.lineChart, data.map(datum => datum.amount))
          })
      });

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July","AUgust", "september", "october", "november", "December"],
        datasets: [{
          label: "Sales Volume",
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
        }]
      },

      // Configuration options go here
      options: {
        responsive: true,
      }
    });
  }

  updateData(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

export default CoffeeSalesChart;
