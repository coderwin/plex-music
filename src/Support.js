export function formatDuration(input = 0) {
  z = (n) => ((n < 10 ? "0" : "")) + n
  return `${z(Math.floor(input / 60))}:${z(Math.floor(input % 60))}`
};
