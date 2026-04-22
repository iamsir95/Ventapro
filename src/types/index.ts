export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPct?: number;
  isNew?: boolean;
  isHot?: boolean;
  image: string;
  specs: Record<string, string>;
}
