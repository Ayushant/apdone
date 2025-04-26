export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  coins: number;
  type: 'download' | 'visit';
}

export const offers: Offer[] = [
  {
    id: '1',
    title: 'Play Candy Rush',
    description: 'Download and reach level 10 to earn coins',
    image: 'https://picsum.photos/400/200',
    coins: 500,
    type: 'download',
  },
  {
    id: '2',
    title: 'Complete Survey',
    description: 'Share your opinion and earn coins',
    image: 'https://picsum.photos/400/201',
    coins: 100,
    type: 'visit',
  },
  // Add more offers as needed
];
