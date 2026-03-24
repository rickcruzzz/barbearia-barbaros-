import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointments, getDashboardMetrics } from "@/lib/data-access";

export default async function DashboardPage() {
  const [metrics, appointments] = await Promise.all([getDashboardMetrics(), getAppointments(40)]);
  const upcoming = appointments
    .filter((item) => item.status !== "cancelled")
    .sort((a, b) => `${a.date}T${a.start_time}`.localeCompare(`${b.date}T${b.start_time}`))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted">Resumo operacional da barbearia para hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Agendamentos do dia</CardDescription>
            <CardTitle>{metrics.appointmentsToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Receita do dia</CardDescription>
            <CardTitle>R$ {metrics.revenueToday.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Novos clientes</CardDescription>
            <CardTitle>{metrics.newClients}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pendências</CardDescription>
            <CardTitle>{metrics.pendingAppointments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos agendamentos</CardTitle>
          <CardDescription>Visão rápida dos próximos atendimentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcoming.map((appointment: any) => (
              <div key={appointment.id} className="rounded-md border border-border px-3 py-2 text-sm">
                <p className="font-medium">{appointment.client_name ?? "Cliente"}</p>
                <p className="text-muted">
                  {appointment.date} {appointment.start_time} • {appointment.service_name ?? "Serviço"} • {appointment.status ?? "pending"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
