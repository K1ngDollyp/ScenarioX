# ScenarioX AI Integration Architecture

**Core Principle:** The AI interprets. The mathematics calculates.

---

## 1. AI Responsibilities & Boundaries

### Allowed AI Operations:
- Parsing natural language descriptions into business variables with units (`value`, `currency`, `period`, `unit`).
- Detecting missing required fields.
- Identifying ambiguous phrasing.
- Suggesting plausible scenarios.
- Explaining backend-calculated numerical results in natural language.

### Strictly Prohibited AI Operations:
- Calculating revenue, expenses, profit, or elasticity.
- Generating random samples or Monte Carlo statistics.
- Executing code or SQL.
- Direct database mutation.
- Overriding calculated simulation numbers.

---

## 2. Structured Pydantic v2 Output Validation

All AI responses must strictly validate against Pydantic v2 schemas:

```python
class ExtractedVariable(BaseModel):
    name: str
    value: float
    currency: str = "NGN"
    period: str = "month"
    unit: str
    category: str
    confidence: float

class ModelExtractionResult(BaseModel):
    business_type: str
    variables: List[ExtractedVariable]
    missing_variables: List[str]
    assumptions: List[str]
```

---

## 3. AI Failure Fallback

If the AI API key is missing, invalid, or timing out:
- Manual model creation, scenario creation, deterministic simulation, Monte Carlo, sensitivity, forecasting, and optimization continue functioning normally.
- Clear error notification is returned for AI explanation requests.
