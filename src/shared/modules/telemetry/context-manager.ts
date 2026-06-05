import { context } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';

export const enableAsyncLocalStorageContextManager =
  (): AsyncLocalStorageContextManager => {
    const cm = new AsyncLocalStorageContextManager();
    cm.enable();
    context.setGlobalContextManager(cm);
    return cm;
  };
