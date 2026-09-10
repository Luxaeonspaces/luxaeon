"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ToastFromParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef(false);

  const ok = searchParams.get("ok");
  const error = searchParams.get("error");

  useEffect(() => {
    if (shown.current) return;
    if (!ok && !error) return;
    shown.current = true;

    if (typeof window !== "undefined" && (window).__luxaeonSubmitToastId) {
      toast.dismiss((window).__luxaeonSubmitToastId);
      delete (window).__luxaeonSubmitToastId;
    }

    if (error) toast.error(error);
    else if (ok) toast.success(ok);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("ok");
    params.delete("error");
    const rest = params.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, error]);

  return null;
}