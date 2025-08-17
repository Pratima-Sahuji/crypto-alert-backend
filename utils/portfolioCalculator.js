// utils/portfolioCalculator.js
function calculatePortfolio(transactions, livePrice) {
       console.log('Received transactions:', transactions);
  console.log('Received livePrice:', livePrice);

  // Input validation
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    console.log('No transactions provided or invalid transactions array');
    return {
      FIFO: {
        holdingsQty: 0,
        holdingsCost: 0,
        realized: 0,
        unrealized: 0
      },
      Average: {
        holdingsQty: 0,
        holdingsCost: 0,
        realized: 0,
        unrealized: 0
      }
    };
  }


  // FIFO
  let fifoQueue = [];
  let fifoRealized = 0;

  // Average
  let avgQty = 0;
  let avgPrice = 0;
  let avgRealized = 0;

  for (let tx of transactions) {
    const qty = tx.quantity;
    const price = tx.price;

    if (tx.transactionType === "BUY") {
      // FIFO add lot
      fifoQueue.push({ qty, price });

      // Average cost update
      const totalCost = avgQty * avgPrice + qty * price;
      avgQty += qty;
      avgPrice = avgQty > 0 ? totalCost / avgQty : 0;


    } else if (tx.transactionType === "SELL") {
      // FIFO sell
      let sellQty = qty;
      while (sellQty > 0 && fifoQueue.length > 0) {
        let lot = fifoQueue[0];
        let sellFromLot = Math.min(sellQty, lot.qty);
        fifoRealized += (price - lot.price) * sellFromLot;
        lot.qty -= sellFromLot;
        sellQty -= sellFromLot;
        if (lot.qty === 0) fifoQueue.shift();
      }

      // Average sell
      // avgRealized += (price - avgPrice) * qty;
      // avgQty -= qty;
      const sellableQty = Math.min(qty, avgQty);
      avgRealized += (price - avgPrice) * sellableQty;
      avgQty -= sellableQty;
      if (avgQty < 0) avgQty = 0; // safety clamp
    }
  }

  // FIFO holdings
  const fifoHoldingsQty = fifoQueue.reduce((sum, lot) => sum + lot.qty, 0);
  const fifoCost = fifoQueue.reduce((sum, lot) => sum + lot.qty * lot.price, 0);
  const fifoUnrealized = fifoHoldingsQty * livePrice - fifoCost;

  // Average holdings
  const avgCostTotal = avgQty * avgPrice;
  const avgUnrealized = avgQty * livePrice - avgCostTotal;

  return {
    FIFO: {
      holdingsQty: fifoHoldingsQty,
      holdingsCost: fifoCost,
      realized: fifoRealized,
      unrealized: fifoUnrealized
    },
    Average: {
      holdingsQty: avgQty,
      holdingsCost: avgCostTotal,
      realized: avgRealized,
      unrealized: avgUnrealized
    }
  };
}

export default  calculatePortfolio;


