"""
TETRA VISION - Pydantic Data Models & Schemas
"""
from typing import List, Dict, Optional, Literal, Any
from pydantic import BaseModel, Field

TargetYear = int
EnvironmentalLayerId = Literal[
    'extreme_heat',
    'flood_exposure',
    'water_stress',
    'green_cover',
    'air_pollution'
]

class InterventionParameters(BaseModel):
    urban_green_cover: float = Field(default=0.0, ge=0.0, le=40.0, description="% increase in tree canopy")
    cool_roof: float = Field(default=0.0, ge=0.0, le=80.0, description="% adoption of high-albedo roofs")
    water_consumption_reduction: float = Field(default=0.0, ge=0.0, le=50.0, description="% municipal demand reduction")
    rainwater_harvesting: float = Field(default=0.0, ge=0.0, le=100.0, description="% property compliance")
    drainage_improvement: float = Field(default=0.0, ge=0.0, le=100.0, description="% stormwater canal capacity boost")
    emissions_reduction: float = Field(default=0.0, ge=0.0, le=70.0, description="% industrial & transit emissions abatement")

class SimulationRequest(BaseModel):
    cityId: str = Field(default="bengaluru", description="Target city identifier")
    targetYear: TargetYear = Field(default=2035, description="Future simulation year")
    interventions: InterventionParameters

class ComparisonRequest(BaseModel):
    cityId: str = Field(default="bengaluru")
    targetYear: TargetYear = Field(default=2035)
    baselineInterventions: Optional[InterventionParameters] = None
    scenarioInterventions: InterventionParameters

class OptimizeRequest(BaseModel):
    cityId: str = Field(default="bengaluru")
    budgetMillions: float = Field(default=35.0, ge=5.0, le=200.0)
    targetPriority: Literal['balanced', 'extreme_heat', 'flood_exposure', 'water_stress', 'green_cover', 'air_pollution'] = 'balanced'

class SaveScenarioRequest(BaseModel):
    title: str
    description: Optional[str] = "Saved city futures scenario"
    cityId: str
    cityName: Optional[str] = None
    targetYear: TargetYear
    interventions: InterventionParameters
    resilienceScore: Optional[float] = 50.0
    resilienceGain: Optional[float] = 10.0
    tags: Optional[List[str]] = ["Custom Scenario"]

class AIQueryRequest(BaseModel):
    simulation: Dict[str, Any]
    userPrompt: Optional[str] = None
    focusAreaId: Optional[str] = None
