export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type AppointmentItem = {
  id: string;
  client_name: string;
  barber_name: string;
  service_name: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  amount_paid: number;
};

export const mockAppointments: AppointmentItem[] = [
  {
    id: "apt-1",
    client_name: "Carlos Mendes",
    barber_name: "Rafael",
    service_name: "Corte Clássico",
    starts_at: "2026-03-25T09:00:00.000Z",
    ends_at: "2026-03-25T09:40:00.000Z",
    status: "confirmed",
    amount_paid: 55,
  },
  {
    id: "apt-2",
    client_name: "João Silva",
    barber_name: "Rafael",
    service_name: "Barba na Régua",
    starts_at: "2026-03-25T10:00:00.000Z",
    ends_at: "2026-03-25T10:30:00.000Z",
    status: "pending",
    amount_paid: 40,
  },
  {
    id: "apt-3",
    client_name: "Marcos Paulo",
    barber_name: "Thiago",
    service_name: "Combo Corte + Barba",
    starts_at: "2026-03-25T11:00:00.000Z",
    ends_at: "2026-03-25T12:00:00.000Z",
    status: "completed",
    amount_paid: 85,
  },
];

export const mockServices = [
  { id: "svc-1", name: "Corte Clássico", description: "Corte social e acabamento", price: 55, duration_minutes: 40, is_active: true },
  { id: "svc-2", name: "Barba na Régua", description: "Modelagem e navalha", price: 40, duration_minutes: 30, is_active: true },
];

export const mockBarbers = [
  { id: "bar-1", name: "Rafael", email: "rafael@barbaros.com", commission_pct: 45, is_active: true },
  { id: "bar-2", name: "Thiago", email: "thiago@barbaros.com", commission_pct: 40, is_active: true },
];

export const mockClients = [
  { id: "cli-1", name: "Carlos Mendes", phone: "(71) 99888-1122", email: "carlos@email.com", total_spent: 280 },
  { id: "cli-2", name: "João Silva", phone: "(71) 99977-5544", email: "joao@email.com", total_spent: 120 },
];
