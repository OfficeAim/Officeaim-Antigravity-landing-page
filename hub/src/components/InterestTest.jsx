import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const questionsData = [
    {
        "question": "¿En qué momento exacto de un proyecto sientes que pierdes el control y qué lo desencadena?",
        "options": [
            { "text": "Cuando mi ecosistema falla en la gestión básica de tareas y la construcción de la comunidad.", "tier": "Essential" },
            { "text": "Cuando mi planificación estratégica y estrategia de contenido no logran posicionarme como un experto de élite.", "tier": "Pro" },
            { "text": "Cuando mi arquitectura de sistemas y estrategias de lanzamiento carecen de mecanismos de control estrictos.", "tier": "Plus" },
            { "text": "Cuando mis esfuerzos iniciales de SEO no me brindan la seguridad de ingresos predecibles.", "tier": "Essential" }
        ],
        "module_recommendation": "Pain Point Analyzer: Diagnóstico de Fricción del Ecosistema"
    },
    {
        "question": "¿Qué parte de tu semana te hace enojar más porque no es tu trabajo principal, pero tienes que hacerlo de todos modos?",
        "options": [
            { "text": "Perder tiempo en la gestión básica de tareas en lugar de construir mi comunidad.", "tier": "Essential" },
            { "text": "Luchar con la estrategia de contenido en lugar de realizar análisis de inteligencia.", "tier": "Pro" },
            { "text": "Lidiar con una arquitectura de sistemas fragmentada que frena la optimización de ingresos.", "tier": "Plus" },
            { "text": "Responder preguntas repetitivas sin una estrategia de planificación estratégica para escalar.", "tier": "Pro" }
        ],
        "module_recommendation": "Pain Point Analyzer: Necesidades Subyacentes y Gestión del Tiempo"
    },
    {
        "question": "¿Cuándo fue la última vez que sentiste que 'trabajaste gratis', y por qué no pudiste evitarlo?",
        "options": [
            { "text": "Invertí horas en SEO y construcción de comunidad sin ver resultados medibles por falta de conocimientos.", "tier": "Essential" },
            { "text": "Carecía de la planificación estratégica para definir mi alcance, operando como un tomador de pedidos en lugar de un experto.", "tier": "Pro" },
            { "text": "Una falla en nuestra arquitectura de sistemas y estrategias de lanzamiento causó que perdiéramos horas no facturables.", "tier": "Plus" },
            { "text": "No supe cómo posicionar mi análisis de inteligencia, lo que llevó a revisiones interminables por parte del cliente.", "tier": "Pro" }
        ],
        "module_recommendation": "Pain Point Analyzer: Cadena de Conversión de Queja a Venta"
    },
    {
        "question": "Sabiendo que las personas no compran características sino alivio de la fricción, ¿cuál es el motivo de compra 'Big 4' que más te impulsa a buscar una solución hoy?",
        "options": [
            { "text": "Simplicidad: Quiero menos fricción mental y escapar de las tareas administrativas básicas.", "tier": "Essential" },
            { "text": "Estatus: Quiero ser percibido como un experto de élite a través de una sólida estrategia de contenido y análisis de inteligencia.", "tier": "Pro" },
            { "text": "Control: Quiero dominar el alcance de mis proyectos y mi arquitectura de sistemas para la optimización de ingresos.", "tier": "Plus" },
            { "text": "Seguridad: Quiero ingresos predecibles construyendo una base comunitaria y una estrategia de SEO estable.", "tier": "Essential" }
        ],
        "module_recommendation": "Pain Point Analyzer: Los 4 Grandes Motivos de Compra B2B"
    },
    {
        "question": "Al considerar implementar una nueva solución, ¿cuál es la objeción principal que surge en tu proceso de toma de decisiones interno?",
        "options": [
            { "text": "El riesgo de adopción: '¿Realmente lo usaré para mi gestión básica de tareas, o es demasiado complejo para empezar?'.", "tier": "Essential" },
            { "text": "Alineación del valor: '¿Se integrará con mi planificación estratégica y me dará un mejor análisis de inteligencia?'.", "tier": "Pro" },
            { "text": "Aversión al riesgo: '¿Nuestros datos están seguros y la arquitectura de sistemas soportará nuestros lanzamientos y optimización de ingresos?'.", "tier": "Plus" },
            { "text": "El costo: '¿Es demasiado caro dado mi enfoque actual en aprender SEO gratuito y construir comunidad?'.", "tier": "Essential" }
        ],
        "module_recommendation": "Buyer Persona Architect: Anticipación de Objeciones Comunes"
    },
    {
        "question": "¿Qué evento desencadenante específico provocó que comenzaras a buscar una solución para tus cuellos de botella hoy?",
        "options": [
            { "text": "Me siento abrumado por la gestión básica de tareas y necesito ayuda urgente para arrancar con mi comunidad.", "tier": "Essential" },
            { "text": "Mi crecimiento profesional se ha estancado y necesito elevar mi estatus con análisis de inteligencia y estrategia de contenido.", "tier": "Pro" },
            { "text": "Mi equipo está sobrecargado y los ejecutivos exigen ganancias de eficiencia masivas en la arquitectura de sistemas.", "tier": "Plus" },
            { "text": "Me di cuenta de que mi falta de planificación estratégica está dañando mi retención de clientes.", "tier": "Pro" }
        ],
        "module_recommendation": "Buyer Persona Architect: El Proceso de Toma de Decisiones (Trigger)"
    },
    {
        "question": "Si analizas la necesidad subyacente detrás de tus quejas comerciales, ¿qué estás tratando de proteger realmente?",
        "options": [
            { "text": "Protección de mi seguridad: Necesito dominar el SEO básico y la gestión de tareas para dejar de sentirme perdido.", "tier": "Essential" },
            { "text": "Protección de mi estatus: Necesito proteger mi percepción profesional dominando la estrategia de contenido y el análisis de inteligencia.", "tier": "Pro" },
            { "text": "Protección de mi control: Necesito proteger mi tiempo y energía optimizando los ingresos a través de una mejor arquitectura de sistemas.", "tier": "Plus" },
            { "text": "Protección de mi simplicidad: Necesito reducir la sobrecarga mental al integrar mi planificación estratégica.", "tier": "Pro" }
        ],
        "module_recommendation": "Pain Point Analyzer: Problema Superficial vs. Necesidad Subyacente"
    }
];

