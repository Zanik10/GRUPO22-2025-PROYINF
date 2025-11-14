import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../utils/api";

export default function LoanVerify() {
  const [params] = useSearchParams();
  const rut = params.get("run");
  const name = params.get("name");

  const [salario, setSalario] = useState("");

  const enviar = async () => {
    await api("/api/loan/complete", {
      method: "POST",
      body: { rut, name, salario }
    });

    alert("Datos enviados correctamente. (Mock sin DB)");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Verificación de Identidad</h2>
      <p><b>Nombre:</b> {name}</p>
      <p><b>RUT:</b> {rut}</p>

      <h3>Ingrese su salario</h3>
      <input
        type="number"
        placeholder="Salario mensual"
        value={salario}
        onChange={(e) => setSalario(e.target.value)}
      />

      <button onClick={enviar}>Confirmar y continuar</button>
    </div>
  );
}
