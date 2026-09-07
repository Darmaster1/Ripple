import { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, RotateCcw, Loader2 } from 'lucide-react';
import { useGetTwin } from '@workspace/api-client-react';

type RippleMapProps = {
  assets?: any[];
  selected?: string;
  onSelect: (id: string) => void;
  cascade?: boolean;
};

const MAP_CENTER: [number, number] = [77.6409, 12.9707];
const MAP_ZOOM = 15.6;

export const fallbackAssets = [
  { id: 'POWER-S1', type: 'POWER_SUBSTATION', name: 'Indiranagar 110/11 kV Substation', location: { lat: 12.9707, lon: 77.6404 } },
  { id: 'POWER-T2', type: 'TRANSFORMER', name: '100 Feet Road Transformer T2', location: { lat: 12.9721, lon: 77.6422 } },
  { id: 'WATER-P1', type: 'WATER_PUMP', name: 'Indiranagar Booster Pump P1', location: { lat: 12.9698, lon: 77.6435 } },
  { id: 'WATER-N1', type: 'WATER_NODE', name: 'HAL 2nd Stage Distribution Node', location: { lat: 12.9751, lon: 77.6409 } },
  { id: 'TEL-T4', type: 'TELECOM_TOWER', name: '100 Feet Road Telecom Node T4', location: { lat: 12.9719, lon: 77.6386 } },
  { id: 'HOSP-H1', type: 'HOSPITAL', name: 'Manipal Hospital Old Airport Road', location: { lat: 12.9592, lon: 77.6483 } },
  { id: 'FIRE-F1', type: 'FIRE_STATION', name: 'HAL Fire & Emergency Station', location: { lat: 12.9637, lon: 77.6510 } },
  { id: 'POLICE-P2', type: 'POLICE_STATION', name: 'Indiranagar Police Station', location: { lat: 12.9710, lon: 77.6417 } },
  { id: 'TRAFFIC-X1', type: 'TRAFFIC_SIGNAL', name: '100 Feet Road / CMH Junction', location: { lat: 12.9717, lon: 77.6411 } },
  { id: 'BRIDGE-B1', type: 'BRIDGE', name: 'Domlur Flyover Approach', location: { lat: 12.9619, lon: 77.6428 } },
];

const fallbackRoads = [
  { id: 'ROAD-R1', name: '100 Feet Road', road_type: 'PRIMARY', geometry: [{ lat: 12.9694, lon: 77.6360 }, { lat: 12.9717, lon: 77.6411 }, { lat: 12.9746, lon: 77.6452 }] },
  { id: 'ROAD-R2', name: 'CMH Road', road_type: 'PRIMARY', geometry: [{ lat: 12.9695, lon: 77.6358 }, { lat: 12.9740, lon: 77.6399 }] },
  { id: 'ROAD-R3', name: '12th Main Road', road_type: 'SECONDARY', geometry: [{ lat: 12.9672, lon: 77.6424 }, { lat: 12.9728, lon: 77.6420 }, { lat: 12.9760, lon: 77.6418 }] },
  { id: 'ROAD-R4', name: 'Old Airport Road', road_type: 'PRIMARY', geometry: [{ lat: 12.9606, lon: 77.6371 }, { lat: 12.9638, lon: 77.6442 }, { lat: 12.9675, lon: 77.6498 }] },
  { id: 'ROAD-R5', name: '100 Feet Road Service Lane', road_type: 'LOCAL', geometry: [{ lat: 12.9712, lon: 77.6380 }, { lat: 12.9744, lon: 77.6432 }] },
];

const fallbackBuildings = [
  { centroid: { lat: 12.9712, lon: 77.6401 }, area_m2: 450, levels: 6, building_type: 'COMMERCIAL' },
  { centroid: { lat: 12.9723, lon: 77.6410 }, area_m2: 820, levels: 10, building_type: 'HEALTHCARE' },
  { centroid: { lat: 12.9738, lon: 77.6391 }, area_m2: 320, levels: 4, building_type: 'RESIDENTIAL' },
  { centroid: { lat: 12.9689, lon: 77.6377 }, area_m2: 1200, levels: 8, building_type: 'EDUCATION' },
  { centroid: { lat: 12.9757, lon: 77.6440 }, area_m2: 500, levels: 5, building_type: 'RESIDENTIAL' },
  { centroid: { lat: 12.9705, lon: 77.6449 }, area_m2: 680, levels: 5, building_type: 'HEALTHCARE' },
];


