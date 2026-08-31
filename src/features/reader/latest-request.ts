type RequestSequence = { current: number };

export function startLatestRequest(sequence: RequestSequence) {
  const requestId = ++sequence.current;

  return () => requestId === sequence.current;
}

export function invalidateLatestRequest(sequence: RequestSequence) {
  sequence.current += 1;
}
