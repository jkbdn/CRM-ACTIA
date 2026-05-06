import { PIPELINE_STAGES } from "./constants.js";

const toDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

export const contactsSeed = [
  {
    name: "Laura Benitez",
    company: "Habitat Norte",
    email: "laura.benitez@habitatnorte.example",
    phone: "+34 600 100 201",
    position: "Directora de expansion",
    contact_type: "promotor",
    source: "referido",
    notes: "Interesada en promociones residenciales de escala media."
  },
  {
    name: "Miguel Arroyo",
    company: "Arroyo Hoteles",
    email: "miguel.arroyo@arroyohoteles.example",
    phone: "+34 600 100 202",
    position: "CEO",
    contact_type: "cliente potencial",
    source: "evento",
    notes: "Quiere renovar dos establecimientos urbanos."
  },
  {
    name: "Clara Vidal",
    company: "Vidal Patrimonio",
    email: "clara.vidal@vidalpatrimonio.example",
    phone: "+34 600 100 203",
    position: "Responsable de activos",
    contact_type: "cliente actual",
    source: "cliente recurrente",
    notes: "Cliente con proyectos de rehabilitacion en curso."
  },
  {
    name: "Javier Soler",
    company: "Soler Inversiones",
    email: "javier.soler@solerinversiones.example",
    phone: "+34 600 100 204",
    position: "Socio",
    contact_type: "cliente recurrente",
    source: "LinkedIn",
    notes: "Busca oportunidades de oficinas flexibles."
  },
  {
    name: "Aina Torres",
    company: "Ayuntamiento de Liria",
    email: "aina.torres@liria.example",
    phone: "+34 600 100 205",
    position: "Tecnica de urbanismo",
    contact_type: "institución",
    source: "contacto institucional",
    notes: "Contacto clave para concursos publicos."
  },
  {
    name: "Pablo Martin",
    company: "Martin Retail Group",
    email: "pablo.martin@martinretail.example",
    phone: "+34 600 100 206",
    position: "Director inmobiliario",
    contact_type: "cliente potencial",
    source: "web",
    notes: "Interes en locales comerciales de alto transito."
  },
  {
    name: "Ines Romero",
    company: "Romero Interiorismo",
    email: "ines.romero@romerointeriorismo.example",
    phone: "+34 600 100 207",
    position: "Fundadora",
    contact_type: "colaborador",
    source: "referido",
    notes: "Colaboradora para proyectos de interiorismo hotelero."
  },
  {
    name: "Diego Paredes",
    company: "Paredes Living",
    email: "diego.paredes@paredesliving.example",
    phone: "+34 600 100 208",
    position: "Promotor",
    contact_type: "promotor",
    source: "concurso",
    notes: "Perfil muy orientado a vivienda colectiva."
  }
];

