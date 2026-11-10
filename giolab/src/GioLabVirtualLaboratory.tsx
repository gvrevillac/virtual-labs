import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ArrowLeft, Play, Square, RotateCcw, 
  Activity, Zap, Box, FlaskConical, Waves, ChevronRight, Target, Info
} from 'lucide-react';

// --- TYPES ---
type EngineType = 'kinematics' | 'circuit' | 'particle' | 'reaction' | 'wave';
type Subject = 'Physics' | 'Chemistry';

interface VariableConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

interface Lab {
  id: number;
  title: string;
  subject: Subject;
  lesson: string;
  competency: string;
  standard: string;
  engineType: EngineType;
  engineConfig: {
    variables: VariableConfig[];
    chartTitles: { x: string; y: string };
  };
}

// --- DATABASE GENERATOR ---
const buildLab = (
  id: number, title: string, subject: Subject, lesson: string, 
  competency: string, standard: string, engineType: EngineType, 
  variables: VariableConfig[], chartTitles: {x: string, y: string}
): Lab => ({
  id, title, subject, lesson, competency, standard, engineType, engineConfig: { variables, chartTitles }
});

const defaultKinematicsVars = [
  { id: 'v', label: 'Velocity', min: 0, max: 100, step: 1, defaultValue: 50, unit: 'm/s' },
  { id: 'angle', label: 'Angle', min: 0, max: 90, step: 1, defaultValue: 45, unit: 'deg' },
  { id: 'g', label: 'Gravity', min: 1, max: 20, step: 0.1, defaultValue: 9.8, unit: 'm/s²' }
];

const defaultCircuitVars = [
  { id: 'v', label: 'Voltage', min: 1, max: 24, step: 1, defaultValue: 12, unit: 'V' },
  { id: 'r', label: 'Resistance', min: 1, max: 100, step: 1, defaultValue: 10, unit: 'Ω' }
];

const defaultParticleVars = [
  { id: 't', label: 'Temperature', min: 100, max: 1000, step: 10, defaultValue: 300, unit: 'K' },
  { id: 'v', label: 'Volume', min: 1, max: 50, step: 1, defaultValue: 25, unit: 'L' }
];

const defaultReactionVars = [
  { id: 'vol', label: 'Titrant Volume', min: 0, max: 50, step: 1, defaultValue: 0, unit: 'mL' },
  { id: 'conc', label: 'Concentration', min: 0.1, max: 2.0, step: 0.1, defaultValue: 1.0, unit: 'M' }
];

const defaultWaveVars = [
  { id: 'freq', label: 'Frequency', min: 1, max: 20, step: 1, defaultValue: 5, unit: 'Hz' },
  { id: 'amp', label: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 50, unit: 'px' }
];

