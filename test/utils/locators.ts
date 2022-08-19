export function toolpadHomeAppRow(appName: string): string {
  return `[role="row"] >> has="input[value='${appName}']"`;
}
