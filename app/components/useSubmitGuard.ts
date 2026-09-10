"use client";

import { useCallback, useRef, useState } from "react";

export function useSubmitGuard() {
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);

  const begin = useCallback(() => {
    if (lockRef.current || busy) return false;
    lockRef.current = true;
    setBusy(true);
    return true;
  }, [busy]);

  const finish = useCallback(() => {
    lockRef.current = false;
    setBusy(false);
  }, []);

  return { busy, begin, finish, setBusy };
}
