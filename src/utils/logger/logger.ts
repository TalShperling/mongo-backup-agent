// TODO: add external logger
const logInfo = (message: string) => {
  console.log(`Info: ${message}`);
}

const logError = (err: Error | string) => {
  console.error(`Error: ${err}`);
}

const logDebug = (message: string) => {
  console.debug(`Debug: ${message}`);
}

export { logInfo, logError, logDebug };
