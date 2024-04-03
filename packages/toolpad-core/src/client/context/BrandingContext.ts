import * as React from 'react';
import type { Branding } from '../../types/Branding';

const BrandingContext = React.createContext<Branding | null>(null);

export default BrandingContext;
