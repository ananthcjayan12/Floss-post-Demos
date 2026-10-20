import React from 'react';
import { Composition } from 'remotion';
import { FlossPostDemo } from './Video';
import { FlossPostWalkthrough, WALK_TOTAL } from './Walkthrough';
import { FPS, TOTAL } from './theme';

export const Root: React.FC = () => (
  <>
    <Composition id="FlossPostDemo" component={FlossPostDemo} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition
      id="FlossPostWalkthrough" component={FlossPostWalkthrough} durationInFrames={WALK_TOTAL} fps={FPS} width={1080} height={1920}
    />
  </>
);
