import { useImperativeHandle, useRef } from "react";

export function useAndForwardRef<T>(ref: React.Ref<T | null> | undefined) {
  const innerRef = useRef<T>(null);
  useImperativeHandle(ref, () => innerRef.current!, []);
  return innerRef;
}
