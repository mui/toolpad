import * as React from 'react';

export default function ToolpadDemoVideo() {
  return (
    <video
      width={'100%'}
      playsInline
      autoPlay
      muted
      loop
      poster="/static/toolpad/marketing/hero-screenshot.svg"
    >
      <source src="/static/toolpad/marketing/hero-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
