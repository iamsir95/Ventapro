import { Product } from '../types';

export const mockProducts: Product[] = [
  // Primary Gear
  {
    id: '1',
    name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
    category: 'Mouse',
    price: 149.99,
    discountPct: 15,
    isHot: true,
    image: 'https://picsum.photos/seed/mouse1/300/300',
    specs: { Sensor: 'Focus Pro 30K Optical', Weight: '63g' }
  },
  {
    id: '2',
    name: 'Logitech G Pro X Superlight 2',
    category: 'Mouse',
    price: 159.00,
    isNew: true,
    image: 'https://picsum.photos/seed/mouse2/300/300',
    specs: { Sensor: 'HERO 2', Weight: '60g' }
  },
  {
    id: '3',
    name: 'Corsair K70 RGB PRO Mechanical Gaming Keyboard',
    category: 'Keyboard',
    price: 169.99,
    image: 'https://picsum.photos/seed/kb1/300/300',
    specs: { Switch: 'Cherry MX Red', Material: 'Aluminum' }
  },
  {
    id: '4',
    name: 'SteelSeries Arctis Nova Pro Wireless',
    category: 'Headset',
    price: 349.99,
    discountPct: 5,
    image: 'https://picsum.photos/seed/headset1/300/300',
    specs: { Drivers: '40mm Neodymium', ANC: 'Active Noise Cancellation' }
  },
  // Recommendation Engine Accessories (Related items)
  {
    id: '5',
    name: 'Razer Strider Hybrid Mouse Mat',
    category: 'Mousepad',
    price: 29.99,
    isHot: true,
    image: 'https://picsum.photos/seed/pad1/300/300',
    specs: { Size: 'Large', Surface: 'Hybrid Cloth/Plastic' }
  },
  {
    id: '6',
    name: 'Logitech G840 XL Gaming Mouse Pad',
    category: 'Mousepad',
    price: 49.99,
    image: 'https://picsum.photos/seed/pad2/300/300',
    specs: { Size: 'Extra Large', Thickness: '3mm' }
  },
  {
    id: '7',
    name: 'HyperX Pudding Keycaps',
    category: 'Keycaps',
    price: 24.99,
    isNew: true,
    image: 'https://picsum.photos/seed/caps1/300/300',
    specs: { Material: 'PBT Double Shot', Layout: 'Standard ANSI' }
  },
  {
    id: '8',
    name: 'Glorious Wooden Wrist Rest',
    category: 'Wrist Rest',
    price: 24.99,
    image: 'https://picsum.photos/seed/wrist1/300/300',
    specs: { Material: 'Solid Wood', Size: 'Full / TKL / Compact' }
  },
  {
    id: '9',
    name: 'Corsair ST100 RGB Premium Headset Stand',
    category: 'Headphone Stand',
    price: 79.99,
    discountPct: 10,
    image: 'https://picsum.photos/seed/stand1/300/300',
    specs: { Audio: '7.1 Surround Sound', Material: 'Aircraft-grade aluminum' }
  }
];
