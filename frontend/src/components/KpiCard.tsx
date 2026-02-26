interface Props {
  title: string;
  value: string | number;
  color?: "green" | "blue" | "orange" | "red";
}

export default function KpiCard({ title, value, color = "blue" }: Props) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>
      <div className={`kpi-value ${color}`}>{value}</div>
    </div>
  );
}