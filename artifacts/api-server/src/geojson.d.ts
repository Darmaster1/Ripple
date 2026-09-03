declare module '*.geojson' {
  const value: {
    features: Array<{
      id?: string | number;
      properties: Record<string, any>;
      geometry: { coordinates: number[][][] };
    }>;
  };
  export default value;
}