function getAssetColor(type: string) {
  switch (type) {
    case 'POWER_SUBSTATION':
    case 'TRANSFORMER': return '#f59e0b';
    case 'WATER_PUMP':
    case 'WATER_NODE': return '#3b82f6';
    case 'TELECOM_TOWER': return '#8b5cf6';
    case 'HOSPITAL': return '#ef4444';
    case 'FIRE_STATION': return '#f97316';
    case 'POLICE_STATION': return '#06b6d4';
    case 'TRAFFIC_SIGNAL': return '#10b981';
    case 'BRIDGE': return '#64748b';
    default: return '#3b82f6';
  }
}

function buildingsToGeoJSON(buildings: any[]) {
  return {
    type: 'FeatureCollection' as const,
    features: buildings.map((b: any) => {
      if (b.geometry) {
        return {
          type: 'Feature' as const,
          properties: { height: b.height || (b.levels || 2) * 3.2, base_height: 0, type: b.building_type },
          geometry: { type: 'Polygon' as const, coordinates: b.geometry },
        };
      }
      const halfSideMeters = Math.sqrt(b.area_m2 || 300) / 2;
      const latRadius = halfSideMeters / 111_000;
      const lonRadius = latRadius / Math.cos((b.centroid.lat * Math.PI) / 180);
      return {
        type: 'Feature' as const,
        properties: {
          height: (b.levels || 3) * 4,
          base_height: 0,
          type: b.building_type,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [b.centroid.lon - lonRadius, b.centroid.lat - latRadius],
            [b.centroid.lon + lonRadius, b.centroid.lat - latRadius],
            [b.centroid.lon + lonRadius, b.centroid.lat + latRadius],
            [b.centroid.lon - lonRadius, b.centroid.lat + latRadius],
            [b.centroid.lon - lonRadius, b.centroid.lat - latRadius],
          ]],
        },
      };
    }),
  };
}

function distanceToSegment(pointLat: number, pointLon: number, start: any, end: any) {
  const scale = Math.cos((pointLat * Math.PI) / 180);
  const x = (pointLon - start.lon) * scale;
  const y = pointLat - start.lat;
  const dx = (end.lon - start.lon) * scale;
  const dy = end.lat - start.lat;
  const lengthSquared = dx * dx + dy * dy;
  const progress = lengthSquared ? Math.max(0, Math.min(1, (x * dx + y * dy) / lengthSquared)) : 0;
  const nearestX = dx * progress;
  const nearestY = dy * progress;
  return Math.hypot(x - nearestX, y - nearestY);
}

function completeBuildings(buildings: any[], roads: any[]) {
  if (buildings.some((building) => building.geometry)) return buildings;
  const infill = [];
  const minLat = 12.9671;
  const minLon = 77.6356;
  const rows = 19;
  const columns = 22;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if ((row * 11 + column * 7) % 9 < 2) continue;
      const levels = 2 + ((row * 3 + column) % 5);
      const centroid = {
        lat: minLat + row * 0.00052,
        lon: minLon + column * 0.00052,
      };
      const nearRoad = roads.some((road: any) => (road.geometry || []).some((point: any, index: number, geometry: any[]) => {
        if (index === 0) return false;
        return distanceToSegment(centroid.lat, centroid.lon, geometry[index - 1], point) < 0.00024;
      }));
      if (nearRoad) continue;
      infill.push({
        id: `MODELED-BLDG-${row}-${column}`,
        building_type: column % 5 === 0 ? 'COMMERCIAL' : 'RESIDENTIAL',
        centroid,
        area_m2: 180 + ((row * 17 + column * 23) % 260),
        levels,
      });
    }
  }

  return [...buildings, ...infill];
}

function roadsToGeoJSON(roads: any[]) {
  return {
    type: 'FeatureCollection' as const,
    features: roads.map((road: any) => ({
      type: 'Feature' as const,
      properties: {
        id: road.id,
        name: road.name,
        road_type: road.road_type,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: (road.geometry || []).map((pt: any) => [pt.lon, pt.lat]),
      },
    })),
  };
}

function flyoversToGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: { type: 'FLYOVER' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [77.6403, 12.9625],
          [77.6437, 12.9632],
          [77.6435, 12.9637],
          [77.6401, 12.9630],
          [77.6403, 12.9625],
        ]],
      },
    }],
  };
}

function fallbackRasterStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        paint: { 'raster-opacity': 0.92, 'raster-saturation': 0.15 },
      },
    ],
  };
}

function addCustomLayers(map: maplibregl.Map, buildings: any[], roads: any[]) {
  const beforeId = map.getStyle().layers?.find((l) => l.type === 'symbol')?.id;

  if (!map.getSource('roads-data')) {
    map.addSource('roads-data', { type: 'geojson', data: roadsToGeoJSON(roads) });
    map.addLayer({
      id: 'roads-casing',
      type: 'line',
      source: 'roads-data',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#334155',
        'line-width': [
          'match', ['get', 'road_type'],
          'PRIMARY', 10,
          'SECONDARY', 7,
          5,
        ],
        'line-opacity': 0.85,
      },
    }, beforeId);
    map.addLayer({
      id: 'roads-surface',
      type: 'line',
      source: 'roads-data',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': [
          'match', ['get', 'road_type'],
          'PRIMARY', '#f8fafc',
          'SECONDARY', '#e2e8f0',
          '#cbd5e1',
        ],
        'line-width': [
          'match', ['get', 'road_type'],
          'PRIMARY', 7,
          'SECONDARY', 5,
          3.5,
        ],
      },
    }, beforeId);
    map.addLayer({
      id: 'roads-labels',
      type: 'symbol',
      source: 'roads-data',
      layout: {
        'symbol-placement': 'line-center',
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-font': ['Open Sans Regular'],
        'text-max-angle': 30,
      },
      paint: {
        'text-color': '#1e293b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    }, beforeId);
  } else {
    (map.getSource('roads-data') as maplibregl.GeoJSONSource).setData(roadsToGeoJSON(roads));
  }

  if (!map.getSource('flyovers-data')) {
    map.addSource('flyovers-data', { type: 'geojson', data: flyoversToGeoJSON() });
    map.addLayer({
      id: 'flyover-footprints',
      type: 'fill',
      source: 'flyovers-data',
      paint: { 'fill-color': '#64748b', 'fill-opacity': 0.85, 'fill-outline-color': '#334155' },
    }, map.getLayer('roads-casing') ? 'roads-casing' : beforeId);
  }

  if (!map.getSource('buildings-data')) {
    map.addSource('buildings-data', { type: 'geojson', data: buildingsToGeoJSON(completeBuildings(buildings, roads)) });
    map.addLayer({
      id: 'building-footprints',
      type: 'fill-extrusion',
      source: 'buildings-data',
      paint: {
        'fill-extrusion-color': [
          'match', ['get', 'type'],
          'HEALTHCARE', '#ef4444',
          'COMMERCIAL', '#3b82f6',
          'EDUCATION', '#f59e0b',
          'MIXED_USE', '#8b5cf6',
          '#64748b',
        ],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'base_height'],
        'fill-extrusion-opacity': 0.85,
      },
    }, map.getLayer('roads-casing') ? 'roads-casing' : beforeId);
  } else {
    (map.getSource('buildings-data') as maplibregl.GeoJSONSource).setData(buildingsToGeoJSON(completeBuildings(buildings, roads)));
  }

}

