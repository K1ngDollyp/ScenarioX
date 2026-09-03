# ScenarioX Simulation Engine Documentation

The ScenarioX simulation engine is written in pure Python using NumPy and SciPy. It operates completely independently of the AI layer.

---

## 1. Deterministic Business Formulas

### Baseline Calculations
- **Revenue** = $\text{customers\_per\_month} \times \text{average\_order\_value}$
- **Total Expenses** = $\text{inventory\_cost} + \text{salary\_cost} + \text{rent} + \text{utilities} + \text{marketing}$
- **Profit** = $\text{Revenue} - \text{Total Expenses}$
- **Profit Margin** = $(\text{Profit} / \text{Revenue}) \times 100\%$

### Price Elasticity of Demand
$$\text{demand\_change\_pct} = \text{price\_change\_pct} \times \text{elasticity}$$
$$\text{new\_customers} = \text{baseline\_customers} \times (1 + \text{demand\_change\_pct})$$
$$\text{new\_avg\_order} = \text{baseline\_avg\_order} \times (1 + \text{price\_change\_pct})$$

---

## 2. Mandatory Verification Example (Section 13)

- **Baseline**: 600 customers, ₦2,500 avg order, ₦500,000 inventory, ₦250,000 salary, ₦100,000 rent, ₦50,000 utilities, ₦100,000 marketing.
  - Revenue: ₦1,500,000
  - Expenses: ₦1,000,000
  - Profit: ₦500,000
- **Scenario**: Price increase +10%, Price Elasticity = -0.4.
  - Customer change: $10\% \times (-0.4) = -4\%$ → 576 customers.
  - Avg Order: $\text{₦}2,500 \times 1.10 = \text{₦}2,750$.
  - Revenue: $576 \times \text{₦}2,750 = \text{₦}1,584,000$.
  - Expenses: ₦1,000,000.
  - Profit: $\text{₦}1,584,000 - \text{₦}1,000,000 = \text{₦}584,000$.
  - Profit Change: +₦84,000 (+16.8%).

---

## 3. Monte Carlo Engine

Supports `triangular`, `normal`, `uniform`, and `fixed` distributions via JSON configs:
```json
{
  "variable": "customers_per_month",
  "distribution": "triangular",
  "parameters": { "min": 500, "most_likely": 600, "max": 750 }
}
```

Calculates:
- Mean, Median, Standard Deviation, Min, Max
- Percentiles: P5, P10, P25, P50, P75, P90, P95
- Probabilities: Probability of Profit, Probability of Loss, Probability of Target
