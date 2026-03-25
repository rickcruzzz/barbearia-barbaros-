import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabasePublic, hasSupabasePublicEnv } from "@/lib/supabasePublic";
import logoPremium from "@/assets/logo-premium.png";

type Service = { id: string; name: string; duration_minutes: number; price: number };
type Barber = { id: string; name: string; photo_url?: string | null };
type BookedRange = { start: string; end: string };
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const DUPLICATE_COOLDOWN_MS = 3 * 60 * 1000;

function mapSupabaseErrorMessage(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string,
  permissionFallback = fallback
) {
  if (!error) return fallback;

  if (error.code === "42501") {
    return permissionFallback;
  }

  const text = String(error.message || "").toLowerCase();
  if (text.includes("permission denied") || text.includes("not allowed")) {
    return permissionFallback;
  }

  return fallback;
}

function isValidClientName(value: string) {
  return value.trim().length >= 3;
}

function sanitizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isValidPhone(value: string) {
  const digits = sanitizePhone(value);
  return digits.length >= 10 && digits.length <= 13;
}

function isValidEmail(value: string) {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getRateLimitTimestamps() {
  try {
    const raw = localStorage.getItem("booking_attempt_timestamps");
    const parsed = raw ? (JSON.parse(raw) as number[]) : [];
    const now = Date.now();
    return parsed.filter((timestamp) => now - timestamp <= RATE_LIMIT_WINDOW_MS);
  } catch {
    return [] as number[];
  }
}

function canSubmitByRateLimit() {
  const recent = getRateLimitTimestamps();
  return recent.length < RATE_LIMIT_MAX;
}

function registerAttemptTimestamp() {
  const recent = getRateLimitTimestamps();
  recent.push(Date.now());
  localStorage.setItem("booking_attempt_timestamps", JSON.stringify(recent));
}

function buildBookingFingerprint(params: {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
}) {
  const base = [
    params.serviceId,
    params.barberId,
    params.date,
    params.time,
    params.name.trim().toLowerCase(),
    sanitizePhone(params.phone),
  ].join("|");
  return `booking_fp_${base}`;
}

function isDuplicateCooldownActive(fingerprint: string) {
  try {
    const raw = localStorage.getItem(fingerprint);
    if (!raw) return false;
    return Date.now() - Number(raw) <= DUPLICATE_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markFingerprintSubmitted(fingerprint: string) {
  localStorage.setItem(fingerprint, String(Date.now()));
}

const FALLBACK_SERVICES: Service[] = [
  { id: "svc-1", name: "Corte Clássico", duration_minutes: 40, price: 55 },
  { id: "svc-2", name: "Barba na Régua", duration_minutes: 30, price: 40 },
  { id: "svc-3", name: "Combo Corte + Barba", duration_minutes: 60, price: 85 },
];

const FALLBACK_BARBERS: Barber[] = [
  { id: "bar-1", name: "Rafael", photo_url: null },
  { id: "bar-2", name: "Thiago", photo_url: null },
];

const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const SLOT_INTERVAL_MIN = 30;

function generateSlots() {
  const slots: string[] = [];
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ALL_SLOTS = generateSlots();

const BOOKING_STEP_LABELS = ["Serviço", "Profissional", "Data", "Horário", "Dados"] as const;

function BookingStepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <p className="font-body text-center text-xs uppercase tracking-[0.2em] text-primary mb-4">
        {step < 6 ? `Etapa ${step} de 5` : "Concluído"}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-1">
        {BOOKING_STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = step === 6 || step > n;
          const current = step === n && step < 6;
          return (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center gap-1 min-w-[3.5rem] sm:min-w-0">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold border-2 transition-colors ${
                    done
                      ? "border-primary bg-primary/20 text-primary"
                      : current
                        ? "border-primary text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]"
                        : "border-primary/25 text-muted-foreground"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done && step !== n ? "✓" : n}
                </span>
                <span
                  className={`text-[10px] sm:text-xs uppercase tracking-wider text-center max-w-[4.5rem] sm:max-w-none leading-tight ${
                    current || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < BOOKING_STEP_LABELS.length - 1 ? (
                <span
                  className="hidden sm:block w-4 md:w-8 h-px shrink-0 bg-primary/25 mb-5"
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AgendarPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>(hasSupabasePublicEnv ? [] : FALLBACK_SERVICES);
  const [barbers, setBarbers] = useState<Barber[]>(hasSupabasePublicEnv ? [] : FALLBACK_BARBERS);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [baseDataError, setBaseDataError] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [websiteField, setWebsiteField] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaA] = useState(() => 2 + Math.floor(Math.random() * 7));
  const [captchaB] = useState(() => 2 + Math.floor(Math.random() * 7));
  const [sessionStartedAt] = useState(() => Date.now());

  const selectedService = services.find((service) => service.id === serviceId);
  const selectedBarber = barbers.find((barber) => barber.id === barberId);

  useEffect(() => {
    setSubmitError("");
  }, [step]);

  useEffect(() => {
    async function loadBaseData() {
      if (!hasSupabasePublicEnv || !supabasePublic) return;
      const [servicesResult, barbersResult] = await Promise.all([
        supabasePublic.from("services").select("id,name,duration_minutes,price").eq("is_active", true).order("name"),
        supabasePublic.from("barbers").select("id,name,photo_url").eq("is_active", true).order("name"),
      ]);

      if (servicesResult.error || barbersResult.error) {
        setBaseDataError("Não foi possível carregar serviços e barbeiros agora.");
        return;
      }

      const loadedServices = (servicesResult.data ?? []) as Service[];
      const loadedBarbers = (barbersResult.data ?? []) as Barber[];
      setServices(loadedServices);
      setBarbers(loadedBarbers);

      // Evita manter selecao antiga de fallback (ex: "bar-1"/"svc-1")
      // quando os IDs reais (UUID) chegam do Supabase.
      setServiceId((current) => (loadedServices.some((item) => item.id === current) ? current : ""));
      setBarberId((current) => (loadedBarbers.some((item) => item.id === current) ? current : ""));

      if (loadedServices.length === 0 || loadedBarbers.length === 0) {
        setBaseDataError("Cadastre serviços e barbeiros ativos no painel admin para liberar o agendamento online.");
      } else {
        setBaseDataError("");
      }
    }
    loadBaseData();
  }, []);

  useEffect(() => {
    async function loadUnavailableSlots() {
      if (!date || !barberId) {
        setBookedRanges([]);
        setAvailabilityError("");
        return;
      }

      setLoadingSlots(true);
      setAvailabilityError("");
      try {
        if (!hasSupabasePublicEnv || !supabasePublic) {
          setBookedRanges([]);
          return;
        }
        if (!UUID_REGEX.test(barberId)) {
          setBookedRanges([]);
          setAvailabilityError("Barbeiros ainda não sincronizados com o banco. Cadastre-os no painel admin.");
          return;
        }

        const { data, error } = await supabasePublic
          .from("appointments")
          .select("start_time,end_time,status")
          .eq("date", date)
          .eq("barber_id", barberId)
          .in("status", ["pending", "confirmed"]);

        if (error) {
          setBookedRanges([]);
          setAvailabilityError(
            mapSupabaseErrorMessage(
              error,
              "Não foi possível carregar horários disponíveis agora.",
              "Permissão de disponibilidade ainda não está liberada. Tente novamente em instantes."
            )
          );
          return;
        }

        const ranges = (data ?? []).map((item: any) => ({
          start: String(item.start_time).slice(0, 5),
          end: String(item.end_time).slice(0, 5),
        }));
        setBookedRanges(ranges);
      } catch {
        setBookedRanges([]);
        setAvailabilityError("Falha temporária ao carregar disponibilidade. Tente novamente.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadUnavailableSlots();
  }, [barberId, date]);

  const availableSlots = useMemo(() => {
    if (!selectedService) return ALL_SLOTS;

    const hasConflict = (slot: string) => {
      const [hour, minute] = slot.split(":").map(Number);
      const startMinutes = hour * 60 + minute;
      const endMinutes = startMinutes + selectedService.duration_minutes;

      return bookedRanges.some((range) => {
        const [bookedStartHour, bookedStartMinute] = range.start.split(":").map(Number);
        const [bookedEndHour, bookedEndMinute] = range.end.split(":").map(Number);
        const bookedStart = bookedStartHour * 60 + bookedStartMinute;
        const bookedEnd = bookedEndHour * 60 + bookedEndMinute;
        return startMinutes < bookedEnd && endMinutes > bookedStart;
      });
    };

    return ALL_SLOTS.filter((slot) => !hasConflict(slot));
  }, [bookedRanges, selectedService]);

  const canAdvance = () => {
    if (step === 1) return Boolean(serviceId);
    if (step === 2) return Boolean(barberId);
    if (step === 3) return Boolean(date);
    if (step === 4) return Boolean(time);
    if (step === 5) {
      const captchaExpected = captchaA + captchaB;
      return Boolean(
        isValidClientName(name) &&
          isValidPhone(phone) &&
          isValidEmail(email) &&
          Number(captchaAnswer) === captchaExpected &&
          !websiteField
      );
    }
    return false;
  };

  const submitAppointment = async () => {
    if (!selectedService || !selectedBarber || !date || !time) return;
    if (websiteField) {
      setSubmitError("Não foi possível concluir agora. Tente novamente.");
      return;
    }
    if (Date.now() - sessionStartedAt < 5000) {
      setSubmitError("Aguarde alguns segundos e tente novamente.");
      return;
    }
    if (!isValidClientName(name)) {
      setSubmitError("Informe um nome válido (mínimo 3 caracteres).");
      return;
    }
    if (!isValidPhone(phone)) {
      setSubmitError("Informe um telefone válido com DDD.");
      return;
    }
    if (!isValidEmail(email)) {
      setSubmitError("Informe um e-mail válido ou deixe em branco.");
      return;
    }
    if (Number(captchaAnswer) !== captchaA + captchaB) {
      setSubmitError("Validação anti-spam inválida.");
      return;
    }
    if (!canSubmitByRateLimit()) {
      setSubmitError("Muitas tentativas em pouco tempo. Aguarde alguns minutos.");
      return;
    }
    const fingerprint = buildBookingFingerprint({
      serviceId: selectedService.id,
      barberId: selectedBarber.id,
      date,
      time,
      name,
      phone,
    });
    if (isDuplicateCooldownActive(fingerprint)) {
      setSubmitError("Você já enviou este agendamento há pouco tempo. Aguarde alguns minutos.");
      return;
    }
    if (!availableSlots.includes(time)) {
      setSubmitError("Horário indisponível no momento. Atualize e escolha outro.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (date < today || date > maxDate) {
      setSubmitError("Selecione uma data válida nos próximos 90 dias.");
      return;
    }
    if (hasSupabasePublicEnv && (!UUID_REGEX.test(selectedService.id) || !UUID_REGEX.test(selectedBarber.id))) {
      setSubmitError("Serviços/barbeiros ainda não sincronizados com o banco. Finalize os cadastros no painel admin.");
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      if (hasSupabasePublicEnv && supabasePublic) {
        const start = time;
        const [hour, minute] = time.split(":").map(Number);
        const endDate = new Date(2026, 0, 1, hour, minute + selectedService.duration_minutes);
        const end = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:00`;

        const [newStartHour, newStartMinute] = start.split(":").map(Number);
        const [newEndHour, newEndMinute] = end.slice(0, 5).split(":").map(Number);
        const newStartMinutes = newStartHour * 60 + newStartMinute;
        const newEndMinutes = newEndHour * 60 + newEndMinute;

        const { data: existingAppointments, error: conflictError } = await supabasePublic
          .from("appointments")
          .select("start_time,end_time,status")
          .eq("date", date)
          .eq("barber_id", selectedBarber.id)
          .in("status", ["pending", "confirmed"]);

        if (conflictError) {
          setSubmitError(
            mapSupabaseErrorMessage(
              conflictError,
              "Não foi possível validar disponibilidade. Tente novamente.",
              "Permissão de disponibilidade ainda não está liberada. Tente novamente em instantes."
            )
          );
          return;
        }

        const hasConflict = (existingAppointments ?? []).some((item: any) => {
          const [existingStartHour, existingStartMinute] = String(item.start_time).slice(0, 5).split(":").map(Number);
          const [existingEndHour, existingEndMinute] = String(item.end_time).slice(0, 5).split(":").map(Number);
          const existingStart = existingStartHour * 60 + existingStartMinute;
          const existingEnd = existingEndHour * 60 + existingEndMinute;
          return newStartMinutes < existingEnd && newEndMinutes > existingStart;
        });

        if (hasConflict) {
          setSubmitError("Esse horário acabou de ser ocupado. Escolha outro.");
          return;
        }

        // Gera o UUID no cliente para nao depender de SELECT/RETURNING no insert publico.
        const generatedClientId = crypto.randomUUID();
        const clientInsert = await supabasePublic
          .from("clients")
          .insert({ id: generatedClientId, name, phone, email: email || null });
        if (clientInsert.error) {
          setSubmitError(
            mapSupabaseErrorMessage(
              clientInsert.error,
              "Falha ao cadastrar cliente.",
              "Permissão de cadastro ainda não está liberada. Tente novamente em instantes."
            )
          );
          return;
        }
        const clientId = generatedClientId;

        if (clientId) {
          const insertAppointment = await supabasePublic.from("appointments").insert({
            client_id: clientId,
            barber_id: selectedBarber.id,
            service_id: selectedService.id,
            date,
            start_time: `${start}:00`,
            end_time: end,
            status: "pending",
            notes: "Agendamento público",
          });

          if (insertAppointment.error) {
            setSubmitError(
              mapSupabaseErrorMessage(
                insertAppointment.error,
                "Falha ao registrar agendamento.",
                "Permissão para criar agendamento ainda não está liberada. Tente novamente em instantes."
              )
            );
            return;
          }
          registerAttemptTimestamp();
          markFingerprintSubmitted(fingerprint);
        } else {
          setSubmitError("Falha ao identificar cliente.");
          return;
        }
      }

      const message = `Olá! Sou ${name}. Quero confirmar meu agendamento:\n- Serviço: ${selectedService.name}\n- Barbeiro: ${selectedBarber.name}\n- Data: ${date}\n- Horário: ${time}`;
      window.open(`https://wa.me/5571983542132?text=${encodeURIComponent(message)}`, "_blank");
      setStep(6);
    } catch {
      setSubmitError("Erro inesperado ao confirmar agendamento.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 6) {
      navigate("/");
      return;
    }

    if (step > 1) {
      setStep((old) => Math.max(1, old - 1));
      return;
    }

    navigate("/");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-primary/25 bg-gradient-to-b from-black/90 via-background to-background">
        <div className="container max-w-3xl px-4 pt-10 pb-8">
          <Link to="/" className="inline-flex text-sm font-medium text-primary hover:underline">
            ← Voltar ao site
          </Link>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="brand-logo-frame brand-logo-frame--header shrink-0 self-start sm:self-center">
              <img src={logoPremium} alt="" className="brand-logo-img brand-logo-img--header" width={120} height={40} />
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-2">Bárbaros Barbershop</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Reserva oficial</h1>
              <p className="text-muted-foreground mt-2 text-base max-w-xl">
                Horários alinhados à agenda real da equipe. Após enviar, você recebe confirmação pelo WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl px-4 py-10 md:py-12">
        <div className="card-dark p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          {step < 6 ? <BookingStepIndicator step={step} /> : null}
          {baseDataError ? <p className="mb-4 text-sm text-amber-300">{baseDataError}</p> : null}
          {submitError ? <p className="mb-4 text-sm text-red-300">{submitError}</p> : null}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Selecione o serviço</h2>
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setServiceId(service.id)}
                  className={`w-full text-left rounded-lg border p-4 md:p-5 transition-colors ${serviceId === service.id ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/20 hover:border-primary/45"}`}
                >
                  <p className="font-semibold text-lg">{service.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{service.duration_minutes} min • R$ {service.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Selecione o profissional</h2>
              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => setBarberId(barber.id)}
                  className={`w-full text-left rounded-lg border p-4 md:p-5 transition-colors ${barberId === barber.id ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-primary/20 hover:border-primary/45"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-primary/30 bg-secondary grid place-items-center text-sm font-semibold shrink-0">
                      {barber.photo_url ? (
                        <img src={barber.photo_url} alt={`Foto de ${barber.name}`} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(barber.name)
                      )}
                    </div>
                    <span className="font-semibold text-lg">{barber.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Escolha a data</h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full max-w-sm bg-secondary border border-primary/20 rounded-lg px-4 py-3.5 text-base"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Escolha o horário</h2>
              {loadingSlots ? <p className="text-sm text-muted-foreground">Carregando horários...</p> : null}
              {availabilityError ? <p className="text-sm text-red-300">{availabilityError}</p> : null}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium ${time === slot ? "border-primary bg-primary/15 text-primary" : "border-primary/20 hover:border-primary/45"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {!loadingSlots && availableSlots.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum horário disponível para esta data.</p> : null}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Seus dados</h2>
              <p className="text-sm text-muted-foreground">Usados para identificar sua reserva e contato de confirmação.</p>
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-3.5 text-base"
              />
              <input
                type="tel"
                placeholder="Telefone (com DDD)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-3.5 text-base"
              />
              <input
                type="email"
                placeholder="E-mail (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-3.5 text-base"
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={websiteField}
                onChange={(e) => setWebsiteField(e.target.value)}
                className="hidden"
              />
              <div className="rounded-lg border border-primary/20 p-4 bg-secondary/30">
                <p className="mb-2 text-sm text-muted-foreground">Validação de segurança: quanto é {captchaA} + {captchaB}?</p>
                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-3.5 text-base"
                  placeholder="Digite o resultado"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-6 md:py-10">
              <CheckCircle2 className="h-14 w-14 mx-auto text-primary mb-4" strokeWidth={1.5} />
              <h2 className="font-display text-2xl md:text-3xl mb-3">Reserva registrada</h2>
              <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                Seu horário foi salvo na nossa agenda. Abri também uma conversa no WhatsApp para você alinhar detalhes e
                confirmação com a equipe.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="btn-outline-gold text-sm py-3 px-5 inline-flex items-center justify-center gap-2"
              disabled={saving}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>

            {step < 5 && (
              <button
                onClick={() => setStep((old) => old + 1)}
                className="btn-gold text-sm py-3 px-6 inline-flex items-center justify-center gap-2"
                disabled={!canAdvance()}
              >
                Avançar <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {step === 5 && (
              <button
                onClick={submitAppointment}
                className="btn-gold text-sm py-3 px-6 inline-flex items-center justify-center gap-2"
                disabled={!canAdvance() || saving}
              >
                {saving ? "Enviando..." : "Confirmar reserva"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
