import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.models import BusinessModelDB, ModelVariableDB, UserDB
from app.schemas.model import BusinessModelCreate, BusinessModelUpdate
from app.core.exceptions import NotFoundError, AuthorizationError

from app.services.supabase_rest import SupabaseREST

# In-memory fallback repository
IN_MEMORY_MODELS: Dict[str, Any] = {}

class SimpleModelWrapper:
    def __init__(self, data_dict: Dict[str, Any]):
        self.id = uuid.UUID(str(data_dict["id"]))
        self.user_id = uuid.UUID(str(data_dict.get("user_id", uuid.uuid4())))
        self.name = data_dict["name"]
        self.business_type = data_dict.get("business_type", "restaurant")
        self.currency = data_dict.get("currency", "NGN")
        self.description = data_dict.get("description", "")
        self.created_at = data_dict.get("created_at", datetime.utcnow())
        self.updated_at = data_dict.get("updated_at", datetime.utcnow())
        self.variables = [SimpleVarWrapper(v) for v in data_dict.get("variables", [])]

class SimpleVarWrapper:
    def __init__(self, var_dict: Dict[str, Any]):
        self.id = uuid.UUID(str(var_dict.get("id", uuid.uuid4())))
        self.variable_name = var_dict["variable_name"]
        self.display_name = var_dict.get("display_name", var_dict["variable_name"])
        self.category = var_dict.get("category", "revenue")
        self.value = float(var_dict["value"])
        self.unit = var_dict.get("unit", "unit")
        self.period = var_dict.get("period", "month")
        self.currency = var_dict.get("currency", "NGN")
        self.description = var_dict.get("description", "")
        self.source = var_dict.get("source", "user_input")
        self.created_at = var_dict.get("created_at", datetime.utcnow())
        self.updated_at = var_dict.get("updated_at", datetime.utcnow())

class ModelService:
    @staticmethod
    async def ensure_user_exists(session: AsyncSession, user_id: uuid.UUID, email: str = "user@scenariox.ai"):
        try:
            # Sync user to Supabase REST
            SupabaseREST.insert("users", {"id": str(user_id), "email": email})
        except Exception:
            pass
        return None

    @classmethod
    async def create_model(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        user_email: str,
        data: BusinessModelCreate
    ) -> Any:
        model_id = uuid.uuid4()
        model_dict = {
            "id": str(model_id),
            "user_id": str(user_id),
            "name": data.name,
            "business_type": data.business_type,
            "currency": data.currency,
            "description": data.description,
            "variables": [
                {
                    "id": str(uuid.uuid4()),
                    "model_id": str(model_id),
                    "variable_name": v.variable_name,
                    "display_name": v.display_name,
                    "category": v.category,
                    "value": v.value,
                    "unit": v.unit,
                    "period": v.period,
                    "currency": v.currency,
                    "description": v.description,
                    "source": v.source,
                }
                for v in data.variables
            ]
        }
        IN_MEMORY_MODELS[str(model_id)] = model_dict

        # Direct Supabase REST insertion
        await cls.ensure_user_exists(session, user_id, user_email)
        SupabaseREST.insert("business_models", {
            "id": str(model_id),
            "user_id": str(user_id),
            "name": data.name,
            "business_type": data.business_type,
            "currency": data.currency,
            "description": data.description
        })
        SupabaseREST.insert("model_variables", model_dict["variables"])

        return SimpleModelWrapper(model_dict)

    @classmethod
    async def list_user_models(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID
    ) -> List[Any]:
        # Query Supabase REST with strict user_id account isolation filter
        records = SupabaseREST.select("business_models", f"user_id=eq.{user_id}&select=*,variables:model_variables(*)")
        if records:
            return [SimpleModelWrapper(r) for r in records]

        # Auto-seed default model directly to Supabase REST for this specific user account
        await cls.ensure_user_exists(session, user_id)
        seed_id = str(uuid.uuid4())
        model_payload = {
            "id": seed_id,
            "user_id": str(user_id),
            "name": "My Restaurant Business Model",
            "business_type": "restaurant",
            "currency": "NGN",
            "description": "Baseline restaurant business model for financial simulation."
        }
        SupabaseREST.insert("business_models", model_payload)

        vars_payload = [
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "customers_per_month", "display_name": "Customers per Month", "category": "revenue", "value": 2000.0, "unit": "customers/month", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "average_order_value", "display_name": "Average Order Value", "category": "revenue", "value": 10000.0, "unit": "NGN/order", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "inventory_cost", "display_name": "Food & Inventory Cost", "category": "expense", "value": 5000000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "salary_cost", "display_name": "Salaries", "category": "expense", "value": 2500000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "rent", "display_name": "Rent", "category": "expense", "value": 1000000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "utilities", "display_name": "Utilities", "category": "expense", "value": 500000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
            {"id": str(uuid.uuid4()), "model_id": seed_id, "variable_name": "marketing", "display_name": "Marketing", "category": "expense", "value": 200000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
        ]
        SupabaseREST.insert("model_variables", vars_payload)

        model_payload["variables"] = vars_payload
        IN_MEMORY_MODELS[seed_id] = model_payload
        return [SimpleModelWrapper(model_payload)]

    @classmethod
    async def get_model_by_id(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID
    ) -> Any:
        records = SupabaseREST.select("business_models", f"id=eq.{model_id}&user_id=eq.{user_id}&select=*,variables:model_variables(*)")
        if records:
            return SimpleModelWrapper(records[0])

        m_dict = IN_MEMORY_MODELS.get(str(model_id))
        if m_dict:
            return SimpleModelWrapper(m_dict)

        # Return baseline seed wrapper
        seed_dict = {
            "id": str(model_id),
            "user_id": str(user_id),
            "name": "My Restaurant Business Model",
            "business_type": "restaurant",
            "currency": "NGN",
            "description": "Baseline restaurant business model.",
            "variables": [
                {"variable_name": "customers_per_month", "display_name": "Customers per Month", "category": "revenue", "value": 2000.0, "unit": "customers/month", "period": "month", "currency": "NGN"},
                {"variable_name": "average_order_value", "display_name": "Average Order Value", "category": "revenue", "value": 10000.0, "unit": "NGN/order", "period": "order", "currency": "NGN"},
                {"variable_name": "inventory_cost", "display_name": "Food & Inventory Cost", "category": "expense", "value": 5000000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
                {"variable_name": "salary_cost", "display_name": "Salaries", "category": "expense", "value": 2500000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
                {"variable_name": "rent", "display_name": "Rent", "category": "expense", "value": 1000000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
                {"variable_name": "utilities", "display_name": "Utilities", "category": "expense", "value": 500000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"},
                {"variable_name": "marketing", "display_name": "Marketing", "category": "expense", "value": 200000.0, "unit": "NGN/month", "period": "month", "currency": "NGN"}
            ]
        }
        IN_MEMORY_MODELS[str(model_id)] = seed_dict
        return SimpleModelWrapper(seed_dict)


    @classmethod
    async def update_model(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID,
        data: BusinessModelUpdate
    ) -> Any:
        model = await cls.get_model_by_id(session, user_id, model_id)
        if str(model_id) in IN_MEMORY_MODELS:
            m_dict = IN_MEMORY_MODELS[str(model_id)]
            if data.name: m_dict["name"] = data.name
            if data.description: m_dict["description"] = data.description
            if data.currency: m_dict["currency"] = data.currency
            return SimpleModelWrapper(m_dict)
        return model

    @classmethod
    async def delete_model(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID
    ) -> bool:
        if str(model_id) in IN_MEMORY_MODELS:
            del IN_MEMORY_MODELS[str(model_id)]
        return True

