"""
TETRA VISION - Python FastAPI REST Server
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from .models import (
    SimulationRequest,
    ComparisonRequest,
    OptimizeRequest,
    SaveScenarioRequest,
    AIQueryRequest
)
from .simulation_engine import run_python_simulation, CITIES

app = FastAPI(
    title="TETRA VISION Platform API",
    description="Explore Tomorrow. Shape a Resilient Planet.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory scenarios storage
SAVED_SCENARIOS: List[Dict[str, Any]] = [
    {
        "id": "scen-blr-sponge-2035",
        "title": "Sponge City Bengaluru 2035",
        "description": "Hydrological restoration with 65% RWH and 60% canal desilting",
        "cityId": "bengaluru",
        "cityName": "Bengaluru",
        "targetYear": 2035,
        "interventions": {
            "urban_green_cover": 25.0,
            "cool_roof": 40.0,
            "water_consumption_reduction": 20.0,
            "rainwater_harvesting": 65.0,
            "drainage_improvement": 60.0,
            "emissions_reduction": 25.0
        },
        "resilienceScore": 78,
        "resilienceGain": 28,
        "tags": ["Sponge City", "Hydrology"]
    }
]

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "TETRA VISION FastAPI Engine",
        "version": "3.0.0",
        "features": {
            "simulationEngine": "deterministic-v3.0",
            "framework": "FastAPI"
        }
    }

@app.get("/api/cities")
def get_cities():
    return {
        "count": len(CITIES),
        "cities": [{"id": k, "name": v["name"]} for k, v in CITIES.items()]
    }

@app.get("/api/cities/{city_id}/areas")
def get_city_areas(city_id: str):
    c = CITIES.get(city_id.lower())
    if not c:
        raise HTTPException(status_code=404, detail="City not found")
    return {"cityId": city_id, "count": len(c["areas"]), "areas": c["areas"]}

@app.post("/api/simulations/run")
def run_simulation(req: SimulationRequest):
    return run_python_simulation(req)

@app.post("/api/simulations/compare")
def compare_simulations(req: ComparisonRequest):
    sim_base = run_python_simulation(SimulationRequest(
        cityId=req.cityId,
        targetYear=req.targetYear,
        interventions=req.baselineInterventions or {"urban_green_cover": 0, "cool_roof": 0, "water_consumption_reduction": 0, "rainwater_harvesting": 0, "drainage_improvement": 0, "emissions_reduction": 0}
    ))
    sim_mod = run_python_simulation(SimulationRequest(
        cityId=req.cityId,
        targetYear=req.targetYear,
        interventions=req.scenarioInterventions
    ))
    return {
        "comparisonId": f"cmp_{req.cityId}_{req.targetYear}",
        "cityId": req.cityId,
        "targetYear": req.targetYear,
        "baseline": sim_base,
        "intervention": sim_mod,
        "netResilienceGain": sim_mod["overallResilienceScore"]["gain"]
    }

@app.get("/api/scenarios")
def get_scenarios():
    return {"count": len(SAVED_SCENARIOS), "scenarios": SAVED_SCENARIOS}

@app.post("/api/scenarios")
def save_scenario(req: SaveScenarioRequest):
    new_scen = req.dict()
    new_scen["id"] = f"scen_{len(SAVED_SCENARIOS) + 1}"
    SAVED_SCENARIOS.append(new_scen)
    return new_scen
