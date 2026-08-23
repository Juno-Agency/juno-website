/** A portfolio project as returned by the API. */
export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  imageUrl: string;
  imageKey: string;
  url: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Editable subset for the back-office form (server fields excluded). */
export interface PortfolioDraft {
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  imageUrl: string;
  imageKey: string;
  url: string;
  year: string;
  featured: boolean;
  published: boolean;
  order: number;
}

export function emptyPortfolioDraft(): PortfolioDraft {
  return {
    title: '',
    client: '',
    category: '',
    tags: [],
    description: '',
    imageUrl: '',
    imageKey: '',
    url: '',
    year: '',
    featured: false,
    published: true,
    order: 0,
  };
}

export function toPortfolioDraft(item: PortfolioItem): PortfolioDraft {
  return {
    title: item.title,
    client: item.client,
    category: item.category,
    tags: [...item.tags],
    description: item.description,
    imageUrl: item.imageUrl,
    imageKey: item.imageKey,
    url: item.url,
    year: item.year,
    featured: item.featured,
    published: item.published,
    order: item.order,
  };
}
