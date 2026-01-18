// Import version directly from package.json at build time
import packageJson from '../../package.json';

export function AppVersion() {
  return <span className="text-xs opacity-60">v{packageJson.version}</span>;
}
