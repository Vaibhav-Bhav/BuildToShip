const userAgent = process.env.npm_config_user_agent || '';

if (!userAgent.startsWith('pnpm/')) {
  console.error('\x1b[31m%s\x1b[0m', 'ResolveAI requires pnpm as the package manager.');
  console.error(`Detected user agent: ${userAgent || 'unknown'}`);
  console.error('Please use pnpm (e.g. `pnpm install`) instead.');
  process.exit(1);
}
