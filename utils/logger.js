export const info = (...args) => {
  if (process.env.DEBUG) {
    console.info('[saucedemo]', ...args);
  }
};

export const error = (...args) => {
  console.error('[saucedemo]', ...args);
};
