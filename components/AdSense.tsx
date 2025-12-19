'use client';

import { useEffect, useRef } from 'react';

export default function AdSense() {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (adRef.current) return;
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current = true;
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-6059692799023489"
          data-ad-slot="9737844430"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
