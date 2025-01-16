'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import { CRUDFields, DataModel } from './shared';

export interface CreateProps<D extends DataModel> {
  /**
   * Fields to show.
   */
  fields: CRUDFields;
  /**
   * Methods to interact with server-side data.
   */
  methods: {
    createOne: (data: Omit<D, 'id'>) => Promise<D>;
  };
}

function Create<D extends DataModel>(props: CreateProps<D>) {
  const { fields, methods } = props;
  const { createOne } = methods;

  return (
    <Box component="form" noValidate autoComplete="off">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {fields.map((field) => (
          <Grid key={field.field} size={6}>
            <TextField id={field.field} label={field.headerName} sx={{ width: '100%' }} />
          </Grid>
        ))}
      </Grid>
      <Button type="submit" variant="contained">
        Contained
      </Button>
    </Box>
  );
}

export { Create };
