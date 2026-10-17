/** Producto tal como lo devuelve GET /api/products del backend. */
export interface ProductoBackend {
  id: number;
  sku: string;
  name: string;
  currentStock: number;
  dynamicThreshold: number;
  needsRestock?: boolean;
  supplier?: { id: number; name: string } | null;
}
