export function apiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "Failed to fetch" || /network|fetch/i.test(message)) {
    return "The warehouse service is temporarily unreachable. Your action was not submitted; please try again in a moment.";
  }
  return null;
}
