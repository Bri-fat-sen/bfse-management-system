import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Reports() {
  return <Navigate to={createPageUrl("Analytics")} replace />;
}