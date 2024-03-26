import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

function App() {
  const [tokensAmount, setTokensAmount] = useState(); // Token amount
  const [contractAddress, setContractAddress] = useState(""); // Token contract address
  const [totalValue, setTotalValue] = useState(0); // Total value in USD
  const [tokenPrice, setTokenPrice] = useState(0); // Current token price
  const [tokenName, setTokenName] = useState(""); // Token name
  const [exchangeRate, setExchangeRate] = useState(1);
  const [investmentAmount, setInvesmentAmount] = useState(); // Token amount

  // Function to fetch the current token price
  const fetchTokenPrice = async () => {
    try {
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/pairs/bsc/${
          contractAddress
            ? contractAddress
            : "0xc54aa5694cd8bd419ac3bba11ece94aa6c5f9b01"
        }`
      );
      const price = response.data.pairs[0].priceUsd;
      const tokenName = response.data.pairs[0].baseToken.name;
      setTokenPrice(price);
      setTokenName(tokenName);
    } catch (error) {
      console.error("Error fetching token price:", error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const rate = response.data.rates.GBP; // Access the GBP rate
      setExchangeRate(rate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  // Calculate total value based on the amount and token price
  useEffect(() => {
    setTotalValue((!tokensAmount ? 9667.4425 : tokensAmount) * tokenPrice);
  }, [tokensAmount, tokenPrice]);

  // Fetch the token price when the component mounts and at regular intervals
  useEffect(() => {
    fetchTokenPrice();
    fetchExchangeRate();
    const tokenPriceInterval = setInterval(fetchTokenPrice, 10000); // Fetch token price every 10 seconds
    const exchangeRateInterval = setInterval(fetchExchangeRate, 30000); // Fetch exchange rate every 30 seconds
    return () => {
      clearInterval(tokenPriceInterval);
      clearInterval(exchangeRateInterval);
    }; // Cleanup intervals on component unmount
  }, [contractAddress]);

  const handleTokensAmountChange = (e) => {
    setTokensAmount(e.target.value);
  };

  const handleContractChange = (e) => {
    setContractAddress(e.target.value);
  };

  const handleInvestmentAmountChange = (e) => {
    setInvesmentAmount(e.target.value);
  };

  // Function to render the investment comparison
  const renderInvestmentComparison = () => {
    const actualValueGBP = totalValue * exchangeRate;
    const difference =
      actualValueGBP - (investmentAmount ? investmentAmount : 425);
    const comparisonColor = difference > 0 ? "green" : "red";

    return (
      <>
        <p>
          <b>Investment Value:</b> £{investmentAmount ? investmentAmount : 425}
        </p>
        <p style={{ color: comparisonColor }}>
          <b>Return:</b> £ {difference.toFixed(2)}
        </p>
      </>
    );
  };

  return (
    <div className="w-full h-96 flex justify-center">
      <Box className="mt-10 text-center">
        <p className="text-3xl font-bold">Crypto Calculator</p>
        <p className="text-xl font-semibold">
          {tokenName}: ${tokenPrice}
        </p>
        <FormControl className="gap-y-2">
          <TextField
            id="contract-address"
            label="Contract Address"
            variant="outlined"
            onChange={handleContractChange}
            value={contractAddress}
          />
          <TextField
            id="tokens-amount"
            label="Tokens Amount"
            variant="outlined"
            onChange={handleTokensAmountChange}
            value={tokensAmount}
            type="number"
          />
          <TextField
            id="investment-amount"
            label="Investment Amount"
            variant="outlined"
            onChange={handleInvestmentAmountChange}
            value={investmentAmount}
            type="number"
          />
        </FormControl>
        <p>
          <b>Value in USD:</b> ${totalValue.toFixed(2)}
        </p>
        <p>
          <b>Value in GBP:</b> £{(totalValue * exchangeRate).toFixed(2)}
        </p>
        {renderInvestmentComparison()}
      </Box>
    </div>
  );
}

export default App;
