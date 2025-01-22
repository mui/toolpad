'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import { useNotifications } from '../useNotifications';
import { DataModel, DataSource } from './shared';

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
}

function Create<D extends DataModel>(props: CreateProps<D>) {
  const { dataSource } = props;
  const { fields, ...methods } = dataSource;
  const { createOne } = methods;

  const notifications = useNotifications();

  const [, submitAction, isSubmitting] = React.useActionState<null | Error, FormData>(
    async (previousState, formData) => {
      try {
        await createOne(
          Object.fromEntries(fields.map(({ field }) => [field, formData.get(field)])) as D,
        );
        notifications.show('Item created successfully.', {
          severity: 'success',
        });
      } catch (createError) {
        notifications.show(`Failed to create item. Reason: ${(createError as Error).message}`, {
          severity: 'error',
        });
        return createError as Error;
      }

      return null;
    },
    null,
  );

  return (
    <Box component="form" action={submitAction} noValidate autoComplete="off">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {fields.map(({ field, headerName }) => (
          <Grid key={field} size={6}>
            <TextField id={field} label={headerName} sx={{ width: '100%' }} />
          </Grid>
        ))}
      </Grid>
      <Button type="submit" variant="contained" loading={isSubmitting}>
        Create
      </Button>
    </Box>
  );
}

Create.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object.isRequired,
} as any;

export { Create };
