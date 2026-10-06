// Cotizador rápido: preguntas cortas que arman un mensaje de WhatsApp ya escrito.
// Todo se edita en /admin/configuracion (sección "Cotizador") y vive en site_settings,
// así que no necesita migración: si una clave no existe todavía, se usa el valor de aquí.
// Arranca APAGADO (quote_enabled = '0') para que Sofía lo ajuste antes de mostrarlo.
import { linesToOptions } from './utils';

export const QUOTE_DEFAULTS: Record<string, string> = {
  quote_enabled: '0',
  quote_title: 'Cotiza tu importación en 1 minuto',
  quote_subtitle: 'Responde tres preguntas y te llega la conversación por WhatsApp lista para enviar. Sin compromiso.',
  quote_q1_label: '¿Qué quieres importar?',
  quote_q1_options: 'Ropa y calzado\nTecnología y accesorios\nHogar y decoración\nMateriales de construcción\nMaquinaria o repuestos\nJuguetes y variedades',
  quote_q2_label: '¿Qué volumen manejas?',
  quote_q2_options: 'Es mi primera importación\nUnas pocas cajas\nVarios metros cúbicos\nContenedor completo',
  quote_q3_label: '¿Qué necesitas de nosotros?',
  quote_q3_options: 'Que me asesoren de principio a fin\nSolo el transporte y la bodega\nAprender a importar por mi cuenta\nTodavía no lo sé',
  quote_ask_name: '1',
  quote_button_text: 'Enviar por WhatsApp',
  quote_message_intro: 'Hola Sofía, quiero cotizar una importación.',
};

export const QUOTE_KEYS = Object.keys(QUOTE_DEFAULTS);

export type QuoteQuestion = { label: string; options: string[] };

export type QuoteConfig = {
  enabled: boolean;
  title: string;
  subtitle: string;
  questions: QuoteQuestion[];
  askName: boolean;
  buttonText: string;
  messageIntro: string;
};

export function getQuoteConfig(settings: Record<string, string>): QuoteConfig {
  const get = (key: string) => settings[key] ?? QUOTE_DEFAULTS[key];
  const questions = [1, 2, 3]
    .map((n) => ({ label: get(`quote_q${n}_label`).trim(), options: linesToOptions(get(`quote_q${n}_options`)) }))
    .filter((q) => q.label && q.options.length > 0); // una pregunta sin título u opciones simplemente no sale
  return {
    enabled: get('quote_enabled') === '1' && questions.length > 0,
    title: get('quote_title'),
    subtitle: get('quote_subtitle'),
    questions,
    askName: get('quote_ask_name') === '1',
    buttonText: get('quote_button_text') || 'Enviar por WhatsApp',
    messageIntro: get('quote_message_intro'),
  };
}
