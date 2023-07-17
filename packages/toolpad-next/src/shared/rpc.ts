// https://www.jsonrpc.org/specification

import * as z from 'zod';

export const requestIdSchema = z.union([z.string(), z.number(), z.null()]);

export type RequestId = z.infer<typeof requestIdSchema>;

export const rpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.array(z.any()),
  id: requestIdSchema,
});

export type RpcRequest = z.infer<typeof rpcRequestSchema>;

export const rpcErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.any().optional(),
});

export type RpcError = z.infer<typeof rpcErrorSchema>;

export const rpcErrorResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  result: z.undefined(),
  error: rpcErrorSchema,
  id: requestIdSchema,
});

export type RpcErrorResponse = z.infer<typeof rpcErrorResponseSchema>;

export const rpcSuccessResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  result: z.any(),
  error: z.undefined(),
  id: requestIdSchema,
});

export type RpcSuccessResponse = z.infer<typeof rpcSuccessResponseSchema>;

export const rpcResponseSchema = z.union([rpcErrorResponseSchema, rpcSuccessResponseSchema]);

export type RpcResponse = z.infer<typeof rpcResponseSchema>;

export const rpcMessageSchema = z.union([
  z.object({
    request: rpcRequestSchema,
    response: z.undefined().optional(),
  }),
  z.object({
    request: z.undefined().optional(),
    response: rpcResponseSchema,
  }),
]);

export type RpcMessage = z.infer<typeof rpcMessageSchema>;

export type Methods = Record<string, (...args: any[]) => any>;
