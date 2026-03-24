export type AdminService = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

export type AdminBarber = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "barbeiro";
  photo_url?: string | null;
  commission_pct: number;
  is_active: boolean;
};

export type AdminClient = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  total_spent: number;
};

export type AdminAppointment = {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  barber_name: string;
  service_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_method?: string | null;
  amount_paid: number;
  notes?: string | null;
  created_at?: string;
};

export type AppointmentStatus = AdminAppointment["status"];

export type AppointmentAuditLog = {
  id: string;
  appointment_id: string;
  action: string;
  old_status: AppointmentStatus | null;
  new_status: AppointmentStatus | null;
  actor_user_id: string | null;
  actor_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type DashboardMetrics = {
  appointmentsToday: number;
  revenueToday: number;
  newClients: number;
  pendingAppointments: number;
};
