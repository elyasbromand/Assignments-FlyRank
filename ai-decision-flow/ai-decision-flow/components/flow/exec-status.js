// Shared visual language for a node's live execution state, applied on top
// of each node's normal chrome. idle = no run yet / not on this run's path.
export function execStatusRingClass(status) {
  switch (status) {
    case "running":
      return "ring-2 ring-blue-400 animate-pulse";
    case "success":
      return "ring-2 ring-green-500";
    case "fail":
      return "ring-2 ring-red-500 bg-red-50";
    default:
      return "";
  }
}
