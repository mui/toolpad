import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { alpha } from '@mui/material/styles';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';

const code = [
  `
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUsers() {
  return prisma.user.findMany();
}

export async function addUser(user: Prisma.UserCreateInput) {
  return prisma.user.create({ data: user });
}

export async function updateUser(id: number) {
  return prisma.user.update({ where: { id } });
}

export async function deleteUser(id: number) {
  return prisma.customer.user({ where: { id } });
}`,

  `
import Stripe from 'stripe';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const stripe = new Stripe(...);

export async function downloadPDF(limit: number = 100) {
  let startingAfter;
  let listInvoices;
  do {
    listInvoices = await stripe.invoices.list({
      starting_after: startingAfter,
      limit,
    });
    const items = listInvoices.data;
    await Promise.all(
      items.map(async (invoice) => {
        try {
          const dest = path.resolve(".", \`invoices-\${invoice.id}.pdf\`);
          // check if destination is resolvable
          if (fs.existsSync(dest)) {
            console.log("Invoice already exists:", dest);
            return;
          }
          const res = await new Promise((resolve, reject) =>
            exec(
              \`curl '\${invoice.invoice_pdf}' -L -o '\${dest}'\`,
              (err, stdout, _stderr) => {
                err ? reject(err) : resolve(stdout);
              }
            )
          );
        } catch (e) {
          console.log(e.stack);
          console.log("Failed to process invoice id:", invoice.id);
          throw e;
        }
      })
    );
    startingAfter = items[items.length - 1].id;
  } while (listInvoices.has_more);
}
`,

  `
import mysql from 'mysql2/promise';
import SSH2Promise from 'ssh2-promise';
import * as fs from 'fs/promises';

export async function getOrders() {
  const sql = await fs.readFile('./getOrders.sql', {
    encoding: 'utf8',
  });

  const connection = await connectionFn(true);
  const [, rows] = await connection.query(sql);
  await connection.end();
  return rows;
}

export async function updateOrder(order_id: number,
  contacted_status: string) {

  const sql = await fs.readFile('./updateOrder.sql', {
    encoding: 'utf8',
  });

  const connection = await connectionFn(true);
  const [, rows] = await connection.execute(sql, {
    order_id,
    contacted_status,
  });
  await connection.end();
  return rows;
}

async function connectionFn(multiple = false) {
  const ssh = new SSH2Promise({
    host: process.env.BASTION_HOST,
    port: 22,
    username: process.env.BASTION_USERNAME,
    privateKey: process.env.BASTION_SSH_KEY.replace(/\\n/g, '\n'),
  });

  const tunnel = await ssh.addTunnel({
    remoteAddr: process.env.MYSQL_HOST,
    remotePort: 3306,
  });

  const connection = await mysql.createConnection({
    host: 'localhost',
    port: tunnel.localPort,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: multiple,
    namedPlaceholders: true,
  });

  return connection;
}`,
];

const filenames = ['users.ts', 'stripeInvoice.tsx', 'orders.ts'];

export default function CodeBlock({ appMode, fileIndex, setFrameIndex }) {
  const tabsRef = React.useRef(null);
  const tabRef = React.useRef(null);
  const [indicatorLeft, setIndicatorLeft] = React.useState(0);
  const updateIndicatorState = React.useCallback(() => {
    const tabs = tabsRef.current;
    const tab = tabRef.current;
    if (tabs && tab) {
      let leftShift = 0;
      Array.from(tabRef.current.parentNode?.children ?? [])?.some((child, index) => {
        if (child) {
          if (index < fileIndex) {
            leftShift += child.getBoundingClientRect().width;
          }
          if (index === fileIndex) {
            return true;
          }
        }
        return false;
      });
      setIndicatorLeft(leftShift);
    }
  }, [fileIndex]);

  const handleTabChange = React.useCallback(
    (event, newValue) => {
      setFrameIndex(newValue * 2);
    },
    [setFrameIndex],
  );
  return (
    <Box
      className="MuiToolpadHero-codeBlock"
      sx={(theme) => ({
        gridRowStart: 1,
        gridRowEnd: 2,
        minWidth: { xs: 'unset', sm: '50%', md: '200%', lg: 560 },
        maxHeight: { xs: 240, sm: 315, md: 420 },
        position: { xs: 'relative', sm: 'absolute', md: 'relative' },
        bottom: { xs: 'unset', sm: 0, md: 'unset' },
        zIndex: 20,
        borderRadius: 1,
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        backgroundColor: '#0F1924',
        backfaceVisibility: 'hidden',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: appMode
          ? { xs: 'rotateY(180deg)', sm: 'unset', md: 'rotateY(180deg)' }
          : 'unset',
        ...theme.applyDarkStyles({
          borderColor: (theme.vars || theme).palette.divider,
          boxShadow: `0 4px 8px ${alpha(theme.palette.primaryDark[900], 0.8)}`,
        }),
      })}
    >
      <TabContext value={fileIndex.toString()}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            backgroundColor: (theme.vars || theme).palette.primaryDark[800],
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderColor: (theme.vars || theme).palette.primaryDark[700],
            ...theme.applyDarkStyles({
              borderColor: (theme.vars || theme).palette.primaryDark[700],
            }),
          })}
        >
          <TabList
            aria-label="Toolpad code tabs"
            onChange={handleTabChange}
            ref={tabsRef}
            action={() => {
              updateIndicatorState();
            }}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{
              sx: {
                left: `${indicatorLeft}px!important`,
                backgroundColor: 'primary.400',
              },
            }}
            sx={{ minHeight: 'auto' }}
          >
            {filenames.map((file, index) => (
              <Tab
                wrapped
                label={file}
                value={index.toString()}
                ref={tabRef}
                key={index}
                sx={(theme) => ({
                  minHeight: 0,
                  padding: '12px 14px',
                  color: (theme.vars || theme).palette.grey[500],
                  '&.Mui-selected': {
                    color: (theme.vars || theme).palette.primary[300],
                  },
                  '&:hover': {
                    color: (theme.vars || theme).palette.grey[300],
                    '&.Mui-selected': {
                      color: (theme.vars || theme).palette.primary[300],
                    },
                  },
                })}
              />
            ))}
          </TabList>
        </Box>
        {filenames.map((file, index) => (
          <TabPanel value={index.toString()} key={index} sx={{ m: 0, p: 0, flex: 1, minHeight: 0 }}>
            <HighlightedCode
              copyButtonHidden
              code={code[index]}
              language="tsx"
              sx={{
                width: '100%',
                height: '100%',
                '& .MuiCode-root': {
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                },
                '& pre': {
                  m: 0,
                  border: 'none',
                  maxHeight: 'fit-content',
                  fontSize: (theme) => ({
                    xs: theme.typography.pxToRem(8.5),
                    md: theme.typography.pxToRem(12),
                  }),
                },
              }}
            />
          </TabPanel>
        ))}
      </TabContext>
    </Box>
  );
}

CodeBlock.propTypes = {
  appMode: PropTypes.bool,
  fileIndex: PropTypes.number,
  setFrameIndex: PropTypes.func,
};
