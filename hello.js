// Importuje modul pro práci se soubory
const fs = require('fs');

// Definuje konstanty pro ztrátu nad a pod inventářem
const LOSS_OVER_INVENTORY = 50;
const LOSS_UNDER_INVENTORY = 150;

// Definuje třídu pro simulaci vakcín pomocí metody Monte Carlo
class VaccineMonteCarloSimulator {
    constructor() {
        // Generuje náhodné číslo mezi 0 a 1
        this.randomGen = () => Math.random();
    }

    determineOptimalStockLevels() {
        // Vytvoří streamy pro zápis do souborů CSV
        const costStream = fs.createWriteStream('CSV/CostAnalysis.csv');
        const riskStream = fs.createWriteStream('CSV/RiskAnalysis.csv');
        const deviationStream = fs.createWriteStream('CSV/StdDeviationPerIterations.csv');

        // Vloží záhlaví do CSV souborů
        costStream.write('Stock, Average Cost\n');
        riskStream.write('Stock, Risk Percentage\n');
        deviationStream.write('Iterations, StdDeviation\n');

        // Simuluje náklady a riziko pro různé úrovně inventáře
        for (let inventoryLevel = 1000; inventoryLevel <= 10000; inventoryLevel += 10) {
            const averageCost = this.simulateCost(inventoryLevel);
            const riskRatio = this.evaluateRisk(inventoryLevel);

            costStream.write(`${inventoryLevel},${averageCost}\n`);
            riskStream.write(`${inventoryLevel},${riskRatio}\n`);
        }

        // Vypočítá standardní odchylku pro různý počet iterací
        for (let runs = 100; runs <= 5000; runs++) {
            const stdDeviation = this.calculateStdDeviation(runs);
            deviationStream.write(`${runs},${stdDeviation}\n`);
        }

        // Uzavře streamy
        costStream.end();
        riskStream.end();
        deviationStream.end();
    }

    /**
     * Simuluje celkové náklady pro zadaný počet běhů (runs) a vrací průměrné náklady na jednu simulaci.
     *
     * @param {number} stock - Aktuální množství zásob (inventáře), pro které se mají náklady simulovat.
     * @returns {number} - Průměrné náklady na základě všech simulací.
     */
    simulateCost(stock) {
        const runs = 10000;
        let totalCost = 0;

        // Pro každou iteraci vypočítá náhodnou poptávku, následně vypočítá náklady 
        // pro danou poptávku a zásoby a tyto náklady přičte k celkovým nákladům.
        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);
            totalCost += cost;
        }

        // Vrací průměrné náklady tím, že celkové náklady podělí počtem simulací.
        return totalCost / runs;
    }


    /**
     * Hodnotí riziko překročení určitého nákladového prahu v průběhu simulací.
     *
     * @param {number} stock - Aktuální množství zásob, pro které se má riziko vyhodnotit.
     * @returns {number} - Procento simulací, ve kterých náklady překročily definovaný prah (v tomto případě 200,000).
     */
    evaluateRisk(stock) {
        const runs = 10000;
        let riskyMonthsCount = 0;

        // Pro každou iteraci vypočítá náhodnou poptávku, následně vypočítá náklady 
        // pro danou poptávku a zásoby. Pokud náklady překročí prah 200,000, inkrementuje počítadlo riskantních měsíců.
        for (let i = 0; i < runs; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(stock, demand);

            if (cost > 200000) {
                riskyMonthsCount++;
            }
        }

        // Vrací poměr riskantních měsíců k celkovému počtu simulací.
        return riskyMonthsCount / runs;
    }


    /**
     * Vypočítá standardní odchylku nákladů pro zadaný počet simulací.
     *
     * @param {number} iterations - Počet simulací, pro které je třeba vypočítat standardní odchylku.
     * @returns {number} - Výsledná standardní odchylka nákladů.
     */
    calculateStdDeviation(iterations) {
        // Inicializuje pole, které bude obsahovat náklady z každé simulace.
        const costs = [];

        // Pro každou iteraci generuje náhodnou poptávku a vypočítá náklady.
        // Tyto náklady pak přidává do pole 'costs'.
        for (let i = 0; i < iterations; i++) {
            const demand = this.generateRandomDemand();
            const cost = this.calculateCost(1000, demand);
            costs.push(cost);
        }

        // Vypočítá průměrné náklady (aritmetický průměr) ze všech simulací.
        const mean = costs.reduce((sum, cost) => sum + cost, 0) / iterations;

        // Pro každý náklad vypočítá čtverec jeho odchylky od průměru.
        // Výsledkem je pole čtverců těchto odchylek.
        const squaredDifferences = costs.map(cost => (cost - mean) ** 2);

        // Vypočítá rozptyl (variance) nákladů - což je průměr čtverců odchylek.
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / iterations;

        // Vypočítá a vrátí standardní odchylku nákladů jako druhou odmocninu rozptylu.
        return Math.sqrt(variance);
    }


    calculateCost(stock, demand) {
        // Vypočítá náklady na základě skladových zásob a poptávky
        if (demand > stock) {
            return (demand - stock) * LOSS_UNDER_INVENTORY;
        } else {
            return (stock - demand) * LOSS_OVER_INVENTORY;
        }
    }

    generateRandomDemand() {
        // Generuje náhodnou poptávku na základě pravděpodobnosti
        const prob = this.randomGen();

        if (prob < 0.07) return 1000 + Math.floor(Math.random() * 1501);
        if (prob < 0.4) return 2500 + Math.floor(Math.random() * 1501);
        if (prob < 0.65) return 4000 + Math.floor(Math.random() * 2001);
        if (prob < 0.83) return 6000 + Math.floor(Math.random() * 1001);
        if (prob < 0.93) return 7000 + Math.floor(Math.random() * 1001);

        return 8000 + Math.floor(Math.random() * 2001);
    }
}

// Vytvoří instanci simulatoru a spustí simulaci
const simulator = new VaccineMonteCarloSimulator();
simulator.determineOptimalStockLevels();
console.log("Výsledky uloženy do souborů CSV.");
