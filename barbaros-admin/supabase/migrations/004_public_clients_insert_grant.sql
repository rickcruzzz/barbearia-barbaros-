-- Libera somente insercao publica de clientes para o fluxo de agendamento online.
-- Nao libera SELECT publico em clients.
grant insert (id, name, phone, email) on public.clients to anon;
