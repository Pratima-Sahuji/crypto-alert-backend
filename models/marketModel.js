import mongoose from "mongoose";

const marketDataSchema = new mongoose.Schema({
   coinSymbol: { 
    type: String,
    required: true 
    }, // BTC, ETH
    priceUSD: {
        type: Number, 
        required: true 
    },
    priceINR: { 
        type: Number, 
        required: true 
    },
    marketCap: { 
        type: Number 
    },
    volume24h: { 
        type: Number 
    },
    change24h: { 
        type: Number 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    },
},
{ timestamps: true }
)

export default mongoose.model("MarketData" , marketDataSchema);