export const opportunitiesSeed = [
  {
    name: "Residencial Jardin Norte",
    contact_id: 1,
    company: "Habitat Norte",
    project_type: "residencial",
    location: "Valencia",
    estimated_area: 4200,
    client_budget: 6800000,
    expected_fees: 245000,
    estimated_value: 245000,
    probability: 65,
    expected_close_date: toDate(35),
    proposal_deadline: toDate(9),
    internal_owner: "Marta",
    stage: PIPELINE_STAGES[4],
    notes: "Propuesta economica enviada para 48 viviendas."
  },
  {
    name: "Rehabilitacion Casa Vidal",
    contact_id: 3,
    company: "Vidal Patrimonio",
    project_type: "rehabilitación",
    location: "Madrid",
    estimated_area: 1200,
    client_budget: 1900000,
    expected_fees: 98000,
    estimated_value: 98000,
    probability: 80,
    expected_close_date: toDate(18),
    proposal_deadline: toDate(6),
    internal_owner: "Sergio",
    stage: PIPELINE_STAGES[5],
    notes: "Pendiente de ajustar alcance de direccion de obra."
  },
  {
    name: "Hotel Boutique Centro",
    contact_id: 2,
    company: "Arroyo Hoteles",
    project_type: "hotelero",
    location: "Sevilla",
    estimated_area: 3100,
    client_budget: 5200000,
    expected_fees: 210000,
    estimated_value: 210000,
    probability: 45,
    expected_close_date: toDate(52),
    proposal_deadline: toDate(13),
    internal_owner: "Lucia",
    stage: PIPELINE_STAGES[2],
    notes: "Primera reunion realizada. Esperando programa funcional."
  },
  {
    name: "Oficinas Flex Soler",
    contact_id: 4,
    company: "Soler Inversiones",
    project_type: "oficinas",
    location: "Barcelona",
    estimated_area: 2600,
    client_budget: 3600000,
    expected_fees: 165000,
    estimated_value: 165000,
    probability: 55,
    expected_close_date: toDate(42),
    proposal_deadline: toDate(17),
    internal_owner: "Marta",
    stage: PIPELINE_STAGES[3],
    notes: "Necesitan mediciones y estado de instalaciones."
  },
  {
    name: "Concurso Centro Civico Liria",
    contact_id: 5,
    company: "Ayuntamiento de Liria",
    project_type: "concurso",
    location: "Liria",
    estimated_area: 1800,
    client_budget: 2800000,
    expected_fees: 125000,
    estimated_value: 125000,
    probability: 30,
    expected_close_date: toDate(70),
    proposal_deadline: toDate(21),
    internal_owner: "Sergio",
    stage: PIPELINE_STAGES[0],
    notes: "Bases pendientes de publicacion definitiva."
  },
  {
    name: "Retail Gran Via",
    contact_id: 6,
    company: "Martin Retail Group",
    project_type: "terciario",
    location: "Madrid",
    estimated_area: 900,
    client_budget: 1100000,
    expected_fees: 72000,
    estimated_value: 72000,
    probability: 60,
    expected_close_date: toDate(24),
    proposal_deadline: toDate(8),
    internal_owner: "Lucia",
    stage: PIPELINE_STAGES[1],
    notes: "Solicitan propuesta rapida para apertura en Q4."
  },
  {
    name: "Plan Parcial Sector Este",
    contact_id: 8,
    company: "Paredes Living",
    project_type: "urbanismo",
    location: "Castellon",
    estimated_area: 52000,
    client_budget: 9500000,
    expected_fees: 310000,
    estimated_value: 310000,
    probability: 40,
    expected_close_date: toDate(90),
    proposal_deadline: toDate(28),
    internal_owner: "Diego",
    stage: PIPELINE_STAGES[3],
    notes: "Trabajo de planeamiento con horizonte largo."
  },
  {
    name: "Interiorismo Suites Arroyo",
    contact_id: 7,
    company: "Arroyo Hoteles",
    project_type: "interiorismo",
    location: "Malaga",
    estimated_area: 650,
    client_budget: 850000,
    expected_fees: 64000,
    estimated_value: 64000,
    probability: 50,
    expected_close_date: toDate(31),
    proposal_deadline: toDate(10),
    internal_owner: "Lucia",
    stage: PIPELINE_STAGES[4],
    notes: "Colaboracion con Romero Interiorismo."
  },
  {
    name: "Viviendas Paredes Living",
    contact_id: 8,
    company: "Paredes Living",
    project_type: "residencial",
    location: "Alicante",
    estimated_area: 7800,
    client_budget: 12200000,
    expected_fees: 420000,
    estimated_value: 420000,
    probability: 95,
    expected_close_date: toDate(-5),
    proposal_deadline: toDate(-35),
    internal_owner: "Marta",
    stage: PIPELINE_STAGES[6],
    notes: "Encargo aceptado. Pendiente de contrato final."
  },
  {
    name: "Hotel Costa Reforma",
    contact_id: 2,
    company: "Arroyo Hoteles",
    project_type: "hotelero",
    location: "Cadiz",
    estimated_area: 4100,
    client_budget: 6100000,
    expected_fees: 230000,
    estimated_value: 230000,
    probability: 15,
    expected_close_date: toDate(-12),
    proposal_deadline: toDate(-45),
    internal_owner: "Sergio",
    stage: PIPELINE_STAGES[7],
    notes: "Perdida por cambio de estrategia del cliente."
  }
];

