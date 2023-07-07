import * as React from 'react';
import { TypeScript } from '@mui/docs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';

export const componentCode = `
import { createQuery } from '@mui/toolpad/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function newUser() {
  return await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      profession: 'teacher',
    },
  });
}

export async function getUser(profession: string) {
  return prisma.user.findMany({
    where: { profession },
  });
}
`;

function WindowCircles() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={(theme) => ({
          height: 10,
          width: 10,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.error[400],
        })}
      />
      <Box
        sx={(theme) => ({
          height: 10,
          width: 10,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.warning[400],
        })}
      />
      <Box
        sx={(theme) => ({
          height: 10,
          width: 10,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.success[400],
        })}
      />
    </Box>
  );
}

export default function CodeBlock() {
  return (
    <Container
      sx={{
        scrollMarginTop: 'calc(var(--MuiDocs-header-height) + 32px)',
      }}
    >
      <Box
        sx={(theme) => ({
          borderRadius: 1,
          backgroundColor: (theme.vars || theme).palette.primaryDark[800],
        })}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'grey.700',
          }}
        >
          <WindowCircles />
          <Typography
            color="grey.200"
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <TypeScript fontSize="small" sx={{ color: 'primary.300', borderRadius: 2 }} />
            function.ts
          </Typography>
        </Box>
        <HighlightedCode
          copyButtonHidden
          component={MarkdownElement}
          code={componentCode}
          language="jsx"
          sx={{ p: 1.5 }}
        />
      </Box>
    </Container>
  );
}
