import * as React from 'react';
import type { Branding } from '../types/Branding.types';

const BrandingContext = React.createContext<Branding | null>(null);

export default BrandingContext;
