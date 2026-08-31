export function isReaderWordActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

export function shouldActivateReaderWordFromClick(
  detail: number,
  selectionIsCollapsed: boolean,
) {
  return detail === 0 || selectionIsCollapsed;
}
