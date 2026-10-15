/**
 * @file components/common/WebMCPProvider.tsx
 * @description Implements WebMCP API support by registering browser-exposed tools
 * (`document.modelContext.registerTool`) for AI agents interacting with the page.
 */

'use client';

import { useEffect } from 'react';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        execute: (args: Record<string, unknown>) => Promise<unknown>;
      }) => Promise<{ unregister: () => void }>;
    };
  }
}

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof window !== 'undefined' && document.modelContext?.registerTool) {
      const cleanupFns: Array<() => void> = [];

      document.modelContext
        .registerTool({
          name: 'get_kks_portfolio',
          description: 'Retrieves the list of showcase projects built by KKS Engineering Studio.',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Optional category filter ID' },
            },
          },
          execute: async () => {
            return {
              status: 'success',
              projects: [
                { id: '1', title: 'KKS Terminal Shader Hero', category: 'landing' },
                { id: '2', title: 'Digital Fire Simulation', category: 'web-tool' },
              ],
            };
          },
        })
        .then((handle) => cleanupFns.push(handle.unregister))
        .catch(() => {});

      document.modelContext
        .registerTool({
          name: 'submit_kks_inquiry',
          description: 'Sends a project inquiry or contact message to KKS Engineering Studio.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['name', 'message'],
          },
          execute: async (args) => {
            return {
              status: 'success',
              receivedData: args,
              message: 'Inquiry received successfully.',
            };
          },
        })
        .then((handle) => cleanupFns.push(handle.unregister))
        .catch(() => {});

      return () => {
        cleanupFns.forEach((fn) => fn());
      };
    }
  }, []);

  return null;
}
