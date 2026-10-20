import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Manrope', `url(${staticFile('fonts/manrope-latin.woff2')})`, { weight: '200 800' }),
      new FontFace('DM Sans', `url(${staticFile('fonts/dm-sans-latin.woff2')})`, { weight: '100 1000' }),
    ];
    Promise.all(faces.map((x) => x.load())).then((loaded) => {
      loaded.forEach((x) => document.fonts.add(x));
      continueRender(handle);
    });
  }, [handle]);
};
