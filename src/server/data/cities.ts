/**
 * EARTHSIM: City Geospatial & Environmental Baseline Catalog
 */
import { City, CityArea, EnvironmentalLayerMeta } from '../../types/earthsim.ts';

export const ENVIRONMENTAL_LAYERS: EnvironmentalLayerMeta[] = [
  {
    id: 'extreme_heat',
    name: 'Extreme Heat & UHI',
    unit: 'Index (0-100)',
    scaleDescription: 'Surface thermal anomaly & cooling degree day burden (higher = hotter)',
    lowerIsBetter: true,
    colorScale: ['#fef3c7', '#fde047', '#f97316', '#dc2626', '#7f1d1d'],
    icon: 'Thermometer'
  },
  {
    id: 'flood_exposure',
    name: 'Flood Exposure',
    unit: 'Risk Index (0-100)',
    scaleDescription: 'Stormwater runoff coefficient & low-elevation inundation deficit',
    lowerIsBetter: true,
    colorScale: ['#e0f2fe', '#7dd3fc', '#0284c7', '#1e40af', '#172554'],
    icon: 'Waves'
  },
  {
    id: 'water_stress',
    name: 'Water Stress',
    unit: 'Deficit Index (0-100)',
    scaleDescription: 'Groundwater depletion vs municipal supply deficit ratio',
    lowerIsBetter: true,
    colorScale: ['#ecfdf5', '#a7f3d0', '#fbbf24', '#f97316', '#b91c1c'],
    icon: 'Droplets'
  },
  {
    id: 'green_cover',
    name: 'Urban Green Cover',
    unit: 'Canopy Density (%)',
    scaleDescription: 'Vegetative canopy cover derived from high-res NDVI (higher = cooler & better)',
    lowerIsBetter: false,
    colorScale: ['#fef2f2', '#fef08a', '#86efac', '#22c55e', '#14532d'],
    icon: 'Trees'
  },
  {
    id: 'air_pollution',
    name: 'Air Pollution (PM2.5)',
    unit: 'Hazard Index (0-100)',
    scaleDescription: 'Annual PM2.5 concentration & respiratory hazard exposure index',
    lowerIsBetter: true,
    colorScale: ['#f0fdf4', '#fef08a', '#fb923c', '#e11d48', '#581c87'],
    icon: 'Wind'
  }
];

export const CITIES: City[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    region: 'Karnataka (Deccan Plateau)',
    center: [12.9716, 77.5946],
    zoomLevel: 12,
    description: 'High-altitude tech hub experiencing rapid concretization, loss of historical interconnected lake cascading systems, and acute groundwater overdraft.',
    currentYear: 2025,
    climateContext: 'Tropical savanna (Aw/BSh), elevation ~920m. Urban Heat Island delta up to +4.2°C; 79% loss of water bodies over 4 decades.',
    areaCount: 8,
    primaryRisks: ['water_stress', 'flood_exposure', 'extreme_heat'],
    svgViewBox: '0 0 600 500',
    baselinePopulation2011: 8443675,
    annualGrowthRate: 0.032,
    populationSource: 'Census of India 2011 (BBMP enumeration) & MoHFW Technical Group Projections (July 2020)'
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    country: 'India',
    region: 'National Capital Region',
    center: [28.6139, 77.2090],
    zoomLevel: 11,
    description: 'Megacity facing hazardous winter/summer air pollution (severe PM2.5 inversion), lethal summer heat extremes exceeding 47°C, and Yamuna floodplain encroachment.',
    currentYear: 2025,
    climateContext: 'Semi-arid (BSh) with continental extremes. Peak summer surface temps >50°C; severe winter PM2.5 spikes >400 µg/m³.',
    areaCount: 8,
    primaryRisks: ['air_pollution', 'extreme_heat', 'flood_exposure'],
    svgViewBox: '0 0 600 500',
    baselinePopulation2011: 16787941,
    annualGrowthRate: 0.021,
    populationSource: 'Census of India 2011 (NCT of Delhi) & MoHFW Technical Group Urban Projections'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    region: 'Maharashtra (Konkan Coast)',
    center: [19.0760, 72.8777],
    zoomLevel: 11,
    description: 'Coastal linear megacity exposed to extreme monsoon precipitation, sea level rise, high wet-bulb temperatures, and Mithi River basin drainage bottlenecks.',
    currentYear: 2025,
    climateContext: 'Tropical monsoon (Am). High humidity combined with heat index >45°C; flash flooding during high-tide rainfall events.',
    areaCount: 8,
    primaryRisks: ['flood_exposure', 'extreme_heat', 'water_stress'],
    svgViewBox: '0 0 600 500',
    baselinePopulation2011: 12442373,
    annualGrowthRate: 0.014,
    populationSource: 'Census of India 2011 (Greater Mumbai MCGM limits) & MoHFW Projections'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    country: 'India',
    region: 'Tamil Nadu (Coromandel Coast)',
    center: [13.0827, 80.2707],
    zoomLevel: 12,
    description: 'Vulnerable coastal city alternating between catastrophic Day Zero drought cycles and northeast monsoon cyclonic flood inundation.',
    currentYear: 2025,
    climateContext: 'Tropical wet and dry (Aw). High saline intrusion along coast, severe summer heat index, low permeable recharge zones.',
    areaCount: 7,
    primaryRisks: ['water_stress', 'flood_exposure', 'extreme_heat'],
    svgViewBox: '0 0 600 500',
    baselinePopulation2011: 7088000,
    annualGrowthRate: 0.018,
    populationSource: 'Census of India 2011 (Greater Chennai Corporation expanded limits)'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    region: 'Telangana (Deccan Plateau)',
    center: [17.3850, 78.4867],
    zoomLevel: 12,
    description: 'Rapidly expanding IT corridor with significant rocky catchment disruption, Musi River basin pollution, and expanding heat sinks.',
    currentYear: 2025,
    climateContext: 'Tropical wet and dry (Aw). Groundwater depletion in western IT zones; intense flash flooding due to altered natural drainage contours.',
    areaCount: 7,
    primaryRisks: ['water_stress', 'extreme_heat', 'air_pollution'],
    svgViewBox: '0 0 600 500',
    baselinePopulation2011: 6731790,
    annualGrowthRate: 0.024,
    populationSource: 'Census of India 2011 (GHMC municipal boundary)'
  }
];