const physicsTitles = [
  "1D Kinematics", "2D Projectile Motion", "Vector Addition", "Free Fall", "Terminal Velocity", "Newton's First Law", "Newton's Second Law", "Friction and Incline Planes", "Hooke's Law", "Spring Harmonic Motion",
  "Conservation of Energy", "Work-Energy Theorem", "Elastic Collisions", "Inelastic Collisions", "Center of Mass", "Torque & Equilibrium", "Rotational Inertia", "Angular Momentum", "Universal Gravitation", "Orbital Mechanics",
  "Kepler's Laws", "Escape Velocity", "Fluid Pressure", "Buoyancy (Archimedes)", "Bernoulli's Principle", "Viscosity & Drag", "Surface Tension", "Specific Heat", "Latent Heat", "Thermal Expansion",
  "Ideal Gas Law Simulation", "Kinetic Theory of Gases", "First Law of Thermodynamics", "Carnot Cycle & Heat Engines", "Entropy & Second Law", "Transverse Waves", "Longitudinal Waves", "Standing Waves on a String", "Sound Resonance in Pipes", "Beat Frequencies",
  "Doppler Effect (Sound)", "Doppler Effect (Light)", "Reflection & Refraction", "Snell's Law", "Total Internal Reflection", "Concave Mirrors", "Convex Mirrors", "Converging Lenses", "Diverging Lenses", "Young's Double Slit",
  "Diffraction Gratings", "Thin Film Interference", "Polarization of Light", "Coulomb's Law", "Electric Field Lines", "Gauss's Law", "Electric Potential", "Equipotential Surfaces", "Capacitors in Series & Parallel", "Dielectrics",
  "Ohm's Law & Resistance", "Resistivity & Temperature", "Kirchhoff's Laws", "RC Circuits", "Magnetic Fields (Bar Magnets)", "Magnetic Field of a Wire", "Lorentz Force", "Mass Spectrometer", "Faraday's Law of Induction", "Lenz's Law",
  "RL Circuits", "AC Circuits (RLC)", "Transformers", "Electromagnetic Waves", "Blackbody Radiation", "Photoelectric Effect", "Compton Scattering", "De Broglie Wavelength", "Bohr Model of Hydrogen", "Atomic Spectra",
  "Quantum Tunneling", "Wavefunction Probability", "Heisenberg Uncertainty Principle", "Rutherford Scattering", "Radioactive Decay Series", "Half-Life Simulation", "Nuclear Fission", "Nuclear Fusion", "Particle Accelerators", "Special Relativity: Time Dilation",
  "Length Contraction", "Relativistic Momentum", "Mass-Energy Equivalence", "Cosmic Ray Muons", "Dark Matter Gravitational Lensing", "Hubble's Law & Expanding Universe", "Stellar Evolution (H-R Diagram)", "Exoplanet Transit Photometry", "Pulsars & Neutron Stars", "Black Hole Event Horizons"
];

const chemistryTitles = [
  "Acid-Base Titration", "Gas Laws (Boyle/Charles)", "Build an Atom", "Isotopes & Atomic Mass", "Bohr Model & Energy", "Periodic Trends (Radius)", "Periodic Trends (Electronegativity)", "Periodic Trends (Ionization Energy)", "Electron Configuration", "Quantum Numbers",
  "Molecule Shapes (VSEPR)", "Molecule Polarity", "Ionic Bonding", "Covalent Bonding", "Metallic Bonding", "Lattice Energy", "Intermolecular Forces", "Hydrogen Bonding", "Phase Changes", "Heating/Cooling Curves",
  "Vapor Pressure", "Boiling Point Elevation", "Freezing Point Depression", "Osmotic Pressure", "Ideal Gas Law (PV=nRT)", "Graham's Law of Effusion", "Dalton's Law of Partial Pressures", "Real Gases (Van der Waals)", "Balancing Equations", "Stoichiometry Basics",
  "Limiting Reactants", "Percent Yield", "Empirical Formulas", "Molecular Formulas", "Combustion Analysis", "Molarity & Concentration", "Dilutions", "Solubility Rules", "Net Ionic Equations", "Precipitation Reactions",
  "Oxidation States", "Redox Reactions", "Galvanic Cells", "Electrolysis & Electroplating", "Nernst Equation", "Faraday's Laws of Electrolysis", "Heat of Reaction (Calorimetry)", "Hess's Law", "Standard Enthalpies of Formation", "Bond Energies",
  "Entropy Changes", "Gibbs Free Energy", "Reaction Rates (Kinetics)", "Rate Laws & Order", "Integrated Rate Laws", "Collision Theory", "Activation Energy & Catalysis", "Arrhenius Equation", "Reaction Mechanisms", "Reversible Reactions",
  "Chemical Equilibrium", "Le Chatelier (Concentration)", "Le Chatelier (Temperature)", "Le Chatelier (Pressure)", "Equilibrium Constants (Kc/Kp)", "Solubility Product (Ksp)", "Common Ion Effect", "Autoionization of Water", "pH & pOH Scale", "Strong vs. Weak Acids",
  "Ka and Kb Constants", "Polyprotic Acids", "Buffer Solutions", "Henderson-Hasselbalch Equation", "Titration Curves (Strong)", "Titration Curves (Weak)", "Acid-Base Indicators", "Coordination Complexes", "Crystal Field Theory", "Spectrophotometry (Beer's Law)",
  "Flame Tests & Emission Spectra", "Alpha Decay", "Beta Decay", "Gamma Emission", "Radiocarbon Dating", "Alkanes & Isomerism", "Alkenes & Alkynes", "Functional Groups", "Esterification", "Polymerization Reactions",
  "Chromatography (TLC)", "Distillation Simulation", "Extraction Techniques", "Titration with Permanganate", "Iodometric Titration", "Conductometric Titration", "Potentiometric Titration", "Gravimetric Analysis", "Colorimetry & Kinetics", "Mass Spectrometry (Isotopes)"
];

