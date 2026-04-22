import { Product } from '../types';

/**
 * Basic recommendation engine analyzing browsing history and past purchases.
 * @param history Current implicit user interest context. 
 * @param allProducts The total available catalog.
 * @param excludeIds Products the user has already viewed or bought (to avoid suggesting what they just bought/viewed).
 */
export function getRecommendations(
  history: { category: string }[],
  allProducts: Product[],
  excludeIds: string[] = []
): Product[] {
  const suggestedCategories = new Set<string>();
  
  // Discover complementary categories based on historical items
  history.forEach(item => {
    // If they look at mice, recommend mousepads
    if (item.category === 'Mouse') {
      suggestedCategories.add('Mousepad');
    } 
    // If they look at keyboards, recommend keycaps and wrist rests
    else if (item.category === 'Keyboard') {
      suggestedCategories.add('Keycaps');
      suggestedCategories.add('Wrist Rest');
    } 
    // If headset -> headphone stand
    else if (item.category === 'Headset') {
      suggestedCategories.add('Headphone Stand');
    }
  });
  
  // Filter products by suggested categories and exclude items they are already looking at
  let recommendations = allProducts.filter(p => 
    suggestedCategories.has(p.category) && !excludeIds.includes(p.id)
  );
  
  // Fallback: If no associated accessories logic matched or available accessories are exhausted
  if (recommendations.length === 0) {
    recommendations = allProducts.filter(p => 
      (p.isHot || p.isNew) && !excludeIds.includes(p.id)
    );
  }
  
  // Return the top 3 best matching options
  return recommendations.slice(0, 3);
}
