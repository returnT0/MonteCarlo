const fs = require('fs');

const LOSS_OVER_STOCK = 50;
const LOSS_UNDER_STOCK = 150;

class VaccineMonteCarloSimulator {
    constructor() {
        this.randomGen = () => Math.random();
    }

    determineOptimalStockLevels() {
        const costStream = fs.createWriteStream('CSV/CostAnalysis.csv');
        const riskStream = fs.createWriteStream('CSV/RiskAnalysis.csv');
        const deviationStream = fs.createWriteStream('CSV/StdDeviationPerIterations.csv');

        costStream.write('Stock, Average Cost\n');
        riskStream.write('Stock, Risk Percentage\n');
        deviationStream.write('Iterations, StdDeviation\n');

        for (let inventoryLevel = 1000; inventoryLevel <= 10000; inventoryLevel += 10) {
            const averageCost = this.simulateCost(inventoryLevel);
            const riskRatio = this.evaluateRisk(inventoryLevel);

            costStream.write(`${inventoryLevel},${averageCost}\n`);
            riskStream.write(`${inventoryLevel},${riskRatio}\n`);
        }

        for (let runs = 100; runs <= 5000; runs++) {
            const stdDeviation = this.calculateStdDeviation(runs);
            deviationStream.write(`${runs},${stdDeviation}\n`);
        }

        costStream.end();
        riskStream.end();
        deviationStream.end();
    }

    simulateCost(stock) {
        const runs = 10000;
        let totalCost = 0;

        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);
            totalCost += cost;
        }

        return totalCost / runs;
    }

    evaluateRisk(stock) {
        const runs = 10000;
        let riskyMonthsCount = 0;

        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);

            if (cost > 200000) {
                riskyMonthsCount++;
            }
        }

        return riskyMonthsCount / runs;
    }

    calculateStdDeviation(iterations) {
        const costs = [];
        for (let i = 0; i < iterations; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(1000, demand); // assuming a fixed stock of 1000 for this deviation calculation
            costs.push(cost);
        }

        const mean = costs.reduce((sum, cost) => sum + cost, 0) / iterations;
        const squaredDifferences = costs.map(cost => (cost - mean) ** 2);
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / iterations;

        return Math.sqrt(variance);
    }

    calculateCost(stock, demand) {
        if (demand > stock) {
            return (demand - stock) * LOSS_UNDER_STOCK;
        } else {
            return (stock - demand) * LOSS_OVER_STOCK;
        }
    }

    generateRandomDemand() {
        const prob = this.randomGen();

        if (prob < 0.07) return 1000 + Math.floor(Math.random() * 1501);
        if (prob < 0.4) return 2500 + Math.floor(Math.random() * 1501);
        if (prob < 0.65) return 4000 + Math.floor(Math.random() * 2001);
        if (prob < 0.83) return 6000 + Math.floor(Math.random() * 1001);
        if (prob < 0.93) return 7000 + Math.floor(Math.random() * 1001);

        return 8000 + Math.floor(Math.random() * 2001);
    }
}

const simulator = new VaccineMonteCarloSimulator();
simulator.determineOptimalStockLevels();
console.log("Výsledky uloženy do souborů CSV.");