const InterestTest = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = [useState(0)[0], useState(0)[1]];
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(null);

    const handleSelect = (option) => {
        setAnswers({ ...answers, [currentStep]: option });

        // Auto-advance after 400ms delay for smooth Typeform feel
        setTimeout(() => {
            if (currentStep < questionsData.length - 1) {
                setCurrentStep(curr => curr + 1);
            } else {
                calculateResults({ ...answers, [currentStep]: option });
            }
        }, 400);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const calculateResults = (finalAnswers) => {
        const counts = { Essential: 0, Pro: 0, Plus: 0 };
        const recommendations = [];

        Object.values(finalAnswers).forEach(answer => {
            counts[answer.tier]++;
            // Find the recommendation associated with this question
            const qIndex = questionsData.findIndex(q => q.options.some(o => o.text === answer.text));
            if (qIndex !== -1 && questionsData[qIndex].module_recommendation) {
                if (!recommendations.includes(questionsData[qIndex].module_recommendation)) {
                    recommendations.push(questionsData[qIndex].module_recommendation);
                }
            }
        });

        const predominantTier = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        setResult({
            tier: predominantTier,
            recommendations: recommendations.slice(0, 3) // Top 3 recommendations
        });

        setIsFinished(true);
        if (onComplete) onComplete({ tier: predominantTier, recommendations });
    };

    if (isFinished && result) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto py-12 px-6"
            >
                <div className="glass-card p-10 border-accent-secondary/30 bg-accent-secondary/[0.05] relative overflow-hidden rounded-3xl text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                    <Target className="h-16 w-16 text-accent-secondary mx-auto mb-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-secondary italic block mb-2">Diagnóstico Completado</span>
                    <h2 className="text-3xl lg:text-5xl font-black italic mb-4 text-white">
                        Tu Nivel Recomendado: <br /><span className="text-accent-primary">{result.tier}</span>
                    </h2>

                    <div className="max-w-xl mx-auto mt-10 text-left">
                        <h3 className="text-sm font-black italic text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-accent-primary" /> Ruta de Aprendizaje Sugerida
                        </h3>
                        <div className="space-y-3">
                            {result.recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                    <div className="mt-1 h-6 w-6 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-3 w-3 text-accent-primary" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black italic text-white">{rec.split(':')[0]}</div>
                                        <div className="text-[11px] text-text-muted mt-1 leading-relaxed">{rec.split(':')[1]}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/hub/module/1')}
                        className="mt-10 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent-primary hover:text-white transition-all italic shadow-2xl"
                    >
                        Comenzar Módulos
                    </button>
                </div>
            </motion.div>
        );
    }

    const currentQ = questionsData[currentStep];

    return (
        <div className="w-full max-w-3xl mx-auto py-12 px-6 min-h-[600px] flex flex-col justify-center">
            {/* Progress indicator */}
            <div className="mb-12">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-3">
                    <span>Diagnostic Test</span>
                    <span>{currentStep + 1} / {questionsData.length}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / questionsData.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary"
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] mb-4 block italic">Pregunta {currentStep + 1}</span>
                    <h2 className="text-2xl md:text-3xl font-black italic leading-tight text-white mb-8">
                        {currentQ.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQ.options.map((option, idx) => {
                            const isSelected = answers[currentStep] === option;
                            const indexLetter = String.fromCharCode(65 + idx); // A, B, C, D

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-left p-5 rounded-xl border flex items-center gap-4 transition-all group ${isSelected
                                        ? 'bg-accent-secondary/10 border-accent-secondary text-white scale-[1.02] shadow-lg shadow-accent-secondary/20'
                                        : 'bg-white/[0.02] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/30'
                                        }`}
                                >
                                    <div className={`h-8 w-8 rounded flex items-center justify-center font-black text-xs shrink-0 transition-colors ${isSelected ? 'bg-accent-secondary text-black' : 'bg-white/10 text-text-muted group-hover:bg-white/20'
                                        }`}>
                                        {indexLetter}
                                    </div>
                                    <span className={`text-sm md:text-base font-medium leading-relaxed italic ${isSelected ? 'font-bold' : ''}`}>
                                        {option.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Back button */}
            <div className="mt-12 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic transition-colors ${currentStep === 0 ? 'text-transparent pointer-events-none' : 'text-text-muted hover:text-white'
                        }`}
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                <div className="text-[10px] text-text-muted italic flex items-center gap-2">
                    Oficina de Inteligencia Presidencial <Sparkles className="h-3 w-3 text-accent-primary" />
                </div>
            </div>
        </div>
    );
};

export default InterestTest;
