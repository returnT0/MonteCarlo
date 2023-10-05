const fs = require('fs');

// Konstanty pro náklady přesahující sklad a pod skladem
const LOSS_OVER_STOCK = 50;
const LOSS_UNDER_STOCK = 150;

class VaccineMonteCarloSimulator {
    constructor() {
        // Generátor náhodných čísel
        this.randomGen = () => Math.random();
    }

    determineOptimalStockLevels() {
        // Vytvoření souborů pro zápis dat
        const costStream = fs.createWriteStream('CSV/CostAnalysis.csv');
        const riskStream = fs.createWriteStream('CSV/RiskAnalysis.csv');

        // Hlavičky souborů
        costStream.write('Stock, Average Cost\n');
        riskStream.write('Stock, Risk Percentage\n');

        // Simulace pro různé množství skladu
        for (let inventoryLevel = 1000; inventoryLevel <= 10000; inventoryLevel += 10) {
            const averageCost = this.simulateCost(inventoryLevel);
            const riskRatio = this.evaluateRisk(inventoryLevel);

            // Zápis výsledků do souborů
            costStream.write(`${inventoryLevel},${averageCost}\n`);
            riskStream.write(`${inventoryLevel},${riskRatio}\n`);
        }

        // Uzavření souborů
        costStream.end();
        riskStream.end();
    }

    simulateCost(stock) {
        const runs = 10000;
        let totalCost = 0;

        // Provedení simulace nákladů
        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);
            totalCost += cost;
        }
        // Vrátit průměrný náklad
        return totalCost / runs;
    }

    evaluateRisk(stock) {
        const runs = 10000;
        let riskyMonthsCount = 0;

        // Vyhodnocení rizika překročení nákladů
        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);

            if (cost > 200000) {
                riskyMonthsCount++;
            }
        }
        // Vrátit poměr rizikových měsíců
        return riskyMonthsCount / runs;
    }

    calculateCost(stock, demand) {
        // Výpočet nákladů na základě skladu a poptávky
        if (demand > stock) {
            return (demand - stock) * LOSS_UNDER_STOCK;
        } else {
            return (stock - demand) * LOSS_OVER_STOCK;
        }
    }

    generateRandomDemand() {
        // Generování náhodné poptávky na základě pravděpodobnosti
        const prob = this.randomGen();

        if (prob < 0.07) return 1000 + Math.floor(Math.random() * 1501);
        if (prob < 0.4) return 2500 + Math.floor(Math.random() * 1501);
        if (prob < 0.65) return 4000 + Math.floor(Math.random() * 2001);
        if (prob < 0.83) return 6000 + Math.floor(Math.random() * 1001);
        if (prob < 0.93) return 7000 + Math.floor(Math.random() * 1001);

        return 8000 + Math.floor(Math.random() * 2001);
    }
}

// Vytvoření instance simulace a spuštění
const simulator = new VaccineMonteCarloSimulator();
simulator.determineOptimalStockLevels();
console.log("Výsledky uloženy do souborů CSV.");
