// from: https://stackoverflow.com/a/29816921/3622350
export function msToMS(ms: number) {
  // Convert to seconds:
  let seconds = ms / 1000;
  // Extract minutes:
  let minutes = Math.floor(seconds / 60); // 60 seconds in 1 minute
  // Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  return numPad(minutes) + ":" + numPad(Math.floor(seconds));
}

function numPad(str: string | number, length: number = 2) {
  str = str + "";
  if (str.length < length) {
    let diff = length - str.length;
    str = "0".repeat(diff) + str;
  }
  return str;
}
