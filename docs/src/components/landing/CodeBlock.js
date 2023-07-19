import * as React from 'react';
import PropTypes from 'prop-types';
import { TypeScript } from '@mui/docs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';

export const componentCode = `
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCustomers() {
  return prisma.customer.findMany();
}

export async function addCustomer(customer: Prisma.CustomerCreateInput) {
  return prisma.customer.create({ data: customer });
}

export async function updateCustomer(id: number) {
  return prisma.customer.update({ where: { id } });
}

export async function deleteCustomer(id: number) {
  return prisma.customer.delete({ where: { id } });
}
`;

export default function CodeBlock({ appMode }) {
  return (
    <Box
      className="MuiToolpadHero-codeBlock"
      sx={(theme) => ({
        gridRowStart: 1,
        gridRowEnd: 2,
        position: { xs: 'relative', sm: 'absolute', md: 'relative' },
        bottom: { xs: 'unset', sm: 0, md: 'unset' },
        zIndex: 20,
        borderRadius: 1,
        backgroundColor: (theme.vars || theme).palette.primaryDark[800],
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.primaryDark[700],
        backfaceVisibility: 'hidden',
        transition: 'all 0.3s ease',
        transform: appMode
          ? { xs: 'rotateY(180deg)', sm: 'unset', md: 'rotateY(180deg)' }
          : 'unset',
        ...theme.applyDarkStyles({
          borderColor: (theme.vars || theme).palette.divider,
          boxShadow: `0 4px 8px ${alpha(theme.palette.primaryDark[900], 0.8)}`,
        }),
      })}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: (theme.vars || theme).palette.primaryDark[700],
          ...theme.applyDarkStyles({
            borderColor: (theme.vars || theme).palette.primaryDark[700],
          }),
        })}
      >
        <Typography
          color="grey.400"
          sx={{
            fontFamily: 'Menlo',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <TypeScript fontSize="small" sx={{ color: 'primary.300', borderRadius: 2 }} />/
          toolpad/resources/functions.ts
        </Typography>
      </Box>
      <HighlightedCode
        copyButtonHidden
        component={MarkdownElement}
        code={componentCode}
        language="jsx"
        sx={{
          p: 1.5,
          fontSize: (theme) => ({
            xs: theme.typography.pxToRem(7),
            md: theme.typography.pxToRem(12),
          }),
        }}
      />
    </Box>
  );
}

CodeBlock.propTypes = {
  appMode: PropTypes.bool,
};
