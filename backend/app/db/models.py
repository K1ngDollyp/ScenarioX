import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base


class UserDB(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    models = relationship("BusinessModelDB", back_populates="user", cascade="all, delete-orphan")


class BusinessModelDB(Base):
    __tablename__ = "business_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    business_type = Column(String(100), default="restaurant")
    currency = Column(String(10), default="NGN")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    user = relationship("UserDB", back_populates="models")
    variables = relationship("ModelVariableDB", back_populates="model", cascade="all, delete-orphan")
    scenarios = relationship("ScenarioDB", back_populates="model", cascade="all, delete-orphan")
    simulations = relationship("SimulationDB", back_populates="model", cascade="all, delete-orphan")


class ModelVariableDB(Base):
    __tablename__ = "model_variables"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="CASCADE"), nullable=False)
    variable_name = Column(String(100), nullable=False)
    display_name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, default="revenue")
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    period = Column(String(50), default="month")
    currency = Column(String(10), default="NGN")
    description = Column(Text, nullable=True)
    source = Column(String(50), default="user_input")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    model = relationship("BusinessModelDB", back_populates="variables")


class ScenarioDB(Base):
    __tablename__ = "scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    model = relationship("BusinessModelDB", back_populates="scenarios")
    changes = relationship("ScenarioChangeDB", back_populates="scenario", cascade="all, delete-orphan")


class ScenarioChangeDB(Base):
    __tablename__ = "scenario_changes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False)
    variable_name = Column(String(100), nullable=False)
    change_type = Column(String(50), nullable=False, default="percentage")
    change_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    scenario = relationship("ScenarioDB", back_populates="changes")


class SimulationDB(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="CASCADE"), nullable=False)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id", ondelete="SET NULL"), nullable=True)
    simulation_type = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")
    iterations = Column(Integer, default=1)
    random_seed = Column(Integer, nullable=True)
    snapshot_data = Column(JSONB, nullable=False) # Immutable snapshot
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    model = relationship("BusinessModelDB", back_populates="simulations")
    results = relationship("SimulationResultDB", back_populates="simulation", cascade="all, delete-orphan")


class SimulationResultDB(Base):
    __tablename__ = "simulation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metadata_json = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    simulation = relationship("SimulationDB", back_populates="results")


class ForecastDB(Base):
    __tablename__ = "forecasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="CASCADE"), nullable=False)
    metric = Column(String(100), nullable=False)
    period = Column(String(50), nullable=False)
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class OptimizationRunDB(Base):
    __tablename__ = "optimization_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="CASCADE"), nullable=False)
    objective = Column(String(100), nullable=False)
    constraints_json = Column("constraints", JSONB, nullable=False)
    bounds_json = Column("bounds", JSONB, nullable=False)
    result_json = Column("result", JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AIInteractionDB(Base):
    __tablename__ = "ai_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("business_models.id", ondelete="SET NULL"), nullable=True)
    prompt = Column(Text, nullable=False)
    response_json = Column("response", JSONB, nullable=False)
    operation = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
