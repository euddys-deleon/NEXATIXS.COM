import { Suspense } from "react";
import { ConsultaEstatusClient } from "@/components/estatus/ConsultaEstatusClient";

export default function ConsultaEstatusPage() {
  return (
    <Suspense>
      <ConsultaEstatusClient />
    </Suspense>
  );
}
