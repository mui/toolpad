import * as React from 'react';
import { TypeScript } from '@mui/docs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';

export const componentCode = `
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUsers() {
  return prisma.user.findMany();
}

export async function addUser(user: Prisma.UserCreateInput) {
  return prisma.user.create({ data: user });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
`;

function WindowCircles() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
      <Box
        sx={(theme) => ({
          height: 9,
          width: 9,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.error[400],
        })}
      />
      <Box
        sx={(theme) => ({
          height: 9,
          width: 9,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.warning[400],
        })}
      />
      <Box
        sx={(theme) => ({
          height: 9,
          width: 9,
          borderRadius: 99,
          backgroundColor: (theme.vars || theme).palette.success[400],
        })}
      />
    </Box>
  );
}

export default function CodeBlock() {
  return (
    <Box
      className="code-block"
      sx={(theme) => ({
        position: 'absolute',
        minWidth: 640,
        minHeight: 440,
        zIndex: 20,
        bottom: '50%',
        transform: 'translateY(50%) rotateY(0deg)',
        left: 0,
        borderRadius: 1,
        backgroundColor: (theme.vars || theme).palette.primaryDark[800],
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.primaryDark[700],
        boxShadow: '0px 2px 16px rgba(0,0,0, 0.5)',
        backfaceVisibility: 'hidden',
        transition: 'all 0.8s ease',
        ...theme.applyDarkStyles({
          borderColor: (theme.vars || theme).palette.divider,
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
        <WindowCircles />
        <Typography
          color="grey.200"
          sx={{
            fontFamily: 'monospace',
            fontSize: 8,
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
  );
}