const generateCurriculumData = (): Lab[] => {
  const labs: Lab[] = [];
  
  const getEngineDetails = (title: string, subject: Subject): { type: EngineType, vars: VariableConfig[], chart: {x: string, y: string} } => {
    const t = title.toLowerCase();
    if (subject === 'Physics') {
      if (/(circuit|ohm|kirchhoff|capacitor|dielectric|resistivity|faraday|lenz|transformer|rc|rlc|ac)/.test(t)) {
        return { type: 'circuit', vars: defaultCircuitVars, chart: { x: "Time (s)", y: "Current (A)" } };
      }
      if (/(wave|doppler|optics|lens|mirror|snell|refraction|reflection|diffraction|interference|polarization|sound|harmonic|pendulum|hooke|frequency|spectra|radiation|photoelectric)/.test(t)) {
        return { type: 'wave', vars: defaultWaveVars, chart: { x: "Position/Time", y: "Amplitude/Intensity" } };
      }
      if (/(gas|thermo|heat|entropy|buoyancy|pressure|fluid|decay|radiation|fission|fusion|scattering|viscosity)/.test(t)) {
        return { type: 'particle', vars: defaultParticleVars, chart: { x: "Temperature/Volume", y: "Pressure/Force" } };
      }
      return { type: 'kinematics', vars: defaultKinematicsVars, chart: { x: "Time/Distance", y: "Velocity/Height" } };
    } else {
      if (/(titration|reaction|equation|limiting|yield|molarity|concentration|dilution|equilibrium|buffer|acid|base|ph|precipitation|decay|esterification)/.test(t)) {
        return { type: 'reaction', vars: defaultReactionVars, chart: { x: "Volume/Time", y: "pH/Concentration" } };
      }
      if (/(galvanic|electrolysis|nernst|electroplating|conductometric)/.test(t)) {
        return { type: 'circuit', vars: defaultCircuitVars, chart: { x: "Time (s)", y: "Voltage/Current" } };
      }
      if (/(spectra|spectrophotometry|colorimetry|flame|emission|quantum|orbital)/.test(t)) {
        return { type: 'wave', vars: defaultWaveVars, chart: { x: "Wavelength (nm)", y: "Absorbance/Intensity" } };
      }
      return { type: 'particle', vars: defaultParticleVars, chart: { x: "Property (X)", y: "Property (Y)" } };
    }
  };

  physicsTitles.forEach((title, index) => {
    const { type, vars, chart } = getEngineDetails(title, 'Physics');
    labs.push(buildLab(
      index + 1, title, 'Physics', 
      `Physics Unit ${Math.floor(index/10) + 1}: ${title.split(' ')[0]}`, 
      `Investigate the core principles and relationships governing ${title.toLowerCase()}.`, 
      `Design an experiment applying ${title} concepts to real-world scenarios.`, 
      type, vars, chart
    ));
  });

  chemistryTitles.forEach((title, index) => {
    const { type, vars, chart } = getEngineDetails(title, 'Chemistry');
    labs.push(buildLab(
      101 + index, title, 'Chemistry', 
      `Chemistry Unit ${Math.floor(index/10) + 1}: ${title.split(' ')[0]}`, 
      `Analyze the chemical properties and mathematical relationships related to ${title.toLowerCase()}.`, 
      `Develop a laboratory protocol utilizing ${title} principles.`, 
      type, vars, chart
    ));
  });

  return labs;
};

const curriculumData: Lab[] = generateCurriculumData();

