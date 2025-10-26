'use client';

import { useEffect } from 'react';
import InfiniteGallery from './components/InfiniteGallery';
import Header from './components/header';

export default function Home() {
  useEffect(() => {
    // Add landing page class to body to disable scrolling
    document.body.classList.add('landing-page');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  // Sample images for the infinite gallery ADD HERE THE IMAGES YOU WANT TO SHOW
  const sampleImages = [
    { src: '/1.webp', alt: 'Image 1' },
    { src: '/2.png', alt: 'Image 2' },
    { src: '/3.png', alt: 'Image 3' },
    { src: '/4.png', alt: 'Image 4' },
    { src: '/5.png', alt: 'Image 5' },
    { src: '/6.png', alt: 'Image 5' },
  ];

	return (
		<main className="min-h-screen overflow-hidden">
			<Header />
			<InfiniteGallery
				images={sampleImages}
				speed={1.2}
				zSpacing={3}
				visibleCount={12}
				falloff={{ near: 0.8, far: 14 }}
				className="h-screen w-full rounded-lg overflow-hidden"
			/>
			<div className="h-screen inset-0 pointer-events-none fixed flex items-center justify-center text-center px-3 mix-blend-exclusion text-white">
				<h1 className="font-serif text-4xl md:text-7xl tracking-tight">
					Find your <span className="italic">balance</span>.
				</h1>
			</div>

		</main>
	);
}

