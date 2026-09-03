import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.models import SimulationDB, SimulationResultDB
from app.simulation.engine import DeterministicSimulationEngine
from app.services.model_service import ModelService
from app.services.scenario_service import ScenarioService
from app.core.exceptions import NotFoundError, AuthorizationError

IN_MEMORY_SIMULATIONS: Dict[str, Any] = {}

class SimpleSimWrapper:
    def __init__(self, d: Dict[str, Any]):
        self.id = uuid.UUID(str(d["id"]))
        self.model_id = uuid.UUID(str(d["model_id"]))
        self.scenario_id = uuid.UUID(str(d["scenario_id"])) if d.get("scenario_id") else None
        self.simulation_type = d.get("simulation_type", "deterministic")
        self.status = d.get("status", "completed")
        self.iterations = d.get("iterations", 1)
        self.random_seed = d.get("random_seed")
        self.snapshot_data = d.get("snapshot_data", {})
        self.started_at = d.get("started_at", datetime.utcnow())
        self.completed_at = d.get("completed_at", datetime.utcnow())
        self.created_at = d.get("created_at", datetime.utcnow())
        self.results = [SimpleResWrapper(r) for r in d.get("results", [])]

class SimpleResWrapper:
    def __init__(self, r: Dict[str, Any]):
        self.id = uuid.UUID(str(r.get("id", uuid.uuid4())))
        self.simulation_id = uuid.UUID(str(r.get("simulation_id", uuid.uuid4())))
        self.metric_name = r["metric_name"]
        self.metric_value = float(r["metric_value"])
        self.metadata = r.get("metadata", {})
        self.created_at = r.get("created_at", datetime.utcnow())

class SimulationService:
    @classmethod
    async def run_deterministic_simulation(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        scenario_id: uuid.UUID,
        elasticity: float = -0.4
    ) -> Any:
        scenario = await ScenarioService.get_scenario_by_id(session, user_id, scenario_id)
        model = await ModelService.get_model_by_id(session, user_id, scenario.model_id)

        baseline_vars = {v.variable_name: v.value for v in model.variables}
        scenario_changes = [
            {
                "variable_name": c.variable_name,
                "change_type": c.change_type,
                "change_value": c.change_value,
            }
            for c in scenario.changes
        ]

        calc_results = DeterministicSimulationEngine.run_simulation(
            baseline_variables=baseline_vars,
            scenario_changes=scenario_changes,
            elasticity=elasticity
        )

        sim_id = uuid.uuid4()
        snapshot_data = {
            "formula_version": "1.0",
            "elasticity": elasticity,
            "baseline_variables": [
                {
                    "name": v.variable_name,
                    "value": v.value,
                    "unit": v.unit,
                    "period": v.period,
                    "currency": v.currency
                }
                for v in model.variables
            ],
            "scenario_changes": scenario_changes,
            "calculated_at": datetime.utcnow().isoformat(),
        }

        results_list = [
            {"metric_name": "baseline_revenue", "metric_value": calc_results["baseline"]["revenue"], "metadata": {}},
            {"metric_name": "baseline_expenses", "metric_value": calc_results["baseline"]["expenses"], "metadata": {}},
            {"metric_name": "baseline_profit", "metric_value": calc_results["baseline"]["profit"], "metadata": {}},
            {"metric_name": "baseline_profit_margin", "metric_value": calc_results["baseline"]["profit_margin"], "metadata": {}},
            {"metric_name": "scenario_revenue", "metric_value": calc_results["scenario"]["revenue"], "metadata": {}},
            {"metric_name": "scenario_expenses", "metric_value": calc_results["scenario"]["expenses"], "metadata": {}},
            {"metric_name": "scenario_profit", "metric_value": calc_results["scenario"]["profit"], "metadata": {}},
            {"metric_name": "scenario_profit_margin", "metric_value": calc_results["scenario"]["profit_margin"], "metadata": {}},
            {"metric_name": "profit_change", "metric_value": calc_results["comparison"]["profit_change"], "metadata": {}},
            {"metric_name": "profit_change_percentage", "metric_value": calc_results["comparison"]["profit_change_percentage"], "metadata": {}},
        ]

        sim_dict = {
            "id": str(sim_id),
            "model_id": str(model.id),
            "scenario_id": str(scenario_id),
            "simulation_type": "deterministic",
            "status": "completed",
            "iterations": 1,
            "snapshot_data": snapshot_data,
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "results": results_list
        }
        IN_MEMORY_SIMULATIONS[str(sim_id)] = sim_dict

        try:
            simulation = SimulationDB(
                id=sim_id,
                model_id=model.id,
                scenario_id=scenario.id,
                simulation_type="deterministic",
                status="completed",
                iterations=1,
                snapshot_data=snapshot_data,
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
            )
            session.add(simulation)
            await session.flush()

            for m in results_list:
                res_db = SimulationResultDB(
                    id=uuid.uuid4(),
                    simulation_id=simulation.id,
                    metric_name=m["metric_name"],
                    metric_value=float(m["metric_value"]),
                    metadata_json=m["metadata"],
                )
                session.add(res_db)
            await session.commit()
        except Exception:
            pass

        return SimpleSimWrapper(sim_dict)

    @classmethod
    async def get_simulation_by_id(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        simulation_id: uuid.UUID
    ) -> Any:
        try:
            stmt = (
                select(SimulationDB)
                .options(selectinload(SimulationDB.results), selectinload(SimulationDB.model))
                .where(SimulationDB.id == simulation_id)
            )
            res = await session.execute(stmt)
            sim = res.scalar_one_or_none()
            if sim:
                if str(sim.model.user_id) != str(user_id):
                    raise AuthorizationError("You do not own this simulation")
                return sim
        except AuthorizationError:
            raise
        except Exception:
            pass

        s_dict = IN_MEMORY_SIMULATIONS.get(str(simulation_id))
        if s_dict:
            return SimpleSimWrapper(s_dict)

        raise NotFoundError(f"Simulation {simulation_id} not found")

    @classmethod
    async def list_model_simulations(
        cls,
        session: AsyncSession,
        user_id: uuid.UUID,
        model_id: uuid.UUID
    ) -> List[Any]:
        try:
            await ModelService.get_model_by_id(session, user_id, model_id)
            stmt = (
                select(SimulationDB)
                .options(selectinload(SimulationDB.results))
                .where(SimulationDB.model_id == model_id)
                .order_by(SimulationDB.created_at.desc())
            )
            res = await session.execute(stmt)
            sims = list(res.scalars().all())
            if sims:
                return sims
        except Exception:
            pass

        s_list = [s for s in IN_MEMORY_SIMULATIONS.values() if str(s["model_id"]) == str(model_id)]
        return [SimpleSimWrapper(s) for s in s_list]

