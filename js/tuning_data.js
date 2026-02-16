// Default prices for tuning parts
// You can edit these values to match your server economy
export const TUNING_PRICES = {
    colors: {
        primary: { price: 2500, cost: 500 },
        secondary: { price: 2500, cost: 500 },
        interior: { price: 1000, cost: 200 },
        dashboard: { price: 1000, cost: 200 },
        pearlescent: { price: 3000, cost: 600 },
        headlight: { price: 1500, cost: 300 },
        livery: { price: 5000, cost: 1000 },
        wheels_color: { price: 1000, cost: 200 }
    },
    options: {
        wheels: { price: 5000, cost: 2000 },
        horn: { price: 2000, cost: 500 },
        tint: { price: 2000, cost: 500 },
        xenon: { price: 4000, cost: 1500 },
        neon: { price: 6000, cost: 2000 },
        plates: { price: 1000, cost: 200 }
    },
    performance: {
        engine: [
            { level: 1, price: 5000, cost: 2500 },
            { level: 2, price: 10000, cost: 5000 },
            { level: 3, price: 15000, cost: 7500 },
            { level: 4, price: 20000, cost: 10000 }
        ],
        brakes: [
            { level: 1, price: 4000, cost: 2000 },
            { level: 2, price: 8000, cost: 4000 },
            { level: 3, price: 12000, cost: 6000 }
        ],
        transmission: [
            { level: 1, price: 4000, cost: 2000 },
            { level: 2, price: 8000, cost: 4000 },
            { level: 3, price: 12000, cost: 6000 }
        ],
        suspension: [
            { level: 1, price: 3000, cost: 1500 },
            { level: 2, price: 6000, cost: 3000 },
            { level: 3, price: 9000, cost: 4500 },
            { level: 4, price: 12000, cost: 6000 }
        ],
        turbo: { price: 25000, cost: 12500 }
    }
};