// --- CUSTOM SVG CHART (Native React Alternative to Recharts) ---
const NativeLineChart = ({ data, xAxisLabel, yAxisLabel, color = "#3b82f6" }: { data: any[], xAxisLabel: string, yAxisLabel: string, color?: string }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Waiting for simulation data...</div>;
  }

  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  const rangeX = (maxX - minX) || 1;
  const rangeY = (maxY - minY) || 1;

  const points = data.map(d => {
    const x = ((d.x - minX) / rangeX) * 100;
    const y = 100 - ((d.y - minY) / rangeY) * 100;
    return `${x},${y}`;
  }).join(' ');

  const currentValX = data[data.length - 1].x;
  const currentValY = data[data.length - 1].y;

  return (
    <div className="relative w-full h-full flex flex-col pl-8 pb-8">
      {/* Y Axis Label */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-slate-500 origin-center whitespace-nowrap">
        {yAxisLabel}
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 relative border-l-2 border-b-2 border-slate-200">
        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Dynamic Tooltip/Readout */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur shadow-sm border border-slate-100 rounded p-2 text-xs text-slate-600 font-mono">
          <div>X: {Number(currentValX).toFixed(1)}</div>
          <div>Y: {Number(currentValY).toFixed(1)}</div>
        </div>
      </div>
      
      {/* X Axis Label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 pt-2">
        {xAxisLabel}
      </div>
    </div>
  );
};


// --- ENGINES ---
const KinematicsEngine = ({ variables, setChartData, isPlaying }: any) => {
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    let animationFrameId: number;
    let lastChartUpdate = 0;
    if (isPlaying) {
      const startTime = Date.now() - time * 1000;
      const animate = () => {
        const currentTime = (Date.now() - startTime) / 1000;
        setTime(currentTime);
        
        const v = variables.v || 50;
        const angle = (variables.angle || 45) * (Math.PI / 180);
        const g = variables.g || 9.8;
        
        const x = v * Math.cos(angle) * currentTime;
        const y = (v * Math.sin(angle) * currentTime) - (0.5 * g * currentTime * currentTime);
        
        if (y < 0) return;

        if (currentTime - lastChartUpdate >= 0.1) {
          setChartData((prev: any) => [...prev, { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }].slice(-100));
          lastChartUpdate = currentTime;
        }
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, variables]);

  useEffect(() => {
    if (!isPlaying && time === 0) setChartData([]);
  }, [isPlaying, time]);

  const v = variables.v || 50;
  const angle = (variables.angle || 45) * (Math.PI / 180);
  const g = variables.g || 9.8;
  const x = v * Math.cos(angle) * time;
  const y = Math.max(0, (v * Math.sin(angle) * time) - (0.5 * g * time * time));

  return (
    <div className="relative w-full h-full bg-blue-50/50 rounded-2xl overflow-hidden border border-blue-100 shadow-inner">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-slate-200 border-t border-slate-300"></div>
      
      <motion.div 
        className="absolute bottom-8 left-8 w-6 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
        animate={{ x, y: -y }}
        transition={{ type: 'tween', duration: 0 }}
      />
      <div className="absolute top-4 left-4 text-slate-700 font-mono text-sm bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
        <div>Time: {time.toFixed(2)} s</div>
        <div>Dist: {x.toFixed(2)} m</div>
        <div>Height: {y.toFixed(2)} m</div>
      </div>
    </div>
  );
};

const CircuitEngine = ({ variables, setChartData, isPlaying }: any) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTime(t => t + 1);
        const v = variables.v || 12;
        const r = variables.r || 10;
        const i = v / r;
        setChartData((prev: any) => [...prev, { x: time, y: Number(i.toFixed(2)) }].slice(-20));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, variables, time]);

  const v = variables.v || 12;
  const r = variables.r || 10;
  const i = v / r;
  const p = v * i;
  const glow = Math.min(1, i / 2.5);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 shadow-inner">
      <svg width="400" height="200" viewBox="0 0 400 200" className="text-slate-700">
        <path d="M 50 150 L 50 50 L 350 50 L 350 150 L 250 150" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M 150 150 L 50 150" stroke="currentColor" strokeWidth="4" fill="none" />
        
        {/* Battery */}
        <rect x="150" y="130" width="10" height="40" fill="currentColor" />
        <rect x="170" y="110" width="10" height="80" fill="currentColor" />
        <rect x="190" y="130" width="10" height="40" fill="currentColor" />
        <rect x="210" y="110" width="10" height="80" fill="currentColor" />
        <text x="180" y="210" fill="#334155" textAnchor="middle" className="text-sm font-semibold">{v}V Source</text>
        
        {/* Resistor / Bulb */}
        <circle cx="350" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M 335 100 L 365 100" stroke="currentColor" strokeWidth="2" />
        <circle 
          cx="350" cy="100" r="20" 
          fill={`rgba(250, 204, 21, ${glow})`} 
          style={{ transition: 'fill 0.3s ease' }}
          className={isPlaying && glow > 0.1 ? 'animate-pulse' : ''}
        />
        <text x="350" y="145" fill="#334155" textAnchor="middle" className="text-sm font-semibold">{r}Ω</text>
      </svg>
      
      <div className="absolute top-4 left-4 text-slate-700 font-mono text-sm bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
        <div>Voltage: {v.toFixed(1)} V</div>
        <div>Resistance: {r.toFixed(1)} Ω</div>
        <div className="text-amber-600 font-bold mt-1">Current: {i.toFixed(2)} A</div>
        <div className="text-orange-600 font-bold">Power: {p.toFixed(2)} W</div>
      </div>
    </div>
  );
};

