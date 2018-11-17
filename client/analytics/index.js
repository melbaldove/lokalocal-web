import CoffeeSalesChart from "./CoffeeSalesChart";
import CoffeeDistributionChart from "./CoffeeDistributionChart";

const chart = document.querySelector("#coffeeSalesChart");
if (chart) {
  new CoffeeSalesChart(chart);
}

const chart2 = document.querySelector("#coffeeDistributionChart");
if (chart) {
  new CoffeeDistributionChart(chart);
}