export const CITY_AREAS: Record<string, CityArea[]> = {
  bengaluru: [
    {
      id: 'blr-whitefield',
      cityId: 'bengaluru',
      name: 'Whitefield & IT Corridor',
      zone: 'East Bengaluru',
      populationEstimate: 420000,
      areaKm2: 38.5,
      center: [12.9698, 77.7500],
      svgPolygon: 'M 420,180 L 520,170 L 550,260 L 440,280 L 400,220 Z',
      baselineIndicators: {
        extreme_heat: 78,
        flood_exposure: 72,
        water_stress: 88,
        green_cover: 18,
        air_pollution: 66
      },
      vulnerabilityRank: 1,
      characteristics: {
        canopyCoverPercent: 12,
        imperviousSurfacePercent: 82,
        floodDrainageCapacityPercent: 34,
        groundwaterDepthMeters: 480,
        pm25AnnualAvg: 64
      }
    },
    {
      id: 'blr-bellandur',
      cityId: 'bengaluru',
      name: 'Bellandur & Outer Ring Road',
      zone: 'South-East Bengaluru',
      populationEstimate: 360000,
      areaKm2: 24.2,
      center: [12.9345, 77.6777],
      svgPolygon: 'M 350,250 L 440,260 L 460,340 L 370,350 L 330,290 Z',
      baselineIndicators: {
        extreme_heat: 74,
        flood_exposure: 92,
        water_stress: 84,
        green_cover: 15,
        air_pollution: 70
      },
      vulnerabilityRank: 2,
      characteristics: {
        canopyCoverPercent: 10,
        imperviousSurfacePercent: 86,
        floodDrainageCapacityPercent: 22,
        groundwaterDepthMeters: 420,
        pm25AnnualAvg: 68
      }
    },
    {
      id: 'blr-koramangala',
      cityId: 'bengaluru',
      name: 'Koramangala Basin',
      zone: 'South Bengaluru',
      populationEstimate: 280000,
      areaKm2: 18.0,
      center: [12.9352, 77.6245],
      svgPolygon: 'M 260,250 L 350,250 L 370,340 L 290,340 L 250,280 Z',
      baselineIndicators: {
        extreme_heat: 68,
        flood_exposure: 86,
        water_stress: 70,
        green_cover: 28,
        air_pollution: 58
      },
      vulnerabilityRank: 4,
      characteristics: {
        canopyCoverPercent: 22,
        imperviousSurfacePercent: 74,
        floodDrainageCapacityPercent: 30,
        groundwaterDepthMeters: 310,
        pm25AnnualAvg: 54
      }
    },
    {
      id: 'blr-peenya',
      cityId: 'bengaluru',
      name: 'Peenya Industrial Estate',
      zone: 'North-West Bengaluru',
      populationEstimate: 310000,
      areaKm2: 28.0,
      center: [13.0285, 77.5197],
      svgPolygon: 'M 80,100 L 200,90 L 190,190 L 90,200 Z',
      baselineIndicators: {
        extreme_heat: 86,
        flood_exposure: 54,
        water_stress: 82,
        green_cover: 8,
        air_pollution: 89
      },
      vulnerabilityRank: 3,
      characteristics: {
        canopyCoverPercent: 6,
        imperviousSurfacePercent: 89,
        floodDrainageCapacityPercent: 48,
        groundwaterDepthMeters: 360,
        pm25AnnualAvg: 92
      }
    },
    {
      id: 'blr-malleswaram',
      cityId: 'bengaluru',
      name: 'Malleshwaram & Central Core',
      zone: 'Central-West Bengaluru',
      populationEstimate: 240000,
      areaKm2: 16.5,
      center: [13.0031, 77.5643],
      svgPolygon: 'M 190,140 L 290,140 L 280,240 L 180,230 Z',
      baselineIndicators: {
        extreme_heat: 52,
        flood_exposure: 44,
        water_stress: 55,
        green_cover: 42,
        air_pollution: 52
      },
      vulnerabilityRank: 7,
      characteristics: {
        canopyCoverPercent: 38,
        imperviousSurfacePercent: 62,
        floodDrainageCapacityPercent: 65,
        groundwaterDepthMeters: 220,
        pm25AnnualAvg: 48
      }
    },
    {
      id: 'blr-indiranagar',
      cityId: 'bengaluru',
      name: 'Indiranagar & Halasuru',
      zone: 'Central-East Bengaluru',
      populationEstimate: 195000,
      areaKm2: 14.8,
      center: [12.9784, 77.6408],
      svgPolygon: 'M 290,170 L 400,160 L 380,240 L 280,240 Z',
      baselineIndicators: {
        extreme_heat: 58,
        flood_exposure: 48,
        water_stress: 60,
        green_cover: 35,
        air_pollution: 56
      },
      vulnerabilityRank: 6,
      characteristics: {
        canopyCoverPercent: 32,
        imperviousSurfacePercent: 68,
        floodDrainageCapacityPercent: 58,
        groundwaterDepthMeters: 250,
        pm25AnnualAvg: 51
      }
    },
    {
      id: 'blr-electronic-city',
      cityId: 'bengaluru',
      name: 'Electronic City Phase 1 & 2',
      zone: 'South Peripheral',
      populationEstimate: 290000,
      areaKm2: 32.0,
      center: [12.8452, 77.6602],
      svgPolygon: 'M 310,360 L 450,350 L 470,460 L 330,470 Z',
      baselineIndicators: {
        extreme_heat: 76,
        flood_exposure: 60,
        water_stress: 86,
        green_cover: 20,
        air_pollution: 62
      },
      vulnerabilityRank: 5,
      characteristics: {
        canopyCoverPercent: 16,
        imperviousSurfacePercent: 78,
        floodDrainageCapacityPercent: 44,
        groundwaterDepthMeters: 450,
        pm25AnnualAvg: 58
      }
    },
    {
      id: 'blr-yelahanka',
      cityId: 'bengaluru',
      name: 'Yelahanka & Hebbal Lake Basin',
      zone: 'North Bengaluru',
      populationEstimate: 330000,
      areaKm2: 35.0,
      center: [13.1007, 77.5963],
      svgPolygon: 'M 200,30 L 360,20 L 380,120 L 220,130 Z',
      baselineIndicators: {
        extreme_heat: 60,
        flood_exposure: 64,
        water_stress: 68,
        green_cover: 30,
        air_pollution: 59
      },
      vulnerabilityRank: 8,
      characteristics: {
        canopyCoverPercent: 26,
        imperviousSurfacePercent: 66,
        floodDrainageCapacityPercent: 52,
        groundwaterDepthMeters: 290,
        pm25AnnualAvg: 55
      }
    }
  ],

  delhi: [
    {
      id: 'del-anand-vihar',
      cityId: 'delhi',
      name: 'Anand Vihar & Trans-Yamuna',
      zone: 'East Delhi',
      populationEstimate: 520000,
      areaKm2: 22.0,
      center: [28.6469, 77.3160],
      svgPolygon: 'M 390,170 L 520,160 L 510,290 L 380,280 Z',
      baselineIndicators: {
        extreme_heat: 91,
        flood_exposure: 62,
        water_stress: 82,
        green_cover: 9,
        air_pollution: 98
      },
      vulnerabilityRank: 1,
      characteristics: {
        canopyCoverPercent: 8,
        imperviousSurfacePercent: 88,
        floodDrainageCapacityPercent: 38,
        groundwaterDepthMeters: 140,
        pm25AnnualAvg: 168
      }
    },
    {
      id: 'del-okhla',
      cityId: 'delhi',
      name: 'Okhla Industrial & Waste Basin',
      zone: 'South-East Delhi',
      populationEstimate: 440000,
      areaKm2: 25.5,
      center: [28.5355, 77.2732],
      svgPolygon: 'M 350,300 L 480,290 L 460,420 L 330,400 Z',
      baselineIndicators: {
        extreme_heat: 88,
        flood_exposure: 74,
        water_stress: 85,
        green_cover: 12,
        air_pollution: 94
      },
      vulnerabilityRank: 2,
      characteristics: {
        canopyCoverPercent: 10,
        imperviousSurfacePercent: 86,
        floodDrainageCapacityPercent: 32,
        groundwaterDepthMeters: 180,
        pm25AnnualAvg: 154
      }
    },
    {
      id: 'del-yamuna-floodplain',
      cityId: 'delhi',
      name: 'Yamuna Floodplain Corridor',
      zone: 'Central-East Riparian',
      populationEstimate: 210000,
      areaKm2: 30.0,
      center: [28.6300, 77.2500],
      svgPolygon: 'M 330,120 L 390,130 L 370,330 L 310,310 Z',
      baselineIndicators: {
        extreme_heat: 72,
        flood_exposure: 96,
        water_stress: 45,
        green_cover: 38,
        air_pollution: 84
      },
      vulnerabilityRank: 3,
      characteristics: {
        canopyCoverPercent: 34,
        imperviousSurfacePercent: 42,
        floodDrainageCapacityPercent: 18,
        groundwaterDepthMeters: 40,
        pm25AnnualAvg: 130
      }
    },
    {
      id: 'del-chandni-chowk',
      cityId: 'delhi',
      name: 'Old Delhi / Chandni Chowk',
      zone: 'Historic Core',
      populationEstimate: 380000,
      areaKm2: 12.0,
      center: [28.6562, 77.2309],
      svgPolygon: 'M 240,160 L 320,150 L 320,240 L 240,240 Z',
      baselineIndicators: {
        extreme_heat: 92,
        flood_exposure: 68,
        water_stress: 76,
        green_cover: 6,
        air_pollution: 92
      },
      vulnerabilityRank: 4,
      characteristics: {
        canopyCoverPercent: 4,
        imperviousSurfacePercent: 94,
        floodDrainageCapacityPercent: 35,
        groundwaterDepthMeters: 90,
        pm25AnnualAvg: 148
      }
    },
    {
      id: 'del-rohini',
      cityId: 'delhi',
      name: 'Rohini & North-West Sub-city',
      zone: 'North-West Delhi',
      populationEstimate: 610000,
      areaKm2: 44.0,
      center: [28.7495, 77.0565],
      svgPolygon: 'M 80,60 L 220,50 L 210,180 L 80,170 Z',
      baselineIndicators: {
        extreme_heat: 84,
        flood_exposure: 52,
        water_stress: 80,
        green_cover: 18,
        air_pollution: 88
      },
      vulnerabilityRank: 5,
      characteristics: {
        canopyCoverPercent: 15,
        imperviousSurfacePercent: 78,
        floodDrainageCapacityPercent: 50,
        groundwaterDepthMeters: 160,
        pm25AnnualAvg: 138
      }
    },
    {
      id: 'del-dwarka',
      cityId: 'delhi',
      name: 'Dwarka Sub-City',
      zone: 'South-West Delhi',
      populationEstimate: 590000,
      areaKm2: 46.0,
      center: [28.5921, 77.0460],
      svgPolygon: 'M 70,220 L 210,210 L 200,380 L 70,360 Z',
      baselineIndicators: {
        extreme_heat: 78,
        flood_exposure: 58,
        water_stress: 86,
        green_cover: 22,
        air_pollution: 82
      },
      vulnerabilityRank: 6,
      characteristics: {
        canopyCoverPercent: 19,
        imperviousSurfacePercent: 76,
        floodDrainageCapacityPercent: 48,
        groundwaterDepthMeters: 210,
        pm25AnnualAvg: 124
      }
    },
    {
      id: 'del-connaught-place',
      cityId: 'delhi',
      name: 'Central Delhi & Lutyens Belt',
      zone: 'Central Urban Core',
      populationEstimate: 160000,
      areaKm2: 26.0,
      center: [28.6315, 77.2167],
      svgPolygon: 'M 220,200 L 310,200 L 300,310 L 210,300 Z',
      baselineIndicators: {
        extreme_heat: 55,
        flood_exposure: 40,
        water_stress: 52,
        green_cover: 52,
        air_pollution: 74
      },
      vulnerabilityRank: 8,
      characteristics: {
        canopyCoverPercent: 48,
        imperviousSurfacePercent: 52,
        floodDrainageCapacityPercent: 72,
        groundwaterDepthMeters: 110,
        pm25AnnualAvg: 98
      }
    },
    {
      id: 'del-ridge-south',
      cityId: 'delhi',
      name: 'Southern Ridge & Vasant Kunj',
      zone: 'South Forest Ridge',
      populationEstimate: 280000,
      areaKm2: 34.0,
      center: [28.5200, 77.1500],
      svgPolygon: 'M 190,320 L 310,310 L 300,440 L 180,430 Z',
      baselineIndicators: {
        extreme_heat: 62,
        flood_exposure: 46,
        water_stress: 72,
        green_cover: 44,
        air_pollution: 78
      },
      vulnerabilityRank: 7,
      characteristics: {
        canopyCoverPercent: 40,
        imperviousSurfacePercent: 58,
        floodDrainageCapacityPercent: 60,
        groundwaterDepthMeters: 190,
        pm25AnnualAvg: 108
      }
    }
  ],

  mumbai: [
    {
      id: 'mum-mithi-basin',
      cityId: 'mumbai',
      name: 'Mithi River Basin & Kurla',
      zone: 'Central Suburbs',
      populationEstimate: 580000,
      areaKm2: 21.0,
      center: [19.0688, 72.8797],
      svgPolygon: 'M 260,200 L 380,190 L 390,290 L 270,300 Z',
      baselineIndicators: {
        extreme_heat: 76,
        flood_exposure: 98,
        water_stress: 60,
        green_cover: 10,
        air_pollution: 75
      },
      vulnerabilityRank: 1,
      characteristics: {
        canopyCoverPercent: 8,
        imperviousSurfacePercent: 92,
        floodDrainageCapacityPercent: 14,
        groundwaterDepthMeters: 25,
        pm25AnnualAvg: 82
      }
    },
    {
      id: 'mum-dharavi',
      cityId: 'mumbai',
      name: 'Dharavi Dense Cluster',
      zone: 'Central Zone',
      populationEstimate: 720000,
      areaKm2: 6.5,
      center: [19.0400, 72.8550],
      svgPolygon: 'M 220,250 L 300,240 L 300,320 L 220,320 Z',
      baselineIndicators: {
        extreme_heat: 92,
        flood_exposure: 94,
        water_stress: 78,
        green_cover: 4,
        air_pollution: 88
      },
      vulnerabilityRank: 2,
      characteristics: {
        canopyCoverPercent: 3,
        imperviousSurfacePercent: 96,
        floodDrainageCapacityPercent: 18,
        groundwaterDepthMeters: 20,
        pm25AnnualAvg: 96
      }
    },
    {
      id: 'mum-bkc',
      cityId: 'mumbai',
      name: 'Bandra-Kurla Complex (BKC)',
      zone: 'Commercial Hub',
      populationEstimate: 140000,
      areaKm2: 12.0,
      center: [19.0657, 72.8688],
      svgPolygon: 'M 300,220 L 390,220 L 380,280 L 290,280 Z',
      baselineIndicators: {
        extreme_heat: 84,
        flood_exposure: 86,
        water_stress: 52,
        green_cover: 14,
        air_pollution: 72
      },
      vulnerabilityRank: 3,
      characteristics: {
        canopyCoverPercent: 12,
        imperviousSurfacePercent: 88,
        floodDrainageCapacityPercent: 35,
        groundwaterDepthMeters: 30,
        pm25AnnualAvg: 76
      }
    },
    {
      id: 'mum-andheri-east',
      cityId: 'mumbai',
      name: 'Andheri East & MIDC',
      zone: 'Western Suburbs',
      populationEstimate: 510000,
      areaKm2: 27.0,
      center: [19.1136, 72.8697],
      svgPolygon: 'M 240,110 L 370,100 L 360,190 L 230,190 Z',
      baselineIndicators: {
        extreme_heat: 82,
        flood_exposure: 78,
        water_stress: 68,
        green_cover: 16,
        air_pollution: 82
      },
      vulnerabilityRank: 4,
      characteristics: {
        canopyCoverPercent: 14,
        imperviousSurfacePercent: 84,
        floodDrainageCapacityPercent: 38,
        groundwaterDepthMeters: 45,
        pm25AnnualAvg: 88
      }
    },
    {
      id: 'mum-colaba',
      cityId: 'mumbai',
      name: 'Colaba & South Tip',
      zone: 'Island City Peninsula',
      populationEstimate: 180000,
      areaKm2: 14.0,
      center: [18.9067, 72.8147],
      svgPolygon: 'M 180,410 L 260,400 L 240,490 L 190,490 Z',
      baselineIndicators: {
        extreme_heat: 58,
        flood_exposure: 82,
        water_stress: 45,
        green_cover: 28,
        air_pollution: 52
      },
      vulnerabilityRank: 6,
      characteristics: {
        canopyCoverPercent: 25,
        imperviousSurfacePercent: 72,
        floodDrainageCapacityPercent: 44,
        groundwaterDepthMeters: 15,
        pm25AnnualAvg: 54
      }
    },
    {
      id: 'mum-dadar',
      cityId: 'mumbai',
      name: 'Dadar & Shivaji Park',
      zone: 'Central Coastal',
      populationEstimate: 290000,
      areaKm2: 15.0,
      center: [19.0178, 72.8478],
      svgPolygon: 'M 190,320 L 280,310 L 270,390 L 190,390 Z',
      baselineIndicators: {
        extreme_heat: 65,
        flood_exposure: 76,
        water_stress: 50,
        green_cover: 26,
        air_pollution: 64
      },
      vulnerabilityRank: 7,
      characteristics: {
        canopyCoverPercent: 24,
        imperviousSurfacePercent: 76,
        floodDrainageCapacityPercent: 42,
        groundwaterDepthMeters: 20,
        pm25AnnualAvg: 68
      }
    },
    {
      id: 'mum-sgnp',
      cityId: 'mumbai',
      name: 'Borivali & SGNP Foothills',
      zone: 'North Mangrove/Forest',
      populationEstimate: 410000,
      areaKm2: 36.0,
      center: [19.2288, 72.8541],
      svgPolygon: 'M 260,20 L 400,20 L 380,100 L 250,100 Z',
      baselineIndicators: {
        extreme_heat: 52,
        flood_exposure: 54,
        water_stress: 48,
        green_cover: 58,
        air_pollution: 54
      },
      vulnerabilityRank: 8,
      characteristics: {
        canopyCoverPercent: 54,
        imperviousSurfacePercent: 46,
        floodDrainageCapacityPercent: 62,
        groundwaterDepthMeters: 55,
        pm25AnnualAvg: 58
      }
    },
    {
      id: 'mum-chembur',
      cityId: 'mumbai',
      name: 'Chembur & Refinery Belt',
      zone: 'Eastern Harbor',
      populationEstimate: 390000,
      areaKm2: 24.0,
      center: [19.0522, 72.8994],
      svgPolygon: 'M 380,260 L 490,250 L 480,360 L 370,360 Z',
      baselineIndicators: {
        extreme_heat: 85,
        flood_exposure: 74,
        water_stress: 64,
        green_cover: 18,
        air_pollution: 91
      },
      vulnerabilityRank: 5,
      characteristics: {
        canopyCoverPercent: 15,
        imperviousSurfacePercent: 82,
        floodDrainageCapacityPercent: 40,
        groundwaterDepthMeters: 35,
        pm25AnnualAvg: 95
      }
    }
  ],

  chennai: [
    {
      id: 'chn-velachery',
      cityId: 'chennai',
      name: 'Velachery & Pallikaranai Marsh',
      zone: 'South Flood Catchment',
      populationEstimate: 340000,
      areaKm2: 26.0,
      center: [12.9815, 80.2180],
      svgPolygon: 'M 280,280 L 410,270 L 420,380 L 290,390 Z',
      baselineIndicators: {
        extreme_heat: 78,
        flood_exposure: 97,
        water_stress: 82,
        green_cover: 16,
        air_pollution: 62
      },
      vulnerabilityRank: 1,
      characteristics: {
        canopyCoverPercent: 14,
        imperviousSurfacePercent: 86,
        floodDrainageCapacityPercent: 16,
        groundwaterDepthMeters: 15,
        pm25AnnualAvg: 60
      }
    },
    {
      id: 'chn-omr-sholinganallur',
      cityId: 'chennai',
      name: 'OMR IT Corridor & Sholinganallur',
      zone: 'South Coastal Expressway',
      populationEstimate: 380000,
      areaKm2: 38.0,
      center: [12.9010, 80.2279],
      svgPolygon: 'M 310,380 L 450,370 L 460,480 L 320,490 Z',
      baselineIndicators: {
        extreme_heat: 82,
        flood_exposure: 88,
        water_stress: 94,
        green_cover: 12,
        air_pollution: 65
      },
      vulnerabilityRank: 2,
      characteristics: {
        canopyCoverPercent: 10,
        imperviousSurfacePercent: 88,
        floodDrainageCapacityPercent: 24,
        groundwaterDepthMeters: 95,
        pm25AnnualAvg: 64
      }
    },
    {
      id: 'chn-t-nagar',
      cityId: 'chennai',
      name: 'T. Nagar & Commercial Core',
      zone: 'Central Chennai',
      populationEstimate: 290000,
      areaKm2: 14.5,
      center: [13.0418, 80.2341],
      svgPolygon: 'M 250,170 L 370,160 L 360,260 L 240,260 Z',
      baselineIndicators: {
        extreme_heat: 88,
        flood_exposure: 82,
        water_stress: 86,
        green_cover: 8,
        air_pollution: 74
      },
      vulnerabilityRank: 3,
      characteristics: {
        canopyCoverPercent: 7,
        imperviousSurfacePercent: 93,
        floodDrainageCapacityPercent: 28,
        groundwaterDepthMeters: 60,
        pm25AnnualAvg: 72
      }
    },
    {
      id: 'chn-ennore',
      cityId: 'chennai',
      name: 'Ennore Port & Thermal Basin',
      zone: 'North Industrial',
      populationEstimate: 230000,
      areaKm2: 32.0,
      center: [13.2162, 80.3228],
      svgPolygon: 'M 340,20 L 480,20 L 460,120 L 330,110 Z',
      baselineIndicators: {
        extreme_heat: 86,
        flood_exposure: 70,
        water_stress: 74,
        green_cover: 14,
        air_pollution: 93
      },
      vulnerabilityRank: 4,
      characteristics: {
        canopyCoverPercent: 11,
        imperviousSurfacePercent: 80,
        floodDrainageCapacityPercent: 36,
        groundwaterDepthMeters: 40,
        pm25AnnualAvg: 96
      }
    },
    {
      id: 'chn-anna-nagar',
      cityId: 'chennai',
      name: 'Anna Nagar & Kilpauk',
      zone: 'North-West Chennai',
      populationEstimate: 310000,
      areaKm2: 21.0,
      center: [13.0850, 80.2100],
      svgPolygon: 'M 150,110 L 270,100 L 260,200 L 140,200 Z',
      baselineIndicators: {
        extreme_heat: 68,
        flood_exposure: 58,
        water_stress: 68,
        green_cover: 28,
        air_pollution: 60
      },
      vulnerabilityRank: 5,
      characteristics: {
        canopyCoverPercent: 25,
        imperviousSurfacePercent: 74,
        floodDrainageCapacityPercent: 54,
        groundwaterDepthMeters: 50,
        pm25AnnualAvg: 58
      }
    },
    {
      id: 'chn-mylapore',
      cityId: 'chennai',
      name: 'Mylapore & Coastal Heritage',
      zone: 'East Coastal',
      populationEstimate: 210000,
      areaKm2: 12.0,
      center: [13.0336, 80.2687],
      svgPolygon: 'M 370,170 L 460,170 L 440,270 L 360,260 Z',
      baselineIndicators: {
        extreme_heat: 66,
        flood_exposure: 64,
        water_stress: 72,
        green_cover: 26,
        air_pollution: 55
      },
      vulnerabilityRank: 6,
      characteristics: {
        canopyCoverPercent: 23,
        imperviousSurfacePercent: 77,
        floodDrainageCapacityPercent: 48,
        groundwaterDepthMeters: 22,
        pm25AnnualAvg: 52
      }
    },
    {
      id: 'chn-guindy',
      cityId: 'chennai',
      name: 'Guindy National Park & IIT',
      zone: 'Central Green Corridor',
      populationEstimate: 160000,
      areaKm2: 18.0,
      center: [13.0067, 80.2206],
      svgPolygon: 'M 220,230 L 310,230 L 300,310 L 210,310 Z',
      baselineIndicators: {
        extreme_heat: 50,
        flood_exposure: 42,
        water_stress: 52,
        green_cover: 56,
        air_pollution: 48
      },
      vulnerabilityRank: 7,
      characteristics: {
        canopyCoverPercent: 52,
        imperviousSurfacePercent: 44,
        floodDrainageCapacityPercent: 70,
        groundwaterDepthMeters: 30,
        pm25AnnualAvg: 44
      }
    }
  ],

  hyderabad: [
    {
      id: 'hyd-hitec-city',
      cityId: 'hyderabad',
      name: 'HITEC City & Gachibowli',
      zone: 'West Cyberabad',
      populationEstimate: 460000,
      areaKm2: 42.0,
      center: [17.4435, 78.3772],
      svgPolygon: 'M 60,160 L 200,140 L 220,280 L 80,300 Z',
      baselineIndicators: {
        extreme_heat: 84,
        flood_exposure: 74,
        water_stress: 91,
        green_cover: 14,
        air_pollution: 68
      },
      vulnerabilityRank: 1,
      characteristics: {
        canopyCoverPercent: 12,
        imperviousSurfacePercent: 86,
        floodDrainageCapacityPercent: 32,
        groundwaterDepthMeters: 280,
        pm25AnnualAvg: 66
      }
    },
    {
      id: 'hyd-patancheru',
      cityId: 'hyderabad',
      name: 'Patancheru & Pharma Belt',
      zone: 'North-West Industrial',
      populationEstimate: 290000,
      areaKm2: 38.0,
      center: [17.5312, 78.2612],
      svgPolygon: 'M 50,30 L 180,20 L 170,140 L 40,140 Z',
      baselineIndicators: {
        extreme_heat: 86,
        flood_exposure: 55,
        water_stress: 84,
        green_cover: 10,
        air_pollution: 94
      },
      vulnerabilityRank: 2,
      characteristics: {
        canopyCoverPercent: 8,
        imperviousSurfacePercent: 82,
        floodDrainageCapacityPercent: 42,
        groundwaterDepthMeters: 240,
        pm25AnnualAvg: 112
      }
    },
    {
      id: 'hyd-old-city',
      cityId: 'hyderabad',
      name: 'Old City & Charminar Basin',
      zone: 'South Historic Core',
      populationEstimate: 540000,
      areaKm2: 24.0,
      center: [17.3616, 78.4747],
      svgPolygon: 'M 240,280 L 370,270 L 360,400 L 230,410 Z',
      baselineIndicators: {
        extreme_heat: 88,
        flood_exposure: 86,
        water_stress: 80,
        green_cover: 8,
        air_pollution: 82
      },
      vulnerabilityRank: 3,
      characteristics: {
        canopyCoverPercent: 6,
        imperviousSurfacePercent: 92,
        floodDrainageCapacityPercent: 26,
        groundwaterDepthMeters: 190,
        pm25AnnualAvg: 80
      }
    },
    {
      id: 'hyd-kukatpally',
      cityId: 'hyderabad',
      name: 'Kukatpally & Miyapur',
      zone: 'North-West Corridor',
      populationEstimate: 480000,
      areaKm2: 32.0,
      center: [17.4849, 78.4138],
      svgPolygon: 'M 180,70 L 300,60 L 290,170 L 170,170 Z',
      baselineIndicators: {
        extreme_heat: 79,
        flood_exposure: 70,
        water_stress: 83,
        green_cover: 16,
        air_pollution: 74
      },
      vulnerabilityRank: 4,
      characteristics: {
        canopyCoverPercent: 14,
        imperviousSurfacePercent: 83,
        floodDrainageCapacityPercent: 36,
        groundwaterDepthMeters: 220,
        pm25AnnualAvg: 72
      }
    },
    {
      id: 'hyd-musi-river',
      cityId: 'hyderabad',
      name: 'Musi Riverfront & Amberpet',
      zone: 'Central Riparian',
      populationEstimate: 320000,
      areaKm2: 20.0,
      center: [17.3900, 78.5100],
      svgPolygon: 'M 320,210 L 460,200 L 440,310 L 310,310 Z',
      baselineIndicators: {
        extreme_heat: 75,
        flood_exposure: 92,
        water_stress: 65,
        green_cover: 18,
        air_pollution: 76
      },
      vulnerabilityRank: 5,
      characteristics: {
        canopyCoverPercent: 16,
        imperviousSurfacePercent: 78,
        floodDrainageCapacityPercent: 22,
        groundwaterDepthMeters: 80,
        pm25AnnualAvg: 74
      }
    },
    {
      id: 'hyd-begumpet',
      cityId: 'hyderabad',
      name: 'Begumpet & Secunderabad',
      zone: 'North-Central',
      populationEstimate: 360000,
      areaKm2: 22.0,
      center: [17.4448, 78.4682],
      svgPolygon: 'M 280,120 L 410,110 L 400,220 L 270,220 Z',
      baselineIndicators: {
        extreme_heat: 72,
        flood_exposure: 58,
        water_stress: 68,
        green_cover: 28,
        air_pollution: 65
      },
      vulnerabilityRank: 6,
      characteristics: {
        canopyCoverPercent: 25,
        imperviousSurfacePercent: 72,
        floodDrainageCapacityPercent: 52,
        groundwaterDepthMeters: 160,
        pm25AnnualAvg: 62
      }
    },
    {
      id: 'hyd-jubilee-hills',
      cityId: 'hyderabad',
      name: 'Jubilee & Banjara Hills',
      zone: 'Central Rocky Ridge',
      populationEstimate: 210000,
      areaKm2: 26.0,
      center: [17.4319, 78.4073],
      svgPolygon: 'M 190,180 L 290,170 L 280,270 L 180,270 Z',
      baselineIndicators: {
        extreme_heat: 58,
        flood_exposure: 46,
        water_stress: 62,
        green_cover: 44,
        air_pollution: 52
      },
      vulnerabilityRank: 7,
      characteristics: {
        canopyCoverPercent: 40,
        imperviousSurfacePercent: 58,
        floodDrainageCapacityPercent: 64,
        groundwaterDepthMeters: 210,
        pm25AnnualAvg: 50
      }
    }
  ]
};
