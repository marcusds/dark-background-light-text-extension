import { darkDatas, isPageDark } from '../utils/isPageDark';
import type { MethodIndex, MethodMetadataWithExecutors } from '../common/types';

interface DomObserverDeps {
  methodResolver: {
    getMethodForUrl: (url: string, forceMethod?: MethodIndex) => Promise<MethodMetadataWithExecutors>;
  };
  darkPageHandler: {
    checkAndPersistDarkPage: () => Promise<void>;
  };
}

export function createDomObserver(deps: DomObserverDeps) {
  const { methodResolver, darkPageHandler } = deps;
  const observers: MutationObserver[] = [];
  let disconnected = false;
  let timeout: number | undefined;

  function disconnectAll(): void {
    if (timeout) clearTimeout(timeout);
    if (!disconnected) {
      observers.forEach((observer) => observer.disconnect());
      disconnected = true;
    }
  }

  function observeClassListChanges(): void {
    timeout = setTimeout(() => disconnectAll(), 45000);
    
    const callback = async (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes'
          && (mutation.attributeName === 'class'
            || mutation.attributeName?.startsWith('data-'))
        ) {
          darkPageHandler.checkAndPersistDarkPage();
          const method = await methodResolver.getMethodForUrl(window.document.documentURI);
          if (isPageDark(method)) {
            disconnectAll();
          }
          break;
        }
      }
    };

    const config = {
      attributes: true,
      attributeFilter: ['class', ...darkDatas.map((value) => `data-${value}`)],
    };

    const body = document.body;
    const html = document.documentElement;

    if (body) {
      const observer = new MutationObserver(callback);
      observer.observe(body, config);
      observers.push(observer);
    }

    if (html) {
      const observer = new MutationObserver(callback);
      observer.observe(html, config);
      observers.push(observer);
    }
  }

  return {
    disconnectAll,
    observeClassListChanges,
  };
}