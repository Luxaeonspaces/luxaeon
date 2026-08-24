"use client";

import { useSearchParams } from "next/navigation";
import { FormHTMLAttributes, ReactNode, Suspense } from "react";

type Props = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
  /** Extra key segment so multiple forms on one page clear independently */
  formId?: string;
};

function ClearingFormInner({ children, formId = "form", ...rest }: Props) {
  const sp = useSearchParams();
  const token = sp.get("ok") || sp.get("created") || sp.get("error") || "idle";
  return (
    <form key={`${formId}-${token}`} {...rest}>
      {children}
    </form>
  );
}

/** Use instead of <form> on create/entry forms so fields clear after redirect with ?ok= */
export default function ClearingForm(props: Props) {
  return (
    <Suspense fallback={<form {...props}>{props.children}</form>}>
      <ClearingFormInner {...props} />
    </Suspense>
  );
}
