import { useState } from "react";
import "./P2PPage.css";

export function P2PPage() {
  const [tradeType, setTradeType] = useState("buy");
  const [coinFilter, setCoinFilter] = useState("BTC");

  const ads = [
    { user: "CryptoKing88", price: 67800, min: 100, max: 50000, pay: "Bank Transfer", trades: 342, rate: 98.5, coin: "BTC", online: true },
    { user: "BTCMerchant", price: 67650, min: 50, max: 20000, pay: "PayPal", trades: 128, rate: 99.1, coin: "BTC", online: true },
    { user: "SatoshiFan", price: 67900, min: 200, max: 100000, pay: "Wise", trades: 891, rate: 97.8, coin: "BTC", online: false },
    { user: "EthTrader", price: 3560, min: 50, max: 30000, pay: "Bank Transfer", trades: 203, rate: 99.5, coin: "ETH", online: true },
    { user: "CoinDealer", price: 3535, min: 100, max: 15000, pay: "Cash App", trades: 67, rate: 96.2, coin: "ETH", online: true },
    { user: "NaijaTrader", price: 67750, min: 5000, max: 500000, pay: "OPay / GTBank", trades: 512, rate: 98.9, coin: "BTC", online: true },
    { user: "USDTKing", price: 1.01, min: 1000, max: 50000, pay: "Bank Transfer", trades: 234, rate: 99.2, coin: "USDT", online: true },
    { user: "BNBHolder", price: 610, min: 200, max: 20000, pay: "PayPal", trades: 89, rate: 97.5, coin: "BNB", online: false },
  ];

  const filtered = ads.filter(a => a.coin === coinFilter);

  return (
    <div className="p2p-page-container">
      <div className="p2p-page-header">
        <h1>P2P Trading</h1>
        <p>Buy and sell directly with other users. Zero platform fees.</p>
      </div>

      <div className="p2p-controls-bar">
        <div className="p2p-toggle-wrapper">
          <button 
            className={`p2p-toggle-btn p2p-toggle-buy ${tradeType === "buy" ? "active" : ""}`} 
            onClick={() => setTradeType("buy")}
          >
            Buy
          </button>
          <button 
            className={`p2p-toggle-btn p2p-toggle-sell ${tradeType === "sell" ? "active" : ""}`} 
            onClick={() => setTradeType("sell")}
          >
            Sell
          </button>
        </div>
        
        <div className="p2p-coin-filters">
          {["BTC", "ETH", "USDT", "BNB"].map(c => (
            <button 
              key={c} 
              className={`p2p-coin-filter-btn ${coinFilter === c ? "active" : ""}`} 
              onClick={() => setCoinFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        
        <div className="p2p-offers-count">
          {filtered.length} offers available
        </div>
      </div>

      <div className="p2p-table-wrapper">
        <div className="p2p-table-header">
          <span>Advertiser</span>
          <span>Price / Unit</span>
          <span>Limit</span>
          <span>Payment</span>
          <span>Orders</span>
          <span></span>
        </div>
        
        {filtered.map((a, i) => (
          <div key={i} className="p2p-table-row">
            <div className="p2p-advertiser-info">
              <div className="p2p-advertiser-header">
                <div className="p2p-advertiser-avatar">
                  {a.user.charAt(0)}
                </div>
                <span className="p2p-advertiser-name">{a.user}</span>
                <div className={`p2p-online-status ${a.online ? "online" : "offline"}`} />
              </div>
              <div className="p2p-advertiser-stats">
                {a.trades} orders · {a.rate}% completion
              </div>
            </div>
            
            <div className="p2p-price-info">
              <div className="p2p-price-value">
                ${a.price.toLocaleString()}
              </div>
              <div className="p2p-price-unit">USDT per {a.coin}</div>
            </div>
            
            <div className="p2p-limit-info">
              ${a.min.toLocaleString()} – ${a.max.toLocaleString()}
            </div>
            
            <span className="p2p-payment-method">{a.pay}</span>
            
            <span className="p2p-order-count">{a.trades}</span>
            
            <button className={`p2p-trade-btn p2p-trade-${tradeType}`}>
              {tradeType === "buy" ? "Buy" : "Sell"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}