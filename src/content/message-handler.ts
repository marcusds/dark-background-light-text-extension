import type { MethodIndex, MethodMetadataWithExecutors } from '../common/types';

interface MessageHandlerDeps {
  getCurrentMethodPromise: () => Promise<MethodMetadataWithExecutors>;
}

export function createMessageHandler(deps: MessageHandlerDeps) {
  const { getCurrentMethodPromise } = deps;

  async function handleMessage(
    message: unknown,
  ): Promise<MethodIndex | undefined> {
    const msg = message as { action?: string };
    try {
      if (!msg?.action) {
        console.error('Invalid message format:', message);
        return undefined;
      }

      if (msg.action === 'get_method_number') {
        return (await getCurrentMethodPromise()).number;
      }

      console.error('Unknown message action:', msg.action);
      return undefined;
    } catch (error) {
      console.error('Error handling message:', error);
      return undefined;
    }
  }

  function setupMessageListener(): void {
    browser.runtime.onMessage.addListener(handleMessage);
  }

  return {
    handleMessage,
    setupMessageListener,
  };
}
