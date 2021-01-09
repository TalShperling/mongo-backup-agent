import { EventEmitter } from 'events';
import { logError } from '../logger';

export const logDisruptionsOnEventEmitter = (eventEmitter: EventEmitter, eventEmitterName: string): void => {
  eventEmitter.on('error', (err: Error) => {
    logError(err);
  });
  eventEmitter.on('close', () => {
    logError(`${eventEmitterName} has closed`);
  });
  eventEmitter.on('end', () => {
    logError(`${eventEmitterName} has ended`);
  })
}
