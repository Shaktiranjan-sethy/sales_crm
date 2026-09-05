import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearToast } from "../features/ui/uiSlice.js";

export default function Toast() {
  const toast = useSelector((s) => s.ui.toast);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch(clearToast()), 2800);
    return () => clearTimeout(t);
  }, [toast, dispatch]);
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}
