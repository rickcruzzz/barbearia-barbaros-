# Fase 2 - Evolution API + n8n

LLM em operacao: GPT-5.3 Codex.

## Objetivo
Conectar o painel e o fluxo publico de agendamento a uma automacao WhatsApp sem retrabalho estrutural.

## Eventos de integracao
- Novo agendamento criado (`appointment_created`).
- Agendamento confirmado/reagendado (`appointment_updated` com status/data/horario).
- Agendamento cancelado (`appointment_cancelled`).

## Pipeline sugerido
1. `Supabase` publica eventos em tabela de outbox (`integration_events`).
2. `n8n` consome webhook seguro (HMAC + token rotativo).
3. `Evolution API` envia mensagem com template por status.
4. `n8n` grava retorno do provedor em tabela de log (`whatsapp_delivery_logs`).

## Regras de seguranca
- Nunca usar `service_role` no cliente.
- Todas as credenciais em variaveis de ambiente do servidor.
- Idempotencia por `event_id` para evitar mensagens duplicadas.

## Critérios de pronto da fase 2
- Taxa de entrega monitorada no painel.
- Reenvio seguro para mensagens falhas.
- Historico de conversa e status refletindo no painel em tempo quase real.