const ParticleThermoEngine = ({ variables, setChartData, isPlaying }: any) => {
  const temp = variables.t || 300;
  const vol = variables.v || 25;
  const pressure = (temp / vol).toFixed(2); 
  
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setChartData((prev: any) => [...prev, { x: vol, y: Number(pressure) }].slice(-20));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, vol, pressure]);

  const speedMultiplier = temp / 300;
  const boxWidth = `${Math.max(20, vol * 2)}%`;

  return (
    <div className="relative w-full h-full bg-orange-50/30 rounded-2xl flex items-center justify-center border border-orange-100 shadow-inner overflow-hidden">
      <div 
        className="relative bg-white border-4 border-slate-300 rounded-xl shadow-sm"
        style={{ width: boxWidth, height: '60%', transition: 'width 0.5s ease' }}
      >
        {isPlaying && particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute w-3 h-3 bg-orange-500 rounded-full shadow-sm"
            initial={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{
              left: [`${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`],
              top: [`${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`]
            }}
            transition={{
              duration: 2 / speedMultiplier,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      <div className="absolute top-4 left-4 text-slate-700 font-mono text-sm bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm z-10">
        <div>Temperature: {temp} K</div>
        <div>Volume: {vol} L</div>
        <div className="text-orange-600 font-bold mt-1">Pressure: {pressure} atm</div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-orange-500 font-semibold bg-white/80 px-3 py-1 rounded-full shadow-sm border border-orange-100">
        <Zap className="w-4 h-4" /> Heat Source
      </div>
    </div>
  );
};

const ChemistryReactionEngine = ({ variables, setChartData, isPlaying }: any) => {
  const vol = variables.vol || 0;
  const conc = variables.conc || 1.0;
  
  const initialAcid = 25; 
  const acidConc = 0.5; 
  const molesAcid = initialAcid * acidConc;
  const molesBase = vol * conc;
  
  let ph = 1;
  if (molesBase < molesAcid) ph = 1 + (molesBase / molesAcid) * 2;
  else if (molesBase === molesAcid) ph = 7;
  else ph = 12 + (molesBase - molesAcid) / 10;
  
  useEffect(() => {
    if (isPlaying) {
      setChartData((prev: any) => {
        if (prev.length > 0 && prev[prev.length - 1].x === vol) return prev;
        return [...prev, { x: vol, y: Number(ph.toFixed(2)) }].slice(-50);
      });
    }
  }, [isPlaying, vol, ph]);

  const liquidColor = ph >= 7 ? `rgba(236, 72, 153, ${Math.min(1, (ph-6)/3)})` : 'rgba(203, 213, 225, 0.3)';

  return (
    <div className="relative w-full h-full bg-teal-50/50 rounded-2xl flex flex-col items-center justify-end pb-12 border border-teal-100 shadow-inner">
      {/* Burette */}
      <div className="absolute top-10 w-8 h-48 border-x-2 border-b-2 border-slate-400 rounded-b-md flex items-end justify-center overflow-hidden bg-white/50">
        <div 
          className="w-full bg-teal-200 transition-all duration-300"
          style={{ height: `${100 - (vol / 50) * 100}%` }}
        />
        <div className="absolute bottom-[-10px] w-2 h-4 bg-slate-400"></div>
      </div>
      
      {/* Drops */}
      {isPlaying && vol > 0 && vol < 50 && (
        <motion.div 
          className="absolute top-60 w-2 h-2 bg-teal-300 rounded-full"
          animate={{ y: [0, 80], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}

      {/* Flask */}
      <div className="relative w-32 h-40 drop-shadow-sm">
        <svg viewBox="0 0 100 120" className="w-full h-full absolute z-10">
          <path d="M40 0 L60 0 L60 40 L90 110 A 10 10 0 0 1 80 120 L20 120 A 10 10 0 0 1 10 110 L40 40 Z" 
                fill="none" stroke="#64748b" strokeWidth="3"/>
        </svg>
        <div className="absolute bottom-0 left-[10%] w-[80%] h-1/2 overflow-hidden" style={{ clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0% 100%)' }}>
          <div 
            className="w-full h-full transition-colors duration-500"
            style={{ backgroundColor: liquidColor }}
          />
        </div>
      </div>
      
      <div className="absolute top-4 left-4 text-slate-700 font-mono text-sm bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
        <div>Titrant: {vol} mL</div>
        <div>Concentration: {conc} M</div>
        <div className="text-teal-700 font-bold mt-2">pH: {ph.toFixed(2)}</div>
      </div>
    </div>
  );
};

const WaveOpticsEngine = ({ variables, setChartData, isPlaying }: any) => {
  const [time, setTime] = useState(0);
  const freq = variables.freq || 5;
  const amp = variables.amp || 50;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTime(t => t + 0.1);
        const y = Math.sin(time * freq * 0.5) * amp;
        setChartData((prev: any) => [...prev, { x: Number(time.toFixed(1)), y: Number(y.toFixed(2)) }].slice(-50));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, time, freq, amp]);

  const generateWavePath = () => {
    let path = 'M 0 100 ';
    for (let i = 0; i <= 400; i += 5) {
      const y = 100 + Math.sin((i / 400) * Math.PI * 2 * freq + (isPlaying ? time * -2 : 0)) * amp;
      path += `L ${i} ${y} `;
    }
    return path;
  };

  return (
    <div className="relative w-full h-full bg-blue-50/50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner overflow-hidden">
      <svg width="400" height="200" className="w-full h-full">
        <line x1="0" y1="100" x2="100%" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
        <path d={generateWavePath()} stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      
      <div className="absolute top-4 left-4 text-slate-700 font-mono text-sm bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200 shadow-sm">
        <div>Freq: {freq} Hz</div>
        <div>Amp: {amp} px</div>
      </div>
    </div>
  );
};


// --- NEW UI COMPONENTS ---

const SimulationThumbnail = ({ subject, engineType }: { subject: Subject, engineType: EngineType }) => {
  let Icon = Activity;
  if (engineType === 'kinematics') Icon = Target;
  else if (engineType === 'circuit') Icon = Zap;
  else if (engineType === 'particle') Icon = Box;
  else if (engineType === 'reaction') Icon = FlaskConical;
  else if (engineType === 'wave') Icon = Waves;

  const bgGradient = subject === 'Physics'
    ? 'from-blue-600 to-indigo-700'
    : 'from-emerald-600 to-teal-700';

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${bgGradient}`}>
      <Icon className="w-24 h-24 text-white/20" strokeWidth={1.5} />
    </div>
  );
};

const LabDiscussion = ({ lab, onStart, onBack }: { lab: Lab, onStart: () => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-20 flex gap-4 items-center shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0 leading-tight">{lab.title}</h1>
          <div className="text-sm text-gray-500 font-medium">{lab.subject} &bull; {lab.lesson}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Info className="w-6 h-6" />
            <h2 className="text-2xl font-bold m-0">Theory and Discussion</h2>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Welcome to the <strong>{lab.title}</strong> laboratory module. Before diving into the simulation, let's review the fundamental principles that govern this experiment.
            </p>
            
            <h4 className="text-lg font-semibold mt-6 mb-2">Learning Competency</h4>
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r text-gray-700">
              {lab.competency}
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-2">Performance Standard</h4>
            <div className="bg-gray-50 border-l-4 border-teal-500 p-4 mb-6 rounded-r text-gray-700">
              {lab.standard}
            </div>

            <h4 className="text-lg font-semibold mt-6 mb-2">Background Information</h4>
            <p className="text-gray-700 mb-4 leading-relaxed">
              In this virtual experiment, you will utilize a {lab.engineType} simulation engine to manipulate variables and observe their direct effects on the system. 
              {lab.subject === 'Physics' 
                ? " Pay close attention to how the physical parameters interact, noting the relationships between forces, energy, and motion as described by classical mechanics and thermodynamics."
                : " Observe the chemical changes and reaction dynamics closely. Monitor the equilibrium states, concentration shifts, and molecular interactions as you adjust the environmental conditions."}
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Use the provided control panel to adjust variables such as {lab.engineConfig.variables.map(v => v.label.toLowerCase()).join(', ')}. Observe the real-time graph to analyze the relationship between {lab.engineConfig.chartTitles.x} and {lab.engineConfig.chartTitles.y}. Ensure you take detailed notes in the analysis section during your run.
            </p>
          </div>

          <hr className="my-8 border-gray-200" />
          
          <div className="flex justify-end">
            <button 
              onClick={onStart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded flex items-center gap-2 transition-colors shadow-sm"
            >
              Start Virtual Experiment <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};


// --- WORKSPACE COMPONENT ---
const LabWorkspace = ({ lab, onBack }: { lab: Lab, onBack: () => void }) => {
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const initialVars: Record<string, number> = {};
    lab.engineConfig.variables.forEach(v => initialVars[v.id] = v.defaultValue);
    setVariables(initialVars);
    setChartData([]);
    setIsPlaying(false);
  }, [lab]);

  const EngineComponent = useMemo(() => {
    switch(lab.engineType) {
      case 'kinematics': return KinematicsEngine;
      case 'circuit': return CircuitEngine;
      case 'particle': return ParticleThermoEngine;
      case 'reaction': return ChemistryReactionEngine;
      case 'wave': return WaveOpticsEngine;
      default: return KinematicsEngine;
    }
  }, [lab.engineType]);

  const isPhysics = lab.subject === 'Physics';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-20 flex gap-4 items-center shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          title="Back to Discussion"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPhysics ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>
              {lab.subject}
            </span>
            <h1 className="text-lg font-bold text-gray-900 m-0">{lab.title}</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Canvas & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Canvas Wrapper */}
          <div className="h-[400px] md:h-[500px] w-full bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <EngineComponent 
              variables={variables} 
              setChartData={setChartData} 
              isPlaying={isPlaying} 
            />
          </div>

          {/* Control Panel */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 m-0">
                <Activity className={`w-5 h-5 ${isPhysics ? 'text-blue-600' : 'text-teal-600'}`} /> Control Variables
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
                    isPlaying 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Stop' : 'Start'}
                </button>
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setChartData([]);
                    const resetVars: Record<string, number> = {};
                    lab.engineConfig.variables.forEach(v => resetVars[v.id] = v.defaultValue);
                    setVariables(resetVars);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors border border-gray-200"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lab.engineConfig.variables.map(v => (
                <div key={v.id} className="p-4 rounded border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">{v.label}</label>
                    <span className={`text-sm font-bold ${isPhysics ? 'text-blue-600' : 'text-teal-600'}`}>
                      {variables[v.id]} {v.unit}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min={v.min}
                    max={v.max}
                    step={v.step}
                    value={variables[v.id] || v.min}
                    onChange={(e) => setVariables(prev => ({ ...prev, [v.id]: parseFloat(e.target.value) }))}
                    className="w-full h-2 rounded bg-gray-200 appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{v.min}</span>
                    <span>{v.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Data & Analysis */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-[380px] shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Real-time Data</h2>
            <div className="flex-1 w-full min-h-0 bg-gray-50 rounded p-2 border border-gray-200">
              <NativeLineChart 
                data={chartData} 
                xAxisLabel={lab.engineConfig.chartTitles.x} 
                yAxisLabel={lab.engineConfig.chartTitles.y} 
                color={isPhysics ? "#2563eb" : "#0d9488"} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 flex-1 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Lab Notes</h2>
            <textarea 
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded p-3 text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Record your observations here..."
            ></textarea>
          </div>
        </div>

      </main>
    </div>
  );
};


// --- DASHBOARD COMPONENT ---
const Dashboard = ({ onSelectLab }: { onSelectLab: (id: number) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<Subject | 'All'>('All');

  const filteredLabs = useMemo(() => {
    return curriculumData.filter(lab => {
      const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lab.lesson.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || lab.subject === filter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans selection:bg-blue-200">
      
      <header className="max-w-7xl mx-auto mb-12 text-center pt-8">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-6 shadow-sm border border-gray-200">
          <FlaskConical className="w-8 h-8 text-teal-600 mr-3" />
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-4 leading-tight">
          GiOLab: Curriculum-Aligned Virtual Laboratory for Physics and Chemistry
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4 mt-4">
          Interactive modules designed to enhance secondary education through guided discovery and real-time simulation.
        </p>
      </header>

      <div className="max-w-7xl mx-auto sticky top-4 z-30 mb-8">
        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {['All', 'Physics', 'Chemistry'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as Subject | 'All')}
                className={`px-4 py-2 rounded font-semibold text-sm transition-all border ${
                  filter === f 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLabs.map((lab, index) => (
            <motion.div 
              key={lab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) }}
              onClick={() => onSelectLab(lab.id)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md flex flex-col h-full"
            >
              {/* Bootstrap/Gradient Thumbnail */}
              <div className="h-40 relative overflow-hidden bg-gray-100 border-b border-gray-200">
                <SimulationThumbnail subject={lab.subject} engineType={lab.engineType} />
                
                {/* Subject Badge */}
                <div className="absolute top-3 left-3">
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                    lab.subject === 'Physics' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {lab.subject === 'Physics' ? <Zap className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                    {lab.subject}
                  </div>
                </div>
                
                {/* ID Badge */}
                <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm">
                  #{String(lab.id).padStart(3, '0')}
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {lab.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                  {lab.competency}
                </p>
                <div className={`mt-auto flex items-center justify-between text-sm font-semibold transition-colors ${lab.subject === 'Physics' ? 'text-blue-600' : 'text-teal-600'}`}>
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredLabs.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-white rounded-lg border border-gray-200 mt-6">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mb-1">No experiments found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}
      </main>

    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'discussion' | 'lab'>('dashboard');
  const [activeLabId, setActiveLabId] = useState<number | null>(null);

  const handleSelectLab = (id: number) => {
    setActiveLabId(id);
    setCurrentView('discussion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLab = () => {
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveLabId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDiscussion = () => {
    setCurrentView('discussion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLab = curriculumData.find(l => l.id === activeLabId);

  return (
    <>
      {currentView === 'dashboard' && <Dashboard onSelectLab={handleSelectLab} />}
      {currentView === 'discussion' && activeLab && <LabDiscussion lab={activeLab} onStart={handleStartLab} onBack={handleBackToDashboard} />}
      {currentView === 'lab' && activeLab && <LabWorkspace lab={activeLab} onBack={handleBackToDiscussion} />}
    </>
  );
}