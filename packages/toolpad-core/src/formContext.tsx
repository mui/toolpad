import React from 'react';

export type FormValuesType = Record<string, any>;

export const FormValues = React.createContext<null | FormValuesType>(null);

type FieldSetter = (name: string, value: any) => void;

export const SetFormField = React.createContext<null | FieldSetter>(null);
