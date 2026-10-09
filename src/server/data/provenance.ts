/**
 * EARTHSIM: Data Provenance & Evidence Records Catalog
 */
import { DataProvenanceRecord } from '../../types/earthsim.ts';

export const DATA_PROVENANCE_RECORDS: DataProvenanceRecord[] = [
  {
    id: 'era5-land-t2m',
    name: 'Copernicus ERA5-Land Reanalysis (2m Air & Surface Temperature)',
    sourceOrganization: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
    sourceUrl: 'https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land',
    observationPeriod: '1981–2024 (Monthly aggregates & 90th percentile heatwave series)',
    geographicResolution: '0.1° (~9 km gridded native, downscaled with Sentinel-2 DEM to 100m)',
    updateTimestamp: '2024-11-15T00:00:00Z',
    measurementUnits: 'Degrees Celsius (°C) anomaly vs 1991-2020 climatology',
    classification: 'Observed',
    uncertaintyEstimate: '±0.45°C root mean square error against regional IMD automated weather stations',
    processingNotes: 'Urban surface temperature anomaly computed by subtracting rural greenbelt 10km buffer baseline. Downscaled using topographically corrected lapse rates.',
    relevantLayers: ['extreme_heat']
  },
  {
    id: 'landsat-lst-uhi',
    name: 'Landsat 8/9 Thermal Infrared Sensor (TIRS) Land Surface Temperature (LST)',
    sourceOrganization: 'U.S. Geological Survey (USGS) & NASA EarthData',
    sourceUrl: 'https://www.usgs.gov/landsat-missions/landsat-surface-temperature',
    observationPeriod: '2019–2024 (Dry-season summer cloud-free passes: March–May)',
    geographicResolution: '30m spatial resolution',
    updateTimestamp: '2024-06-30T12:00:00Z',
    measurementUnits: 'Kelvin converted to °C; normalized Urban Heat Island (UHI) Index (0-100)',
    classification: 'Observed',
    uncertaintyEstimate: '±0.8°C absolute accuracy under clear sky conditions',
    processingNotes: 'Split-window algorithm calibrated with atmospheric profile data. Normalized into a 0-100 ward severity metric based on local temperature distribution.',
    relevantLayers: ['extreme_heat', 'green_cover']
  },
  {
    id: 'sentinel2-ndvi-canopy',
    name: 'Copernicus Sentinel-2 High-Resolution Normalized Difference Vegetation Index (NDVI)',
    sourceOrganization: 'European Space Agency (ESA) Copernicus Programme',
    sourceUrl: 'https://browser.dataspace.copernicus.eu/',
    observationPeriod: '2022–2024 (Post-monsoon cloud-masked composites: October–December)',
    geographicResolution: '10m multi-spectral resolution',
    updateTimestamp: '2024-12-01T08:00:00Z',
    measurementUnits: 'Tree canopy and vegetative density percentage (%)',
    classification: 'Observed',
    uncertaintyEstimate: '±3.2% canopy area classification accuracy validated against High-Res Aerial Imagery',
    processingNotes: 'NDVI thresholding (NDVI > 0.38 for dense canopy; 0.22-0.38 for sparse grass/shrubs). Impervious surface fraction derived from normalized difference built-up index (NDBI).',
    relevantLayers: ['green_cover', 'extreme_heat', 'flood_exposure']
  },
  {
    id: 'cgwb-aquifer-overdraft',
    name: 'National Aquifer Mapping & Groundwater Overdraft Dynamic Assessment',
    sourceOrganization: 'Central Ground Water Board (CGWB), Ministry of Jal Shakti, Govt. of India',
    sourceUrl: 'https://cgwb.gov.in/en/groundwater-year-books',
    observationPeriod: '2015–2023 (Pre-monsoon May and Post-monsoon November piezometer networks)',
    geographicResolution: 'Block & Taluk administrative scale, spatialized to municipal ward polygons',
    updateTimestamp: '2024-03-20T00:00:00Z',
    measurementUnits: 'Depth to water table (meters below ground level - mbgl) & Stage of Extraction (%)',
    classification: 'Observed',
    uncertaintyEstimate: '±5.8m localized well variance due to hard-rock Deccan fractured basalt and granitic aquifers',
    processingNotes: 'Categorized into safe, semi-critical, critical, and over-exploited blocks (>100% extraction). Normalized into 0-100 water stress index combining depletion and tanker dependency.',
    relevantLayers: ['water_stress']
  },
  {
    id: 'cpcb-caaqms-pm25',
    name: 'Continuous Ambient Air Quality Monitoring Stations (CAAQMS) PM2.5 Grid',
    sourceOrganization: 'Central Pollution Control Board (CPCB) National Clean Air Programme',
    sourceUrl: 'https://app.cpcbccr.com/AQI_India/',
    observationPeriod: '2021–2024 (Hourly beta attenuation monitor records aggregated to annual mean)',
    geographicResolution: 'Point sensor stations interpolated via Kriging with land-use regression (LUR) at 500m',
    updateTimestamp: '2025-01-10T00:00:00Z',
    measurementUnits: 'Micrograms per cubic meter (µg/m³); Indian National Ambient Air Quality Index',
    classification: 'Observed',
    uncertaintyEstimate: '±7.5 µg/m³ due to point station density limitations in outer peripheral corridors',
    processingNotes: 'Harmonized across regional state boards (KSPCB, DPCC, MPCB, TNPCB, TGPCB). Normalized to 0-100 hazard scale where 60 µg/m³ = National Standard (Score 50).',
    relevantLayers: ['air_pollution']
  },
  {
    id: 'cmip6-ssp245-projections',
    name: 'Coupled Model Intercomparison Project Phase 6 (CMIP6) SSP2-4.5 & SSP3-7.0 Multi-Model Ensemble',
    sourceOrganization: 'World Climate Research Programme (WCRP) / NASA NEX-GDDP-CMIP6',
    sourceUrl: 'https://www.nccs.nasa.gov/services/data-collections/land-based-products/nex-gddp-cmip6',
    observationPeriod: '2025–2040 (Ensemble median projections for decadal slices)',
    geographicResolution: '0.25° (~25 km downscaled to municipal boundary domain)',
    updateTimestamp: '2024-08-15T00:00:00Z',
    measurementUnits: 'Temperature shift (+°C), 99th percentile extreme precipitation intensity (+%), dry-spell duration',
    classification: 'Projected',
    uncertaintyEstimate: '10th to 90th percentile ensemble spread: ±0.38°C for 2030, ±0.72°C for 2040',
    processingNotes: 'Bias-corrected spatial disaggregation (BCSD) applied. Baseline warming trajectory assumes SSP2-4.5 (Middle of the Road) with sensitivity bounds under SSP3-7.0.',
    relevantLayers: ['extreme_heat', 'flood_exposure', 'water_stress']
  },
  {
    id: 'earthsim-physics-model-v2',
    name: 'EARTHSIM Micro-Climate & Surface Hydrology Simulation Engine (v2.4-deterministic)',
    sourceOrganization: 'EARTHSIM City Futures Lab Modeling Team',
    sourceUrl: 'https://earthsim.build/models/v2.4-spec',
    observationPeriod: 'Simulated 2025–2040 scenario runs',
    geographicResolution: 'Ward / District polygon level',
    updateTimestamp: '2026-03-01T00:00:00Z',
    measurementUnits: 'Multi-layer delta vectors (% change and normalized index shifts)',
    classification: 'Modeled',
    uncertaintyEstimate: 'Deterministic forward calculation with calibrated sensitivity coefficients (±8–15% confidence interval)',
    processingNotes: 'Explicit, transparent physical and empirical formulas coupling vegetative transpiration cooling, surface albedo reflectivity, SCS-CN runoff mechanics, and dry deposition removal.',
    relevantLayers: ['extreme_heat', 'flood_exposure', 'water_stress', 'green_cover', 'air_pollution']
  }
];