export function RippleMap({ assets = [], selected, onSelect, cascade = false }: RippleMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const layersReadyRef = useRef(false);
  const { data: twin } = useGetTwin();
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const assetList = assets.length ? assets : (twin?.assets?.length ? twin.assets : fallbackAssets);
  const buildings = twin?.buildings?.length ? twin.buildings : fallbackBuildings;
  const roads = twin?.roads?.length ? twin.roads : fallbackRoads;

  const setupLayers = useCallback((m: maplibregl.Map) => {
    if (!m.isStyleLoaded()) return;
    addCustomLayers(m, buildings, roads);
    layersReadyRef.current = true;
    setMapReady(true);
    setMapError(null);
  }, [buildings, roads]);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: fallbackRasterStyle(),
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 52,
      bearing: -15,
      maxPitch: 85,
      touchZoomRotate: true,
      scrollZoom: true,
      boxZoom: true,
      doubleClickZoom: true,
      keyboard: true,
    });

    map.current = instance;
    resizeObserverRef.current = new ResizeObserver(() => instance.resize());
    resizeObserverRef.current.observe(mapContainer.current);
    instance.resize();

    instance.addControl(new maplibregl.NavigationControl(), 'top-right');
    instance.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), 'bottom-right');

    instance.on('load', () => setupLayers(instance));

    instance.on('style.load', () => {
      layersReadyRef.current = false;
      setupLayers(instance);
    });

    instance.on('idle', () => {
      if (!layersReadyRef.current) setupLayers(instance);
    });
  }, [setupLayers]);

  useEffect(() => {
    initMap();
    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      map.current?.remove();
      map.current = null;
      layersReadyRef.current = false;
    };
  }, [initMap]);

  useEffect(() => {
    if (!map.current || !layersReadyRef.current) return;
    setupLayers(map.current);
  }, [buildings, roads, setupLayers]);

  const resetView = () => {
    map.current?.easeTo({
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 800,
    });
  };

  useEffect(() => {
    if (!map.current || !mapReady) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    assetList.forEach((asset: any) => {
      const el = document.createElement('div');
      const isSelected = selected === asset.id;
      const isCascading = cascade && ['POWER-S1', 'WATER-P1', 'POWER-T2', 'TEL-T4'].includes(asset.id);

      const bgColor = isCascading ? '#ef4444' : isSelected ? '#10b981' : getAssetColor(asset.type);

      el.className = `group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg ${
        isSelected ? 'ring-4 ring-emerald-400 z-20' : ''
      } ${isCascading ? 'animate-pulse z-10' : ''}`;
      el.style.backgroundColor = bgColor;

      el.innerHTML = `<div class="h-3 w-3 rounded-full bg-white shadow-inner"></div>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelect(asset.id);
        map.current?.flyTo({
          center: [asset.location?.lon ?? 77.64, asset.location?.lat ?? 12.97],
          zoom: 17,
          duration: 1200,
        });
      });

      const popup = new maplibregl.Popup({ offset: 28, closeButton: true, maxWidth: '220px' }).setHTML(
        `<div class="p-2">
          <div class="text-xs font-bold text-slate-900">${asset.name}</div>
          <div class="mt-0.5 font-mono text-[10px] text-slate-500">${asset.id}</div>
          <div class="mt-1 text-[10px] text-slate-600">${asset.type?.replace(/_/g, ' ') || 'Infrastructure'}</div>
        </div>`
      );

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([asset.location?.lon ?? 77.64, asset.location?.lat ?? 12.97])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current[asset.id] = marker;
    });
  }, [assetList, selected, cascade, onSelect, mapReady]);

  return (
    <div data-testid="map-twin" className="relative h-[480px] min-h-[480px] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-sm">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full bg-[#1a2e1a]" />

      {!mapReady && !mapError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#1a2e1a]/90 text-white backdrop-blur-sm">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <span className="text-xs font-medium text-emerald-200/80">Loading operational map…</span>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 text-xs text-red-300">
          {mapError}
        </div>
      )}

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-white backdrop-blur">
        <MapPin size={15} className="text-amber-500" />
        <div>
          <div className="text-[11px] font-bold">INDIRANAGAR OPERATIONAL MAP</div>
          <div className="font-mono text-[9px] text-slate-400">Scroll to zoom · Drag to pan · Click a node to inspect</div>
        </div>
      </div>

      <div className="absolute right-4 top-16 z-10 flex flex-col gap-1.5">
        <button
          onClick={resetView}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 bg-slate-900/90 text-white shadow backdrop-blur hover:bg-slate-800"
          title="Reset camera"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-lg border border-slate-700/60 bg-slate-900/90 px-3 py-2 text-[10px] font-medium text-white backdrop-blur">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-500" /> Power</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-blue-500" /> Water</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" /> Healthcare</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-purple-500" /> Telecom</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-slate-400" /> Buildings</span>
      </div>
    </div>
  );
}
