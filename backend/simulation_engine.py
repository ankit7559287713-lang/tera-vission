"""
EARTHSIM: Deterministic Python Simulation Engine
Version: v2.4-deterministic
"""
import time
from typing import Dict, Any, List
from .models import SimulationRequest, InterventionParameters

# Baseline city environmental data catalog
CITIES = {
    "bengaluru": {
        "id": "bengaluru",
        "name": "Bengaluru",
        "areas": [
            {"id": "blr-whitefield", "name": "Whitefield & IT Corridor", "vuln": 1, "heat": 78, "flood": 72, "water": 88, "green": 18, "air": 66, "impervious": 82},
            {"id": "blr-bellandur", "name": "Bellandur & Outer Ring Road", "vuln": 2, "heat": 74, "flood": 92, "water": 84, "green": 15, "air": 70, "impervious": 86},
            {"id": "blr-koramangala", "name": "Koramangala Basin", "vuln": 4, "heat": 68, "flood": 86, "water": 70, "green": 28, "air": 58, "impervious": 74},
            {"id": "blr-peenya", "name": "Peenya Industrial Estate", "vuln": 3, "heat": 86, "flood": 54, "water": 82, "green": 8, "air": 89, "impervious": 89},
            {"id": "blr-malleswaram", "name": "Malleshwaram & Central Core", "vuln": 7, "heat": 52, "flood": 44, "water": 55, "green": 42, "air": 52, "impervious": 62},
            {"id": "blr-indiranagar", "name": "Indiranagar & Halasuru", "vuln": 6, "heat": 58, "flood": 48, "water": 60, "green": 35, "air": 56, "impervious": 68},
            {"id": "blr-electronic-city", "name": "Electronic City", "vuln": 5, "heat": 76, "flood": 60, "water": 86, "green": 20, "air": 62, "impervious": 78},
            {"id": "blr-yelahanka", "name": "Yelahanka & Hebbal", "vuln": 8, "heat": 60, "flood": 64, "water": 68, "green": 30, "air": 59, "impervious": 66}
        ]
    },
    "delhi": {
        "id": "delhi",
        "name": "Delhi NCR",
        "areas": [
            {"id": "del-anand-vihar", "name": "Anand Vihar", "vuln": 1, "heat": 91, "flood": 62, "water": 82, "green": 9, "air": 98, "impervious": 88},
            {"id": "del-okhla", "name": "Okhla Industrial", "vuln": 2, "heat": 88, "flood": 74, "water": 85, "green": 12, "air": 94, "impervious": 86},
            {"id": "del-yamuna-floodplain", "name": "Yamuna Floodplain", "vuln": 3, "heat": 72, "flood": 96, "water": 45, "green": 38, "air": 84, "impervious": 42},
            {"id": "del-chandni-chowk", "name": "Chandni Chowk", "vuln": 4, "heat": 92, "flood": 68, "water": 76, "green": 6, "air": 92, "impervious": 94}
        ]
    }
}

def run_python_simulation(req: SimulationRequest) -> Dict[str, Any]:
    city_data = CITIES.get(req.cityId.lower(), CITIES["bengaluru"])
    areas = city_data["areas"]
    p = req.interventions

    years_ahead = req.targetYear - 2025
    decadal_drift = years_ahead / 10.0

    heat_drift = round(decadal_drift * 4.6, 1)
    flood_drift = round(decadal_drift * 5.2, 1)
    water_drift = round(decadal_drift * 5.8, 1)
    canopy_loss = round(decadal_drift * 3.4, 1)
    air_drift = round(decadal_drift * 2.8, 1)

    area_results = []
    for a in areas:
        imp_factor = a["impervious"] / 100.0

        # Baseline projection
        base_heat = min(100, int(round(a["heat"] + heat_drift * (0.8 + 0.4 * imp_factor))))
        base_flood = min(100, int(round(a["flood"] + flood_drift * (0.7 + 0.5 * imp_factor))))
        base_water = min(100, int(round(a["water"] + water_drift)))
        base_green = max(2, int(round(a["green"] - canopy_loss)))
        base_air = min(100, int(round(a["air"] + air_drift)))

        # Intervention physics
        heat_relief = (0.70 * p.urban_green_cover) + (0.42 * p.cool_roof * (0.8 + 0.3 * imp_factor))
        int_heat = max(15, int(round(base_heat - min(48.0, heat_relief))))

        flood_relief = (0.40 * p.drainage_improvement) + (0.28 * p.rainwater_harvesting) + (0.18 * p.urban_green_cover)
        int_flood = max(12, int(round(base_flood - min(52.0, flood_relief))))

        water_relief = (0.58 * p.water_consumption_reduction) + (0.40 * p.rainwater_harvesting)
        int_water = max(15, int(round(base_water - min(55.0, water_relief))))

        int_green = min(95, int(round(base_green + p.urban_green_cover * 0.92)))

        air_relief = (0.64 * p.emissions_reduction) + (0.16 * p.urban_green_cover)
        int_air = max(15, int(round(base_air - min(50.0, air_relief))))

        area_results.append({
            "areaId": a["id"],
            "areaName": a["name"],
            "vulnerabilityRank": a["vuln"],
            "baseline": {"extreme_heat": base_heat, "flood_exposure": base_flood, "water_stress": base_water, "green_cover": base_green, "air_pollution": base_air},
            "intervention": {"extreme_heat": int_heat, "flood_exposure": int_flood, "water_stress": int_water, "green_cover": int_green, "air_pollution": int_air},
            "deltas": {
                "extreme_heat": int_heat - base_heat,
                "flood_exposure": int_flood - base_flood,
                "water_stress": int_water - base_water,
                "green_cover": int_green - base_green,
                "air_pollution": int_air - base_air
            }
        })

    # Aggregates
    n = len(area_results) or 1
    base_city = {k: int(round(sum(r["baseline"][k] for r in area_results) / n)) for k in ["extreme_heat", "flood_exposure", "water_stress", "green_cover", "air_pollution"]}
    int_city = {k: int(round(sum(r["intervention"][k] for r in area_results) / n)) for k in ["extreme_heat", "flood_exposure", "water_stress", "green_cover", "air_pollution"]}

    def calc_resilience(ind):
        risk_avg = (ind["extreme_heat"] + ind["flood_exposure"] + ind["water_stress"] + ind["air_pollution"]) / 4.0
        return max(10, min(98, int(round(100 - risk_avg * 0.75 + ind["green_cover"] * 0.25))))

    base_res = calc_resilience(base_city)
    int_res = calc_resilience(int_city)

    return {
        "id": f"sim_{city_data['id']}_{req.targetYear}_{int(time.time())}",
        "cityId": city_data["id"],
        "cityName": city_data["name"],
        "targetYear": req.targetYear,
        "interventions": p.dict(),
        "baselineCitywide": base_city,
        "interventionCitywide": int_city,
        "overallResilienceScore": {
            "baseline": base_res,
            "intervention": int_res,
            "gain": int_res - base_res
        },
        "areaResults": area_results,
        "modelVersion": "EARTHSIM-v2.4-python-deterministic"
    }