export const tasksSeed = [
  {
    title: "Llamar a Laura para resolver dudas de honorarios",
    description: "Revisar alcance de fases y confirmar calendario.",
    contact_id: 1,
    opportunity_id: 1,
    owner: "Marta",
    due_date: toDate(2),
    priority: "alta",
    status: "pendiente"
  },
  {
    title: "Enviar comparativa de opciones de fachada",
    description: "Preparar PDF con tres alternativas sinteticas.",
    contact_id: 3,
    opportunity_id: 2,
    owner: "Sergio",
    due_date: toDate(4),
    priority: "media",
    status: "en curso"
  },
  {
    title: "Solicitar programa funcional hotelero",
    description: "Pedir numero de habitaciones y servicios previstos.",
    contact_id: 2,
    opportunity_id: 3,
    owner: "Lucia",
    due_date: toDate(5),
    priority: "alta",
    status: "pendiente"
  },
  {
    title: "Revisar mediciones de oficinas",
    description: "Contrastar planos recibidos con superficie util.",
    contact_id: 4,
    opportunity_id: 4,
    owner: "Marta",
    due_date: toDate(7),
    priority: "media",
    status: "pendiente"
  },
  {
    title: "Comprobar publicacion de bases del concurso",
    description: "Verificar plataforma municipal y descargar anexos.",
    contact_id: 5,
    opportunity_id: 5,
    owner: "Sergio",
    due_date: toDate(9),
    priority: "media",
    status: "pendiente"
  },
  {
    title: "Preparar propuesta express retail",
    description: "Definir honorarios y fases minimas.",
    contact_id: 6,
    opportunity_id: 6,
    owner: "Lucia",
    due_date: toDate(3),
    priority: "alta",
    status: "en curso"
  },
  {
    title: "Agendar visita al sector este",
    description: "Coordinar disponibilidad con Paredes Living.",
    contact_id: 8,
    opportunity_id: 7,
    owner: "Diego",
    due_date: toDate(12),
    priority: "baja",
    status: "pendiente"
  },
  {
    title: "Reunion de coordinacion interiorismo",
    description: "Alinear entregables con Romero Interiorismo.",
    contact_id: 7,
    opportunity_id: 8,
    owner: "Lucia",
    due_date: toDate(6),
    priority: "media",
    status: "pendiente"
  },
  {
    title: "Actualizar contrato viviendas Paredes",
    description: "Incluir hitos de pago y calendario de proyecto.",
    contact_id: 8,
    opportunity_id: 9,
    owner: "Marta",
    due_date: toDate(1),
    priority: "alta",
    status: "en curso"
  },
  {
    title: "Archivar propuesta Hotel Costa",
    description: "Dejar notas de aprendizaje comercial.",
    contact_id: 2,
    opportunity_id: 10,
    owner: "Sergio",
    due_date: toDate(-2),
    priority: "baja",
    status: "completada"
  },
  {
    title: "Actualizar datos de contacto institucional",
    description: "Confirmar telefono directo y cargo actual.",
    contact_id: 5,
    opportunity_id: null,
    owner: "Sergio",
    due_date: toDate(14),
    priority: "baja",
    status: "pendiente"
  },
  {
    title: "Enviar email de seguimiento a Javier",
    description: "Preguntar por documentos tecnicos pendientes.",
    contact_id: 4,
    opportunity_id: 4,
    owner: "Marta",
    due_date: toDate(2),
    priority: "media",
    status: "pendiente"
  }
];
