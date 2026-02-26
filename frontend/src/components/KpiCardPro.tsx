type Props = {
  label: string;
  value: string | number;
  delta?: number; // ej: 12.3
  deltaLabel?: string; // ej: "vs mes anterior"
};

export default function KpiCardPro({ label, value, delta, deltaLabel }: Props) {
  const isDown = typeof delta === "number" && delta < 0;

  return (
    <div className="card">
      <div className="kpiTop">
        <div>
          <div className="kpiLabel">{label}</div>
          <div className="kpiValue">{value}</div>
          {typeof delta === "number" && (
            <div className={`kpiDelta ${isDown ? "deltaDown" : "deltaUp"}`}>
              {isDown ? "▼" : "▲"} {Math.abs(delta).toFixed(2)}%{" "}
              {deltaLabel ? <span style={{ color: "#6b7280", fontWeight: 800 }}> {deltaLabel}</span> : null}
            </div>
          )}
        </div>

        <div style={{ opacity: 0.6, fontWeight: 900 }}>⋯</div>
      </div>
    </div>
  );
}