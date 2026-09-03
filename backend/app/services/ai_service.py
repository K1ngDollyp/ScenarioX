import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.exceptions import AIServiceUnavailableError, ValidationError
from app.schemas.ai import (
    AIParseModelResponse,
    AIGenerateScenariosResponse,
    AIExplainResultsResponse,
    AIScenarioSuggestion,
)
from app.schemas.model import VariableCreate


class AIService:
    """
    Structured AI Service Abstraction Layer.
    Converts natural language input into validated Pydantic v2 schema objects and explains numerical simulation output.
    NEVER calculates financial or statistical numbers directly.
    """

    @staticmethod
    def sanitize_user_prompt(prompt: str) -> str:
        """Defends against basic prompt injection by stripping control tokens."""
        sanitized = re.sub(r'<\|.*?\|>', '', prompt)
        sanitized = re.sub(r'System:', 'User:', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'Ignore previous instructions', '', sanitized, flags=re.IGNORECASE)
        return sanitized.strip()

    @classmethod
    async def parse_model_description(cls, raw_prompt: str) -> AIParseModelResponse:
        sanitized = cls.sanitize_user_prompt(raw_prompt)

        # Fallback heuristic parser if AI key is unconfigured or in offline mode
        if not settings.AI_API_KEY or settings.AI_API_KEY.startswith("your-"):
            return cls._fallback_parse_model(sanitized)

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.AI_API_KEY)
            model = genai.GenerativeModel(settings.AI_MODEL)

            system_instruction = (
                "You are an expert financial analyst assistant. Convert the user's natural language business description "
                "into a JSON object matching this schema:\n"
                "{\n"
                '  "business_type": "restaurant",\n'
                '  "extracted_variables": [\n'
                '    {"variable_name": "customers_per_month", "display_name": "Customers per Month", "category": "revenue", "value": 600.0, "unit": "customers/month", "period": "month", "currency": "NGN", "source": "ai_extracted"}\n'
                '  ],\n'
                '  "missing_variables": ["inventory_cost"],\n'
                '  "assumptions": ["Assumed 30 days operating per month"],\n'
                '  "ambiguities": []\n'
                "}\n"
                "IMPORTANT: Return strictly valid JSON. Do not perform financial calculations yourself."
            )

            response = model.generate_content(f"{system_instruction}\nUser Description: {sanitized}")
            text_resp = response.text.strip()
            # Extract JSON block
            match = re.search(r'\{.*\}', text_resp, re.DOTALL)
            if match:
                text_resp = match.group(0)

            parsed_json = json.loads(text_resp)
            return AIParseModelResponse.model_validate(parsed_json)

        except Exception as e:
            # Fallback to local heuristic parser instead of crashing
            return cls._fallback_parse_model(sanitized)

    @classmethod
    def _fallback_parse_model(cls, prompt: str) -> AIParseModelResponse:
        """Deterministic local regex extractor for offline or fallback usage."""
        extracted: List[VariableCreate] = []
        missing: List[str] = []
        assumptions: List[str] = ["Extracted via fallback pattern recognition."]

        prompt_lower = prompt.lower()

        # Regex for customer count
        cust_match = re.search(r'(\d+[\d,]*)\s*customers', prompt_lower)
        if cust_match:
            val = float(cust_match.group(1).replace(',', ''))
            extracted.append(VariableCreate(
                variable_name="customers_per_month",
                display_name="Customers per Month",
                category="revenue",
                value=val,
                unit="customers/month",
                period="month",
                currency="NGN",
                source="ai_extracted"
            ))
        else:
            missing.append("customers_per_month")

        # Regex for average order value
        avg_match = re.search(r'average order\s*(?:is|of)?\s*[₦\$\s]*([\d,]+)', prompt_lower)
        if avg_match:
            val = float(avg_match.group(1).replace(',', ''))
            extracted.append(VariableCreate(
                variable_name="average_order_value",
                display_name="Average Order Value",
                category="revenue",
                value=val,
                unit="NGN/order",
                period="order",
                currency="NGN",
                source="ai_extracted"
            ))
        else:
            missing.append("average_order_value")

        # Regex for expenses
        expense_keywords = [
            ("inventory_cost", "food", "inventory", "inventory_cost", "food/materials", "NGN/month"),
            ("salary_cost", "salary", "salaries", "salary_cost", "salaries/wages", "NGN/month"),
            ("rent", "rent", "lease", "rent", "building rent", "NGN/month"),
            ("utilities", "utilities", "bills", "utilities", "electricity & water", "NGN/month"),
            ("marketing", "marketing", "ads", "marketing", "advertising", "NGN/month"),
        ]

        for var_name, kw1, kw2, db_name, disp_name, unit_str in expense_keywords:
            pattern = rf'{kw1}[^0-9]*[₦\$\s]*([\d,]+)'
            match = re.search(pattern, prompt_lower)
            if not match and kw2 != kw1:
                pattern = rf'{kw2}[^0-9]*[₦\$\s]*([\d,]+)'
                match = re.search(pattern, prompt_lower)

            # Reverse check for "spend ₦100,000 on marketing"
            if not match:
                pattern = rf'[₦\$\s]*([\d,]+)[^0-9]*{kw1}'
                match = re.search(pattern, prompt_lower)

            if not match and kw2 != kw1:
                pattern = rf'[₦\$\s]*([\d,]+)[^0-9]*{kw2}'
                match = re.search(pattern, prompt_lower)

            if match:
                val = float(match.group(1).replace(',', ''))
                extracted.append(VariableCreate(
                    variable_name=var_name,
                    display_name=disp_name,
                    category="expense",
                    value=val,
                    unit=unit_str,
                    period="month",
                    currency="NGN",
                    source="ai_extracted"
                ))
            else:
                missing.append(var_name)

        return AIParseModelResponse(
            business_type="restaurant",
            extracted_variables=extracted,
            missing_variables=missing,
            assumptions=assumptions,
            ambiguities=[]
        )

    @classmethod
    async def generate_scenario_suggestions(cls, model_id: str) -> AIGenerateScenariosResponse:
        return AIGenerateScenariosResponse(
            scenarios=[
                AIScenarioSuggestion(
                    name="Price Increase (+10%)",
                    description="Test raising prices by 10% assuming -0.4 demand elasticity.",
                    changes=[{"variable_name": "price_change", "change_type": "percentage", "change_value": 10.0}]
                ),
                AIScenarioSuggestion(
                    name="Marketing Push (+20%)",
                    description="Increase marketing spend by 20% to drive customer acquisition.",
                    changes=[{"variable_name": "marketing", "change_type": "percentage", "change_value": 20.0}]
                ),
                AIScenarioSuggestion(
                    name="Cost Reduction (-10% Inventory)",
                    description="Renegotiate supplier rates to reduce inventory cost by 10%.",
                    changes=[{"variable_name": "inventory_cost", "change_type": "percentage", "change_value": -10.0}]
                ),
            ]
        )

    @classmethod
    async def explain_results(cls, simulation_result: Dict[str, Any]) -> AIExplainResultsResponse:
        comparison = simulation_result.get("comparison", {})
        baseline = simulation_result.get("scenario", {})
        profit_change = comparison.get("profit_change", 0.0)
        pct_change = comparison.get("profit_change_percentage", 0.0)

        sign = "+" if profit_change >= 0 else ""
        summary_text = (
            f"The scenario results in a net profit change of {sign}₦{profit_change:,.2f} ({sign}{pct_change:.1f}%)."
        )

        return AIExplainResultsResponse(
            summary=summary_text,
            what_happened=f"Net monthly profit shifted from baseline to ₦{baseline.get('profit', 0):,.2f}.",
            why_it_happened="The combined elasticity and expense modifications altered your total operating margin.",
            main_risks="Customer demand sensitivity could fluctuate if market competitors adjust pricing.",
            most_sensitive_variable="Price change & customer volume",
            practical_takeaway="Ensure service quality remains high during pricing adjustments to preserve customer retention."
        )
