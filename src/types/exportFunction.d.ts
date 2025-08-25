export function exportFunction(
  func: (...args: unknown[]) => unknown,
  targetScope: object,
  options?: {
    defineAs?: string;
    allowCrossOriginArguments?: boolean;
  },
): (...args: unknown[]) => unknown;
