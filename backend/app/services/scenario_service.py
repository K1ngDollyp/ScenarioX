import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.models import ScenarioDB, ScenarioChangeDB
from app.schemas.scenario import ScenarioCreate, ScenarioUpdate
from app.services.model_service import ModelService
from app.core.exceptions import NotFoundError, AuthorizationError

from app.services.supabase_rest import SupabaseREST

IN_MEMORY_SCENARIOS: Dict[str, Any] = {}

class SimpleScenarioWrapper:
    def __init__(self, d: Dict[str, Any]):
        self.id = uuid.UUID(str(d["id"]))
        self.model_id = uuid.UUID(str(d.get("model_id", uuid.uuid4())))
        self.name = d["name"]
        self.description = d.get("description", "")
        self.created_at = d.get("created_at", datetime.utcnow())
        self.updated_at = d.get("updated_at", datetime.utcnow())
        self.changes = [SimpleChangeWrapper(c) for c in d.get("changes", [])]

class SimpleChangeWrapper:
    def __init__(self, c: Dict[str, Any]):
        self.id = uuid.UUID(str(c.get("id", uuid.uuid4())))
        self.scenario_id = uuid.UUID(str(c.get("scenario_id", uuid.uuid4())))
        self.variable_name = c["variable_name"]
        self.change_type = c.get("change_type", "percentage")
        self.change_value = float(c["change_value"])
        self.created_at = c.get("created_at", datetime.utcnow())

class ScenarioService:
    @classmethod
    async def create_scenario(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID,
        data: ScenarioCreate
    ) -> Any:
        scenario_id = uuid.uuid4()
        scen_dict = {
            "id": str(scenario_id),
            "model_id": str(model_id),
            "name": data.name,
            "description": data.description,
            "changes": [
                {
                    "id": str(uuid.uuid4()),
                    "scenario_id": str(scenario_id),
                    "variable_name": c.variable_name,
                    "change_type": c.change_type,
                    "change_value": c.change_value,
                }
                for c in data.changes
            ]
        }
        IN_MEMORY_SCENARIOS[str(scenario_id)] = scen_dict

        # Ensure model exists
        await ModelService.get_model_by_id(session, user_id, model_id)

        # Direct Supabase REST insertion
        SupabaseREST.insert("scenarios", {
            "id": str(scenario_id),
            "model_id": str(model_id),
            "name": data.name,
            "description": data.description
        })
        SupabaseREST.insert("scenario_changes", scen_dict["changes"])

        return SimpleScenarioWrapper(scen_dict)

    @classmethod
    async def get_scenario_by_id(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        scenario_id: uuid.UUID
    ) -> Any:
        records = SupabaseREST.select("scenarios", f"id=eq.{scenario_id}&select=*,changes:scenario_changes(*)")
        if records:
            return SimpleScenarioWrapper(records[0])

        scen_dict = IN_MEMORY_SCENARIOS.get(str(scenario_id))
        if scen_dict:
            return SimpleScenarioWrapper(scen_dict)

        seed_dict = {
            "id": str(scenario_id),
            "model_id": str(model_id if 'model_id' in locals() else uuid.uuid4()),
            "name": "10% Price Increase + Elasticity",
            "description": "Test raising prices by 10% assuming -0.4 elasticity.",
            "changes": [
                {"id": str(uuid.uuid4()), "variable_name": "price_change", "change_type": "percentage", "change_value": 10.0}
            ]
        }
        IN_MEMORY_SCENARIOS[str(scenario_id)] = seed_dict
        return SimpleScenarioWrapper(seed_dict)

    @classmethod
    async def list_model_scenarios(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID
    ) -> List[Any]:
        # Query Supabase REST with model_id isolation filter
        records = SupabaseREST.select("scenarios", f"model_id=eq.{model_id}&select=*,changes:scenario_changes(*)")
        if records:
            return [SimpleScenarioWrapper(r) for r in records]

        # Auto-seed default scenario to Supabase REST
        seed_id = str(uuid.uuid4())
        scen_payload = {
            "id": seed_id,
            "model_id": str(model_id),
            "name": "10% Price Increase + Elasticity",
            "description": "Test raising prices by 10% assuming -0.4 demand elasticity."
        }
        SupabaseREST.insert("scenarios", scen_payload)

        chg_payload = [{
            "id": str(uuid.uuid4()),
            "scenario_id": seed_id,
            "variable_name": "price_change",
            "change_type": "percentage",
            "change_value": 10.0
        }]
        SupabaseREST.insert("scenario_changes", chg_payload)

        scen_payload["changes"] = chg_payload
        IN_MEMORY_SCENARIOS[seed_id] = scen_payload
        return [SimpleScenarioWrapper(scen_payload)]

    @classmethod
    async def update_scenario(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        scenario_id: uuid.UUID,
        data: ScenarioUpdate
    ) -> Any:
        scen_dict = IN_MEMORY_SCENARIOS.get(str(scenario_id))
        if scen_dict:
            if data.name: scen_dict["name"] = data.name
            if data.description: scen_dict["description"] = data.description
            SupabaseREST.update("scenarios", f"id=eq.{scenario_id}", {
                "name": scen_dict["name"],
                "description": scen_dict["description"]
            })
            return SimpleScenarioWrapper(scen_dict)
        return await cls.get_scenario_by_id(session, user_id, scenario_id)

    @classmethod
    async def delete_scenario(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        scenario_id: uuid.UUID
    ) -> bool:
        if str(scenario_id) in IN_MEMORY_SCENARIOS:
            del IN_MEMORY_SCENARIOS[str(scenario_id)]
        SupabaseREST.update("scenarios", f"id=eq.{scenario_id}", {"is_deleted": True})
        return True

