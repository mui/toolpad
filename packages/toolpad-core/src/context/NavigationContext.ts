import * as React from 'react';
import type { Navigation } from '../types/Navigation.types';

const NavigationContext = React.createContext<Navigation>([]);

export default NavigationContext;
