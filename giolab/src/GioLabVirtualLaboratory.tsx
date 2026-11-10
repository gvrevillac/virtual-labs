import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, ArrowLeft, Play, Square, RotateCcw, 
  Activity, Zap, Box, FlaskConical, Waves, ChevronRight, ChevronLeft,
  Target, Globe, Microscope, BookOpen, Calculator, Download, Printer, Layers
} from 'lucide-react';

// --- TYPES ---
export type EngineType = 'kinematics' | 'circuit' | 'particle' | 'reaction' | 'wave' | 'biology';

export type SubMode = 
  // Kinematics (5)
  | 'projectile' | 'incline' | 'orbit' | 'pendulum' | 'collision'
  // Circuit & Machines (5)
  | 'dc' | 'rc' | 'ac' | 'magnetism' | 'lever'
  // Particle, Thermo & Earth (5)
  | 'gas' | 'phase' | 'atomic' | 'tectonics' | 'weather'
  // Chemistry Reaction (4)
  | 'titration' | 'kinetics' | 'electrochem' | 'equilibrium'
  // Wave & Optics (4)
  | 'wave' | 'optics' | 'interference' | 'spectra'
  // Biology & Life Science (4)
  | 'microscope' | 'genetics' | 'physiology' | 'ecology';

export type Subject = 'Physics' | 'Chemistry' | 'General Science';

export interface VariableConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

export interface Lab {
  id: number;
  title: string;
  subject: Subject;
  lesson: string;
  competency: string;
  standard: string;
  formula: string;
  engineType: EngineType;
  subMode: SubMode;
  engineConfig: {
    variables: VariableConfig[];
    chartTitles: { x: string; y: string };
  };
}

export interface EngineProps {
  lab: Lab;
  variables: Record<string, number>;
  setVariables: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setChartData: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  resetSignal: number;
}

// ============================================================================
// COMPLETE 300-LAB CURRICULUM TITLES (100 PHYSICS, 100 CHEMISTRY, 100 GEN SCI)
// ============================================================================
const physicsTitles: string[] = [
  // Unit 1: Kinematics & Vectors (1-10)
  "1D Uniformly Accelerated Motion", "2D Projectile Motion", "Vector Addition & Resolution", "Free Fall & Gravitational Acceleration", "Terminal Velocity & Air Drag",
  "Relative Velocity in 2D", "Uniform Circular Motion", "Centripetal Force & Banked Curves", "Projectile Range vs. Launch Angle", "Kinematics Graphs (x-t, v-t, a-t)",
  // Unit 2: Newton's Laws & Dynamics (11-20)
  "Newton's First Law & Inertia", "Newton's Second Law (F = ma)", "Newton's Third Law Action-Reaction Pairs", "Static & Kinetic Friction on Inclines", "Atwood Machine Pulley Dynamics",
  "Tension in Multi-Cable Equilibrium", "Elevator Apparent Weight", "Drag Force in Viscous Fluids", "Hooke's Law & Spring Elasticity", "Simple Harmonic Motion (Mass-Spring)",
  // Unit 3: Work, Energy & Momentum (21-30)
  "Work-Kinetic Energy Theorem", "Conservation of Mechanical Energy", "Gravitational vs. Elastic Potential Energy", "Power & Mechanical Efficiency", "Impulse & Momentum Change",
  "1D Elastic Collisions", "1D Perfectly Inelastic Collisions", "2D Glancing Collisions", "Ballistic Pendulum Momentum", "Center of Mass & Barycenter",
  // Unit 4: Rotational Motion & Gravitation (31-40)
  "Torque & Rotational Equilibrium", "Moment of Inertia of Rigid Bodies", "Rotational Kinematics & Angular Acceleration", "Rolling Without Slipping on an Incline", "Conservation of Angular Momentum",
  "Simple Pendulum Period & Gravity", "Physical & Torsion Pendulums", "Damped & Driven Harmonic Oscillators", "Newton's Law of Universal Gravitation", "Kepler's Laws & Planetary Orbits",
  // Unit 5: Gravity, Fluids & Solids (41-50)
  "Escape Velocity & Orbital Energy", "Geostationary Satellite Mechanics", "Hydrostatic Pressure & Depth", "Pascal's Principle & Hydraulic Lift", "Archimedes' Principle & Buoyancy",
  "Continuity Equation in Pipe Flow", "Bernoulli's Principle & Venturi Tube", "Torricelli's Law Fluid Efflux", "Poiseuille's Law & Laminar Viscosity", "Surface Tension & Capillary Action",
  // Unit 6: Thermodynamics & Statistical Physics (51-60)
  "Linear & Volumetric Thermal Expansion", "Specific Heat Capacity Calorimetry", "Latent Heat of Fusion & Vaporization", "Thermal Conductivity & Heat Transfer", "Ideal Gas Law (PV = nRT) Piston",
  "Maxwell-Boltzmann Molecular Speeds", "Isobaric, Isochoric & Isothermal Processes", "Adiabatic Compression & Expansion", "Carnot Heat Engine & Efficiency", "Entropy & the Second Law of Thermodynamics",
  // Unit 7: Waves, Acoustics & Geometric Optics (61-70)
  "Transverse Wave Propagation", "Longitudinal & Acoustic Compression Waves", "Superposition & Wave Interference", "Standing Waves on a Vibrating String", "Acoustic Resonance in Open & Closed Pipes",
  "Beat Frequency & Wave Modulation", "Doppler Effect for Moving Sound Sources", "Sound Intensity & Decibel Scale", "Law of Reflection & Plane Mirrors", "Snell's Law & Index of Refraction",
  // Unit 8: Optics, Wave Nature of Light & Electrostatics (71-80)
  "Total Internal Reflection & Fiber Optics", "Ray Tracing: Concave & Convex Mirrors", "Thin Lens Equation: Converging Lenses", "Diverging Lenses & Optical Aberrations", "Young's Double-Slit Interference",
  "Single-Slit Diffraction & Resolving Power", "Diffraction Gratings & Spectroscopy", "Thin-Film Optical Interference", "Malus's Law & Light Polarization", "Coulomb's Law of Electrostatic Force",
  // Unit 9: Electricity, Circuits & Electromagnetism (81-90)
  "Electric Field Lines & Dipoles", "Electric Potential & Equipotential Contours", "Parallel-Plate Capacitor & Dielectrics", "Capacitors in Series and Parallel", "Ohm's Law & Ohmic Resistance",
  "Resistivity & Temperature Coefficient", "Kirchhoff's Loop & Junction Rules", "RC Circuit Charging & Time Constant", "Magnetic Field of a Current-Carrying Wire", "Lorentz Force on Moving Charges",
  // Unit 10: Induction, AC Circuits & Modern Physics (91-100)
  "Mass Spectrometer Ion Trajectory", "Faraday's Law of Electromagnetic Induction", "Lenz's Law & Eddy Currents", "RLC Series AC Circuit & Impedance", "Resonance in AC RLC Circuits",
  "Step-Up & Step-Down Transformers", "Blackbody Radiation & Wien's Displacement", "Photoelectric Effect & Work Function", "Bohr Atomic Model & Hydrogen Transitions", "Radioactive Half-Life & Relativistic Time Dilation"
];

const chemistryTitles: string[] = [
  // Unit 1: Atomic Structure & Periodic Trends (101-110)
  "Build an Atom: Subatomic Particles", "Isotopic Abundance & Average Atomic Mass", "Rutherford Gold Foil Alpha Scattering", "Bohr Model & Line Emission Spectra", "Quantum Numbers & Atomic Orbitals",
  "Aufbau Principle & Electron Configuration", "Periodic Trends: Atomic & Ionic Radius", "Periodic Trends: First Ionization Energy", "Periodic Trends: Electronegativity", "Effective Nuclear Charge (Z_eff) Shielding",
  // Unit 2: Chemical Bonding & Intermolecular Forces (111-120)
  "Ionic Bonding & Born-Haber Lattice Energy", "Covalent Bonding & Potential Energy Well", "Metallic Bonding & Electron Sea Conductivity", "Lewis Structures & Formal Charge", "VSEPR Theory: 3D Molecular Geometry",
  "Bond Dipoles & Molecular Polarity", "Valence Bond Theory & Hybridization", "Molecular Orbital Theory Diagrams", "Intermolecular Forces & Boiling Points", "Hydrogen Bonding in Water & Biomolecules",
  // Unit 3: States of Matter & Gas Laws (121-130)
  "Kinetic Molecular Theory of Gases", "Boyle's Law: Pressure-Volume Relationship", "Charles's Law: Temperature-Volume Scaling", "Gay-Lussac's Pressure-Temperature Law", "Avogadro's Law & Molar Volume",
  "Combined Gas Law & Ideal Gas Equation", "Dalton's Law of Partial Pressures", "Graham's Law of Gas Effusion & Diffusion", "Real Gases & Van der Waals Deviations", "Heating & Cooling Curves across Phase Changes",
  // Unit 4: Phase Equilibria & Stoichiometry (131-140)
  "Phase Diagrams (P-T) & Triple Point", "Vapor Pressure & Clausius-Clapeyron Equation", "Unit Cell Crystal Lattices (BCC, FCC)", "Law of Conservation of Mass & Balancing", "Mole Concept & Avogadro's Number",
  "Empirical & Molecular Formula Determination", "Combustion Analysis of Hydrocarbons", "Stoichiometric Mole-to-Mass Conversions", "Limiting Reactant & Excess Reagent", "Theoretical, Actual & Percent Yield",
  // Unit 5: Solutions, Colligative Properties & Reactions (141-150)
  "Atom Economy in Green Synthesis", "Molarity & Solution Preparation", "Serial Dilutions (M₁V₁ = M₂V₂)", "Electrolytes vs. Nonelectrolytes Conductivity", "Enthalpy of Solution & Hydration",
  "Temperature Effects on Solid & Gas Solubility", "Henry's Law of Dissolved Gases", "Raoult's Law & Vapor Pressure Lowering", "Boiling Point Elevation & Freezing Depression", "Osmotic Pressure Across Semipermeable Membranes",
  // Unit 6: Chemical Kinetics & Equilibrium (151-160)
  "Precipitation Reactions & Net Ionic Equations", "Acid-Base Neutralization Stoichiometry", "Oxidation Numbers & Redox Balancing", "Single-Replacement Activity Series", "Gravimetric Analysis of Precipitates",
  "Beer-Lambert Law Spectrophotometry", "Reaction Rates & Instantaneous Tangents", "Method of Initial Rates & Rate Orders", "Integrated Rate Laws (Zero, First, Second)", "Reaction Half-Life Kinetics",
  // Unit 7: Catalysis, Equilibrium & Acids/Bases (161-170)
  "Collision Theory & Orientation Factor", "Arrhenius Equation & Activation Energy", "Reaction Coordinate Profiles & Intermediates", "Homogeneous & Heterogeneous Catalysis", "Enzyme Michaelis-Menten Kinetics",
  "Reversible Reactions & Dynamic Equilibrium", "Equilibrium Constant (K_c and K_p)", "Reaction Quotient (Q) vs. Equilibrium (K)", "Le Chatelier's Principle: Concentration Stress", "Le Chatelier's Principle: Pressure & Volume",
  // Unit 8: Acid-Base Equilibria, Titrations & Buffers (171-180)
  "Le Chatelier's Principle: Temperature Shift", "Solubility Product (K_sp) & Precipitation", "Common Ion Effect on Solubility", "Autoionization of Water (K_w) & pH Scale", "Strong vs. Weak Acid Ionization (K_a)",
  "Weak Base Equilibria (K_b) & Hydrolysis", "Polyprotic Acid Stepwise Dissociation", "Buffer Capacity & Acid-Base Resistance", "Henderson-Hasselbalch Buffer Design", "Strong Acid - Strong Base Titration Curve",
  // Unit 9: Thermochemistry & Electrochemistry (181-190)
  "Weak Acid - Strong Base Titration Curve", "Acid-Base Indicator pK_in Selection", "Coffee-Cup Calorimetry & Heat Capacity", "Bomb Calorimetry & Heat of Combustion", "Hess's Law of Summation of Enthalpies",
  "Standard Enthalpies of Formation (ΔH°_f)", "Bond Dissociation Energy Calculations", "Gibbs Free Energy (ΔG = ΔH - TΔS)", "Free Energy & Equilibrium (ΔG° = -RT ln K)", "Galvanic (Voltaic) Cells & Standard Potentials",
  // Unit 10: Advanced Electrochem, Nuclear & Organic (191-200)
  "Nernst Equation & Non-Standard Cell EMF", "Electrolytic Cells & Faraday's Electroplating", "Corrosion Chemistry & Cathodic Protection", "Nuclear Alpha, Beta & Positron Decay", "Nuclear Binding Energy & Mass Defect",
  "Alkane Conformations & Constitutional Isomers", "Alkene Cis-Trans Stereoisomerism", "Organic Functional Group Infrared Spectra", "Fischer Esterification Equilibrium", "Thin-Layer Chromatography (R_f) & Distillation"
];

const generalScienceTitles: string[] = [
  // Unit 1: Earth's Interior, Tectonics & Geology (201-210)
  "Earth's Interior Layers & Seismic Velocity", "Continental Drift & Seafloor Spreading", "Convergent, Divergent & Transform Plate Boundaries", "Subduction Zones & Volcanic Arcs", "Fault Mechanics & Elastic Rebound",
  "Seismograph P-Wave & S-Wave Triangulation", "Magma Silica Viscosity & Eruption Style", "Mineral Identification & Mohs Hardness", "Igneous Cooling Rates & Crystal Size", "Sedimentary Compaction & Stratigraphy",
  // Unit 2: Surface Processes, Hydrology & Meteorology (211-220)
  "Metamorphic Heat & Pressure Foliation", "Complete Rock Cycle Transitions", "Mechanical & Chemical Weathering Rates", "Soil Horizon Profile & Permeability", "Stream Gradient, Discharge & Erosion",
  "Groundwater Aquifers & Water Table Drawdown", "Glacial Mass Balance & Albedo Feedback", "Global Hydrologic (Water) Cycle", "Atmospheric Layers & Pressure-Altitude Curve", "Solar Insolation & Angle of Incidence",
  // Unit 3: Climate, Oceanography & Astronomy (221-230)
  "Greenhouse Effect & Radiative Forcing", "Coriolis Effect & Planetary Wind Belts", "Relative Humidity & Dew Point Condensation", "Warm & Cold Weather Front Dynamics", "Low-Pressure Cyclone & Hurricane Heat Engine",
  "Thermohaline Ocean Circulation", "El Niño Southern Oscillation (ENSO)", "Urban Heat Island & Air Quality Index", "Keplerian Solar System Planetary Orbits", "Lunar Phases & Synodic Illumination",
  // Unit 4: Astrophysics, Cell Biology & Transport (231-240)
  "Solar & Lunar Eclipse Umbra Geometry", "Earth's Axial Tilt & Seasonal Day Length", "Spring & Neap Gravitational Ocean Tides", "Hertzsprung-Russell Stellar Evolution", "Exoplanet Transit Light Curve Photometry",
  "Hubble's Law & Cosmic Redshift", "Compound Microscope Magnification & Depth", "Prokaryotic vs. Eukaryotic Organelles", "Cell Surface Area-to-Volume Diffusion Limit", "Passive Diffusion Across Concentration Gradients",
  // Unit 5: Cellular Energetics, Division & Genetics (241-250)
  "Osmosis & Tonicity in Plant/Animal Cells", "Active Membrane Transport & Ion Pumps", "Enzyme Activity vs. pH and Temperature", "Photosynthesis Light Intensity & CO₂ Curve", "Cellular Respiration & ATP Yield",
  "Anaerobic Fermentation Rate in Yeast", "Mitotic Cell Cycle & Chromosome Division", "Meiosis Crossing Over & Gamete Diversity", "DNA Double-Helix Base-Pair Replication", "Transcription & mRNA Genetic Code Translation",
  // Unit 6: Heredity, Evolution & Ecology (251-260)
  "Monohybrid Mendelian Punnett Crosses", "Dihybrid Crosses & Independent Assortment", "Incomplete Dominance & Codominance", "Sex-Linked Pedigree Inheritance", "Gel Electrophoresis DNA Fragment Sizing",
  "Natural Selection & Peppered Moth Camouflage", "Genetic Drift & Bottleneck Founder Effect", "Hardy-Weinberg Allele Equilibrium", "Allopatric Speciation & Adaptive Radiation", "Radiometric Fossil Carbon-14 Dating",
  // Unit 7: Ecosystems, Biogeochemical Cycles & Botany (261-270)
  "Trophic Pyramid & 10% Energy Transfer", "Food Web Stability & Keystone Species", "Exponential vs. Logistic Population Growth", "Lotka-Volterra Predator-Prey Oscillations", "Competitive Exclusion & Niche Partitioning",
  "Global Carbon Cycle Reservoirs & Fluxes", "Nitrogen Fixation & Nitrification Cycle", "Eutrophication & Dissolved Oxygen Depletion", "Biological Magnification of Toxins", "Terrestrial Biomes: Temperature & Rainfall",
  // Unit 8: Human Anatomy & Physiology (271-280)
  "Primary & Secondary Ecological Succession", "Biodiversity Shannon Index & Island Size", "Leaf Stomata Transpiration & Wind/Humidity", "Xylem Capillary Transport & Phloem Flow", "Phototropism & Auxin Plant Hormones",
  "Flower Pollination & Seed Germination", "Skeletal Joint Lever Biomechanics", "Sarcomere Sliding-Filament Muscle Contraction", "Digestive Peristalsis & Nutrient Absorption", "Alveolar Gas Exchange & Vital Capacity",
  // Unit 9: Homeostasis, Microbiology & Environment (281-290)
  "Cardiac Output, Heart Rate & Blood Pressure", "Blood Typing (ABO/Rh) Agglutination", "Nephron Glomerular Filtration & Osmoregulation", "Neuron Action Potential & Synaptic Transmission", "Reflex Arc Latency & Sensory Threshold",
  "Human Eye Accommodation & Corrective Lenses", "Insulin-Glucagon Blood Glucose Homeostasis", "Innate & Adaptive Immune Antibody Response", "Bacterial Binary Fission & Antibiotic Zones", "Viral SIR Epidemic Spread & Herd Immunity",
  // Unit 10: Applied Science, Simple Machines & Sustainability (291-300)
  "Multi-Stage Water Filtration & Turbidity", "Acid Rain Buffering in Soil & Lakes", "Solar Photovoltaic Tilt & Irradiance Efficiency", "Wind Turbine Swept Area & Betz Limit", "Hydroelectric Dam Head Height & Power",
  "Thermal Insulation R-Value Heat Loss", "First, Second & Third Class Lever Torque", "Block & Tackle Pulley Mechanical Advantage", "Gear Ratio Speed vs. Torque Transmission", "Rocket Tsiolkovsky Mass-Ratio Trajectory"
];

// ============================================================================
// CONTEXT-AWARE ENGINE, SUB-MODE & FORMULA MAPPER FOR ALL 300 LABS
// ============================================================================
const getEngineDetails = (title: string): {
  type: EngineType;
  subMode: SubMode;
  vars: VariableConfig[];
  chart: { x: string; y: string };
  formula: string;
} => {
  const t = title.toLowerCase();

  // --- BIOLOGY & LIFE SCIENCE MODES ---
  if (/(punnett|mendelian|dihybrid|dominance|sex-linked|hardy-weinberg|natural selection|genetic drift|speciation|dna|transcription|electrophoresis)/.test(t)) {
    return {
      type: 'biology',
      subMode: 'genetics',
      vars: [
        { id: 'pFreq', label: 'Dominant Allele (p)', min: 0.05, max: 0.95, step: 0.05, defaultValue: 0.6, unit: '' },
        { id: 'selection', label: 'Selection Advantage', min: 0, max: 0.5, step: 0.05, defaultValue: 0.15, unit: 's' },
        { id: 'popSize', label: 'Sample Population', min: 50, max: 1000, step: 50, defaultValue: 400, unit: 'ind' }
      ],
      chart: { x: 'Generations (g)', y: 'Allele Frequency (p)' },
      formula: 'p² + 2pq + q² = 1  |  p + q = 1'
    };
  }
  if (/(cardiac|heart|blood|alveolar|respiratory|digestive|nephron|neuron|action potential|reflex|insulin|glucose|immune|muscle|sarcomere|photosynthesis|respiration|fermentation|transpiration|xylem|phototropism)/.test(t)) {
    return {
      type: 'biology',
      subMode: 'physiology',
      vars: [
        { id: 'stimulus', label: /photosynthesis|transpiration|phototropism/.test(t) ? 'Light / Irradiance' : 'Activity / Stimulus', min: 10, max: 100, step: 5, defaultValue: 60, unit: '%' },
        { id: 'substrate', label: /cardiac|alveolar/.test(t) ? 'Vascular Resistance' : 'O₂ / Substrate Level', min: 10, max: 100, step: 5, defaultValue: 50, unit: '%' },
        { id: 'temp', label: 'System Temperature', min: 15, max: 45, step: 1, defaultValue: 37, unit: '°C' }
      ],
      chart: { x: 'Time (s)', y: 'Physiological Signal / Rate' },
      formula: 'CO = HR × SV  |  V = V_max[S] / (K_m + [S])'
    };
  }
  if (/(trophic|food web|predator-prey|lotka|exclusion|carbon cycle|nitrogen|eutrophication|magnification|biome|succession|biodiversity|epidemic|sir )/.test(t)) {
    return {
      type: 'biology',
      subMode: 'ecology',
      vars: [
        { id: 'preyGrowth', label: 'Primary / Prey Rate (α)', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.45, unit: 'yr⁻¹' },
        { id: 'predation', label: 'Predation / Transfer (β)', min: 0.05, max: 0.5, step: 0.05, defaultValue: 0.2, unit: '' },
        { id: 'carrying', label: 'Ecosystem Capacity (K)', min: 50, max: 300, step: 10, defaultValue: 160, unit: 'kJ' }
      ],
      chart: { x: 'Time (Cycles)', y: 'Biomass / Population' },
      formula: 'dN/dt = αN - βNP  |  E_n = 0.1 · E_(n-1)'
    };
  }
  if (/(microscope|organelle|surface area|diffusion|osmosis|tonicity|active membrane|mitotic|meiosis|pollination|bacterial|binary fission|population growth)/.test(t)) {
    return {
      type: 'biology',
      subMode: 'microscope',
      vars: [
        { id: 'nutrients', label: 'Nutrient / Solute Conc', min: 10, max: 100, step: 5, defaultValue: 65, unit: 'mM' },
        { id: 'temp', label: 'Incubation Temp', min: 10, max: 50, step: 1, defaultValue: 35, unit: '°C' },
        { id: 'inhibitor', label: 'Osmotic / Stress Factor', min: 0, max: 60, step: 5, defaultValue: 10, unit: '%' }
      ],
      chart: { x: 'Incubation Time (hrs)', y: 'Cell Count / Flux' },
      formula: 'dN/dt = r · N · (1 - N / K)  |  J = -D(dC/dx)'
    };
  }

  // --- CIRCUIT, ELECTROMAGNETISM & SIMPLE MACHINES MODES ---
  if (/(lever|pulley|gear|torque & rotational|skeletal joint|hydraulic|wheel)/.test(t)) {
    return {
      type: 'circuit',
      subMode: 'lever',
      vars: [
        { id: 'effortDist', label: 'Effort Arm (d_e)', min: 1, max: 10, step: 0.5, defaultValue: 6, unit: 'm' },
        { id: 'loadDist', label: 'Load Arm (d_L)', min: 1, max: 10, step: 0.5, defaultValue: 3, unit: 'm' },
        { id: 'loadMass', label: 'Load Mass (m_L)', min: 5, max: 100, step: 5, defaultValue: 40, unit: 'kg' }
      ],
      chart: { x: 'Effort Arm d_e (m)', y: 'Required Effort Force (N)' },
      formula: 'τ = F · d  |  IMA = d_effort / d_load'
    };
  }
  if (/(magnetic|lorentz|mass spectrometer|faraday's law of electromagnetic|lenz|transformer|generator)/.test(t)) {
    return {
      type: 'circuit',
      subMode: 'magnetism',
      vars: [
        { id: 'bField', label: 'Magnetic Field (B)', min: 0.2, max: 5.0, step: 0.2, defaultValue: 2.0, unit: 'T' },
        { id: 'turns', label: 'Coil Turns (N)', min: 10, max: 200, step: 10, defaultValue: 80, unit: 'turns' },
        { id: 'speed', label: 'Magnet Velocity (v)', min: 1, max: 15, step: 0.5, defaultValue: 6, unit: 'm/s' }
      ],
      chart: { x: 'Time (s)', y: 'Induced EMF (V)' },
      formula: 'ε = -N · (dΦ_B / dt)  |  F_B = qvB·sin(θ)'
    };
  }
  if (/(capacitor|dielectric|rc circuit)/.test(t)) {
    return {
      type: 'circuit',
      subMode: 'rc',
      vars: [
        { id: 'v', label: 'Source Voltage (V₀)', min: 2, max: 24, step: 1, defaultValue: 12, unit: 'V' },
        { id: 'r', label: 'Resistance (R)', min: 5, max: 100, step: 5, defaultValue: 20, unit: 'kΩ' },
        { id: 'c', label: 'Capacitance (C)', min: 10, max: 200, step: 10, defaultValue: 50, unit: 'μF' }
      ],
      chart: { x: 'Time (s)', y: 'Capacitor Voltage V_c(t)' },
      formula: 'V_c(t) = V₀(1 - e^(-t / RC))  |  τ = R · C'
    };
  }
  if (/(rlc|ac circuit|impedance|resonance in ac)/.test(t)) {
    return {
      type: 'circuit',
      subMode: 'ac',
      vars: [
        { id: 'v', label: 'Peak AC Voltage (V_m)', min: 5, max: 120, step: 5, defaultValue: 24, unit: 'V' },
        { id: 'freq', label: 'AC Frequency (f)', min: 10, max: 100, step: 5, defaultValue: 50, unit: 'Hz' },
        { id: 'r', label: 'Circuit Impedance (Z)', min: 5, max: 100, step: 5, defaultValue: 20, unit: 'Ω' }
      ],
      chart: { x: 'Phase Time (ms)', y: 'Instantaneous I(t) (A)' },
      formula: 'Z = √[R² + (X_L - X_C)²]  |  I(t) = I_m·sin(ωt - φ)'
    };
  }
  if (/(ohm|resistivity|kirchhoff|basic circuit|electrolytes vs|solar photovoltaic|wind turbine|hydroelectric|metallic bonding)/.test(t)) {
    return {
      type: 'circuit',
      subMode: 'dc',
      vars: [
        { id: 'v', label: 'Potential / Input (V)', min: 1, max: 24, step: 0.5, defaultValue: 12, unit: 'V' },
        { id: 'r', label: 'Load Resistance (R₁)', min: 2, max: 100, step: 1, defaultValue: 12, unit: 'Ω' },
        { id: 'r2', label: 'Series Resistance (R₂)', min: 0, max: 50, step: 1, defaultValue: 3, unit: 'Ω' }
      ],
      chart: { x: 'Time (s)', y: 'Circuit Current (A)' },
      formula: 'I = V / (R₁ + R₂)  |  P = I² · R'
    };
  }

  // --- WAVE, OPTICS & SPECTRA MODES ---
  if (/(double-slit|single-slit|diffraction|thin-film|superposition|beat frequency)/.test(t)) {
    return {
      type: 'wave',
      subMode: 'interference',
      vars: [
        { id: 'wavelength', label: 'Wavelength (λ)', min: 400, max: 700, step: 10, defaultValue: 540, unit: 'nm' },
        { id: 'slitDist', label: 'Slit Separation (d)', min: 10, max: 100, step: 5, defaultValue: 40, unit: 'μm' },
        { id: 'screenDist', label: 'Screen Distance (L)', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5, unit: 'm' }
      ],
      chart: { x: 'Detector Position y (mm)', y: 'Fringe Intensity I(y)' },
      formula: 'd · sin(θ) = mλ  |  y_m = (mλL) / d'
    };
  }
  if (/(blackbody|photoelectric|spectrophotometry|beer-lambert|infrared|line emission|light spectrum|malus|exoplanet transit|hubble)/.test(t)) {
    return {
      type: 'wave',
      subMode: 'spectra',
      vars: [
        { id: 'wavelength', label: 'Excitation λ', min: 380, max: 740, step: 10, defaultValue: 520, unit: 'nm' },
        { id: 'conc', label: 'Sample Conc / Temp', min: 0.1, max: 2.0, step: 0.1, defaultValue: 0.8, unit: 'M' },
        { id: 'path', label: 'Path / Aperture (b)', min: 0.5, max: 5.0, step: 0.5, defaultValue: 1.0, unit: 'cm' }
      ],
      chart: { x: 'Wavelength λ (nm)', y: 'Absorbance / Spectral Flux' },
      formula: 'A = ε · b · c = -log₁₀(I / I₀)  |  E = hc / λ'
    };
  }
  if (/(reflection|refraction|snell|internal reflection|mirror|lens|human eye)/.test(t)) {
    return {
      type: 'wave',
      subMode: 'optics',
      vars: [
        { id: 'angle', label: 'Incident Angle (θ₁)', min: 5, max: 80, step: 1, defaultValue: 40, unit: '°' },
        { id: 'n2', label: 'Refractive Index (n₂)', min: 1.0, max: 2.4, step: 0.05, defaultValue: 1.5, unit: '' },
        { id: 'wavelength', label: 'Beam Wavelength (λ)', min: 420, max: 680, step: 10, defaultValue: 630, unit: 'nm' }
      ],
      chart: { x: 'Incident Angle θ₁ (°)', y: 'Refracted Angle θ₂ (°)' },
      formula: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)  |  1/f = 1/d_o + 1/d_i'
    };
  }
  if (/(transverse|longitudinal|standing wave|acoustic|doppler|sound|seismic)/.test(t)) {
    return {
      type: 'wave',
      subMode: 'wave',
      vars: [
        { id: 'freq', label: 'Wave Frequency (f)', min: 1, max: 12, step: 0.5, defaultValue: 4, unit: 'Hz' },
        { id: 'amp', label: 'Wave Amplitude (A)', min: 10, max: 75, step: 5, defaultValue: 45, unit: 'mm' },
        { id: 'speed', label: 'Wave Velocity (v)', min: 1, max: 10, step: 0.5, defaultValue: 4, unit: 'm/s' }
      ],
      chart: { x: 'Time (s)', y: 'Wave Displacement y(t)' },
      formula: 'y(x,t) = A · sin(kx - ωt)  |  v = λ · f'
    };
  }

  // --- CHEMISTRY REACTION, TITRATION, EQUILIBRIUM & ELECTROCHEM MODES ---
  if (/(titration|neutralization|autoionization|strong vs\. weak|weak base|polyprotic|buffer|henderson|indicator|acid rain)/.test(t)) {
    return {
      type: 'reaction',
      subMode: 'titration',
      vars: [
        { id: 'vol', label: 'Titrant Added (V_b)', min: 0, max: 50, step: 0.5, defaultValue: 0, unit: 'mL' },
        { id: 'conc', label: 'Titrant Molarity (M_b)', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.5, unit: 'M' },
        { id: 'acidConc', label: 'Analyte Molarity (M_a)', min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.5, unit: 'M' }
      ],
      chart: { x: 'Titrant Volume (mL)', y: 'Solution pH' },
      formula: 'pH = pKₐ + log([A⁻]/[HA])  |  MₐVₐ = M_bV_b'
    };
  }
  if (/(galvanic|nernst|electrolytic|corrosion|redox|oxidation|activity series)/.test(t)) {
    return {
      type: 'reaction',
      subMode: 'electrochem',
      vars: [
        { id: 'e0', label: 'Std Cell Potential (E°)', min: 0.2, max: 2.5, step: 0.05, defaultValue: 1.10, unit: 'V' },
        { id: 'qRatio', label: 'Ion Ratio [Prod]/[React]', min: 0.01, max: 10, step: 0.1, defaultValue: 1.0, unit: '' },
        { id: 'temp', label: 'Cell Temperature', min: 273, max: 373, step: 5, defaultValue: 298, unit: 'K' }
      ],
      chart: { x: 'Reaction Progress (t)', y: 'Cell EMF E_cell (V)' },
      formula: 'E_cell = E°_cell - (RT / nF) · ln(Q)'
    };
  }
  if (/(equilibrium|reversible|chatelier|solubility product|common ion|esterification|gibbs|free energy)/.test(t)) {
    return {
      type: 'reaction',
      subMode: 'equilibrium',
      vars: [
        { id: 'reactant', label: 'Initial Reactant [A]₀', min: 0.2, max: 2.0, step: 0.1, defaultValue: 1.0, unit: 'M' },
        { id: 'keq', label: 'Equilibrium Const (K_c)', min: 0.2, max: 5.0, step: 0.2, defaultValue: 1.8, unit: '' },
        { id: 'temp', label: 'System Temp (T)', min: 250, max: 500, step: 10, defaultValue: 300, unit: 'K' }
      ],
      chart: { x: 'Relaxation Time (s)', y: 'Equilibrium [C]_eq (M)' },
      formula: 'K_c = [C]^c / ([A]^a [B]^b)  |  ΔG° = -RT ln(K)'
    };
  }
  if (/(\brate\b|kinetics|arrhenius|collision theory|catalysis|enzyme|limiting|yield|stoichiometr|balancing|mole|empirical|combustion|molarity|dilution|precipitation|gravimetric|calorimetry|hess|enthalpy|bond dissociation|chromatography|water filtration)/.test(t)) {
    return {
      type: 'reaction',
      subMode: 'kinetics',
      vars: [
        { id: 'conc', label: 'Initial Reactant [A]₀', min: 0.2, max: 2.0, step: 0.1, defaultValue: 1.2, unit: 'M' },
        { id: 'rate', label: 'Rate Constant (k)', min: 0.05, max: 0.8, step: 0.05, defaultValue: 0.25, unit: 's⁻¹' },
        { id: 'temp', label: 'Reaction Temp (T)', min: 273, max: 400, step: 5, defaultValue: 298, unit: 'K' }
      ],
      chart: { x: 'Reaction Time (s)', y: 'Product Concentration [P] (M)' },
      formula: '[A](t) = [A]₀ · e^(-kt)  |  k = A · e^(-Eₐ / RT)'
    };
  }

  // --- PARTICLE, ATOMIC, PHASE & EARTH SCIENCE MODES ---
  if (/(build an atom|isotop|rutherford|bohr|quantum|aufbau|periodic|nuclear|alpha|half-life|radiometric|Lewis|vsepr|polarity|hybridization|molecular orbital|ionic bonding|covalent|alkane|alkene)/.test(t)) {
    return {
      type: 'particle',
      subMode: 'atomic',
      vars: [
        { id: 'protons', label: 'Atomic Number (Z)', min: 1, max: 20, step: 1, defaultValue: 6, unit: 'p⁺' },
        { id: 'neutrons', label: 'Neutron Count (N)', min: 0, max: 24, step: 1, defaultValue: 6, unit: 'n⁰' },
        { id: 'energy', label: 'Excitation Energy', min: 1, max: 6, step: 1, defaultValue: 2, unit: 'n' }
      ],
      chart: { x: 'Shell / Time Step', y: 'Binding / Orbital Energy (eV)' },
      formula: 'E_n = -13.6 · (Z² / n²) eV  |  A = Z + N'
    };
  }
  if (/(earth's interior|continental drift|plate boundary|subduction|fault|magma|mineral|igneous|sedimentary|metamorphic|rock cycle|weathering|soil|stream|groundwater)/.test(t)) {
    return {
      type: 'particle',
      subMode: 'tectonics',
      vars: [
        { id: 'mantleHeat', label: 'Mantle Heat Flux', min: 100, max: 1000, step: 50, defaultValue: 550, unit: 'mW/m²' },
        { id: 'plateSpeed', label: 'Convergence Rate', min: 1, max: 15, step: 0.5, defaultValue: 6, unit: 'cm/yr' },
        { id: 'viscosity', label: 'Crustal / Magma Stress', min: 10, max: 100, step: 5, defaultValue: 50, unit: 'MPa' }
      ],
      chart: { x: 'Geologic Time (Myr)', y: 'Tectonic Strain / Uplift' },
      formula: 'τ_shear = μ · (dv / dy)  |  v_plate = d / t'
    };
  }
  if (/(hydrologic|water cycle|atmospheric|insolation|greenhouse|coriolis|humidity|weather front|cyclone|thermohaline|el niño|urban heat|glacial)/.test(t)) {
    return {
      type: 'particle',
      subMode: 'weather',
      vars: [
        { id: 'solar', label: 'Solar Insolation', min: 200, max: 1000, step: 25, defaultValue: 600, unit: 'W/m²' },
        { id: 'ghg', label: 'Greenhouse / Humidity', min: 10, max: 100, step: 5, defaultValue: 50, unit: '%' },
        { id: 'wind', label: 'Convection / Wind Speed', min: 1, max: 30, step: 1, defaultValue: 12, unit: 'm/s' }
      ],
      chart: { x: 'Elapsed Time (hrs)', y: 'Atmospheric Temp (°C)' },
      formula: 'T_eq = [S₀(1 - α) / 4σ]^(1/4) + ΔT_GHG'
    };
  }
  if (/(phase|heating|latent|specific heat|thermal expansion|thermal conductivity|insulation|crystal lattice|intermolecular|hydrogen bonding|vapor pressure|raoult|boiling point|osmotic)/.test(t)) {
    return {
      type: 'particle',
      subMode: 'phase',
      vars: [
        { id: 't', label: 'System Temperature', min: 150, max: 600, step: 10, defaultValue: 280, unit: 'K' },
        { id: 'heat', label: 'Heat Input (Q)', min: 10, max: 200, step: 10, defaultValue: 80, unit: 'kJ' },
        { id: 'imf', label: 'IMF Strength', min: 1, max: 10, step: 1, defaultValue: 5, unit: 'kJ/mol' }
      ],
      chart: { x: 'Heat Added Q (kJ)', y: 'Temperature (K)' },
      formula: 'Q = m · c · ΔT  |  Q_latent = m · ΔH_vap'
    };
  }
  if (/(gas|boyle|charles|gay-lussac|avogadro|dalton|graham|waals|maxwell|isobaric|adiabatic|carnot|entropy|hydrostatic|pascal|archimedes|buoyancy|continuity|bernoulli|torricelli|poiseuille|surface tension|henry)/.test(t)) {
    return {
      type: 'particle',
      subMode: 'gas',
      vars: [
        { id: 't', label: 'Temperature (T)', min: 100, max: 800, step: 10, defaultValue: 300, unit: 'K' },
        { id: 'v', label: 'Chamber Volume (V)', min: 10, max: 50, step: 1, defaultValue: 25, unit: 'L' },
        { id: 'n', label: 'Gas Moles / Fluid Density', min: 10, max: 60, step: 5, defaultValue: 30, unit: 'mol' }
      ],
      chart: { x: 'State Step / Volume (L)', y: 'Pressure (atm)' },
      formula: 'P · V = n · R · T  |  P₁V₁ / T₁ = P₂V₂ / T₂'
    };
  }

  // --- KINEMATICS, ORBITS, PENDULUM, COLLISION & INCLINE MODES ---
  if (/(orbit|kepler|universal gravitation|escape velocity|satellite|lunar|eclipse|axial tilt|tide|stellar)/.test(t)) {
    return {
      type: 'kinematics',
      subMode: 'orbit',
      vars: [
        { id: 'mass', label: 'Central Mass (M)', min: 50, max: 300, step: 10, defaultValue: 150, unit: 'M☉' },
        { id: 'radius', label: 'Orbital Semi-Axis (a)', min: 45, max: 130, step: 5, defaultValue: 85, unit: 'AU' },
        { id: 'ecc', label: 'Eccentricity (e)', min: 0, max: 0.6, step: 0.05, defaultValue: 0.15, unit: '' }
      ],
      chart: { x: 'Orbital Phase (rad)', y: 'Orbital Velocity (km/s)' },
      formula: 'F_g = G(Mm) / r²  |  v_orb = √[GM(2/r - 1/a)]'
    };
  }
  if (/(pendulum|hooke|harmonic|oscillator)/.test(t)) {
    return {
      type: 'kinematics',
      subMode: 'pendulum',
      vars: [
        { id: 'length', label: 'Length / Stiffness (L/k)', min: 0.5, max: 5.0, step: 0.25, defaultValue: 2.0, unit: 'm' },
        { id: 'angle', label: 'Initial Amplitude (θ₀)', min: 5, max: 60, step: 5, defaultValue: 30, unit: '°' },
        { id: 'damping', label: 'Damping Coeff (b)', min: 0, max: 0.5, step: 0.05, defaultValue: 0.05, unit: 'N·s/m' }
      ],
      chart: { x: 'Time (s)', y: 'Angular Displacement θ(t)' },
      formula: 'T = 2π√(L / g)  |  θ(t) = θ₀ · e^(-bt) · cos(ωt)'
    };
  }
  if (/(collision|impulse|momentum|center of mass)/.test(t)) {
    return {
      type: 'kinematics',
      subMode: 'collision',
      vars: [
        { id: 'm1', label: 'Mass 1 (m₁)', min: 1, max: 20, step: 1, defaultValue: 8, unit: 'kg' },
        { id: 'm2', label: 'Mass 2 (m₂)', min: 1, max: 20, step: 1, defaultValue: 5, unit: 'kg' },
        { id: 'v1', label: 'Initial Velocity (v₁)', min: 2, max: 25, step: 1, defaultValue: 12, unit: 'm/s' }
      ],
      chart: { x: 'Time (s)', y: 'Total Momentum p (kg·m/s)' },
      formula: 'm₁v₁ᵢ + m₂v₂ᵢ = m₁v₁_f + m₂v₂_f  |  Δp = F · Δt'
    };
  }
  if (/(newton|friction|incline|atwood|tension|elevator|work|energy|power|rolling|moment of inertia)/.test(t)) {
    return {
      type: 'kinematics',
      subMode: 'incline',
      vars: [
        { id: 'angle', label: 'Incline Angle (θ)', min: 5, max: 60, step: 1, defaultValue: 25, unit: '°' },
        { id: 'mu', label: 'Friction Coeff (μ)', min: 0, max: 0.8, step: 0.05, defaultValue: 0.2, unit: '' },
        { id: 'mass', label: 'Block Mass (m)', min: 1, max: 25, step: 1, defaultValue: 6, unit: 'kg' }
      ],
      chart: { x: 'Time (s)', y: 'Velocity v(t) (m/s)' },
      formula: 'a = g(sin θ - μ cos θ)  |  W_net = ΔK'
    };
  }

  // Default: Projectile & 1D/2D Motion
  return {
    type: 'kinematics',
    subMode: 'projectile',
    vars: [
      { id: 'v', label: 'Initial Velocity (v₀)', min: 10, max: 90, step: 2, defaultValue: 50, unit: 'm/s' },
      { id: 'angle', label: 'Launch Angle (θ)', min: 10, max: 85, step: 1, defaultValue: 45, unit: '°' },
      { id: 'g', label: 'Gravity (g)', min: 1.6, max: 20, step: 0.2, defaultValue: 9.8, unit: 'm/s²' }
    ],
    chart: { x: 'Horizontal Distance (m)', y: 'Altitude Height (m)' },
    formula: 'y(t) = v₀·sin(θ)t - ½gt²  |  R = (v₀² sin 2θ) / g'
  };
};

const buildLab = (
  id: number, title: string, subject: Subject, lesson: string,
  competency: string, standard: string
): Lab => {
  const details = getEngineDetails(title);
  return {
    id,
    title,
    subject,
    lesson,
    competency,
    standard,
    formula: details.formula,
    engineType: details.type,
    subMode: details.subMode,
    engineConfig: {
      variables: details.vars,
      chartTitles: details.chart
    }
  };
};

const generateCurriculumData = (): Lab[] => {
  const labs: Lab[] = [];

  physicsTitles.forEach((title, index) => {
    labs.push(buildLab(
      index + 1, title, 'Physics', `Physics Unit ${Math.floor(index / 10) + 1}`,
      `Investigate the mathematical laws, vector interactions, and dynamic principles governing ${title.toLowerCase()}.`,
      `Conduct a controlled virtual experiment applying ${title} models to predict and verify physical system outcomes.`
    ));
  });

  chemistryTitles.forEach((title, index) => {
    labs.push(buildLab(
      101 + index, title, 'Chemistry', `Chemistry Unit ${Math.floor(index / 10) + 1}`,
      `Analyze the molecular behavior, quantitative stoichiometry, and thermodynamic shifts associated with ${title.toLowerCase()}.`,
      `Formulate a laboratory protocol utilizing ${title} principles to determine unknown concentrations or states.`
    ));
  });

  generalScienceTitles.forEach((title, index) => {
    labs.push(buildLab(
      201 + index, title, 'General Science', `General Science Unit ${Math.floor(index / 10) + 1}`,
      `Explore the interconnected earth, life, and physical systems demonstrated in ${title.toLowerCase()}.`,
      `Evaluate environmental and biological data from the ${title} simulation to explain real-world natural phenomena.`
    ));
  });

  return labs;
};

const curriculumData: Lab[] = generateCurriculumData();

// ============================================================================
// NATIVE SVG TELEMETRY CHART
// ============================================================================
const NativeLineChart = ({ 
  data, xAxisLabel, yAxisLabel, color = "#2563eb" 
}: { 
  data: { x: number; y: number }[]; 
  xAxisLabel: string; 
  yAxisLabel: string; 
  color?: string;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm p-4 text-center">
        <Activity className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
        <span>Press <strong>Start</strong> or adjust sliders to stream live telemetry...</span>
      </div>
    );
  }

  const rawMinX = Math.min(...data.map(d => d.x));
  const rawMaxX = Math.max(...data.map(d => d.x));
  const rawMinY = Math.min(...data.map(d => d.y));
  const rawMaxY = Math.max(...data.map(d => d.y));

  const minX = rawMinX === rawMaxX ? rawMinX - 1 : rawMinX;
  const maxX = rawMinX === rawMaxX ? rawMaxX + 1 : rawMaxX;
  const minY = rawMinY === rawMaxY ? rawMinY - Math.max(1, Math.abs(rawMinY * 0.2)) : rawMinY;
  const maxY = rawMinY === rawMaxY ? rawMaxY + Math.max(1, Math.abs(rawMaxY * 0.2)) : rawMaxY;

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const points = data.map((d) => {
    const x = data.length === 1 ? 50 : ((d.x - minX) / rangeX) * 96 + 2;
    const y = 96 - ((d.y - minY) / rangeY) * 92;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastPoint = data[data.length - 1];
  const lastSvgX = data.length === 1 ? 50 : ((lastPoint.x - minX) / rangeX) * 96 + 2;
  const lastSvgY = 96 - ((lastPoint.y - minY) / rangeY) * 92;

  return (
    <div className="relative w-full h-full flex flex-col pl-10 pb-7 pt-2 pr-2 select-none">
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-bold text-slate-500 origin-center whitespace-nowrap tracking-wide">
        {yAxisLabel}
      </div>
      <div className="absolute left-4 top-2 bottom-7 flex flex-col justify-between text-[10px] font-mono text-slate-400 text-right pr-1">
        <span>{maxY.toFixed(1)}</span>
        <span>{((maxY + minY) / 2).toFixed(1)}</span>
        <span>{minY.toFixed(1)}</span>
      </div>
      
      <div className="flex-1 relative border-l-2 border-b-2 border-slate-300 bg-white/60 rounded-tr">
        <div className="absolute inset-0 grid grid-rows-4 grid-cols-4 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border-t border-r border-slate-100" />
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          {data.length > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          <circle
            cx={lastSvgX}
            cy={lastSvgY}
            r="3.5"
            fill={color}
            stroke="#ffffff"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur shadow-sm border border-slate-200 rounded-md px-2.5 py-1.5 text-[11px] text-slate-700 font-mono z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span>X: <strong>{Number(lastPoint.x).toFixed(2)}</strong></span>
          </div>
          <div className="pl-4">
            <span>Y: <strong>{Number(lastPoint.y).toFixed(2)}</strong></span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
        <span>{minX.toFixed(1)}</span>
        <span className="font-sans font-bold text-slate-500 text-[11px]">{xAxisLabel}</span>
        <span>{maxX.toFixed(1)}</span>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 1: KINEMATICS (projectile | incline | orbit | pendulum | collision)
// ============================================================================
const KinematicsEngine: React.FC<EngineProps> = ({ lab, variables, setChartData, isPlaying, resetSignal }) => {
  const [time, setTime] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    setTime(0);
    setTrail([]);
    setChartData([]);
  }, [resetSignal, lab.id, setChartData]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(prev => prev + 0.08);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (lab.subMode === 'orbit') {
      const mass = variables.mass ?? 150;
      const radius = variables.radius ?? 85;
      const ecc = variables.ecc ?? 0.15;
      const omega = Math.sqrt(mass / Math.pow(radius / 20, 3)) * 0.4;
      const theta = time * omega;
      const currentR = (radius * (1 - ecc * ecc)) / (1 + ecc * Math.cos(theta));
      const orbitalSpeed = Math.sqrt(mass * (2 / currentR - 1 / radius)) * 10;
      setChartData(prev => [...prev.slice(-59), { x: Number((theta % (Math.PI * 2)).toFixed(2)), y: Number(orbitalSpeed.toFixed(2)) }]);
    } else if (lab.subMode === 'pendulum') {
      const len = variables.length ?? 2.0;
      const amp = variables.angle ?? 30;
      const damp = variables.damping ?? 0.05;
      const omega = Math.sqrt(9.8 / len);
      const theta = amp * Math.exp(-damp * time) * Math.cos(omega * time);
      setChartData(prev => [...prev.slice(-59), { x: Number(time.toFixed(2)), y: Number(theta.toFixed(2)) }]);
    } else if (lab.subMode === 'collision') {
      const m1 = variables.m1 ?? 8;
      const m2 = variables.m2 ?? 5;
      const v1 = variables.v1 ?? 12;
      const v2After = ((2 * m1) / (m1 + m2)) * v1;
      const tMod = time % 4;
      const displayedV = tMod < 2 ? v1 : v2After;
      setChartData(prev => [...prev.slice(-59), { x: Number(tMod.toFixed(2)), y: Number((displayedV * (tMod < 2 ? m1 : m2)).toFixed(1)) }]);
    } else if (lab.subMode === 'incline') {
      const angleRad = ((variables.angle ?? 25) * Math.PI) / 180;
      const mu = variables.mu ?? 0.2;
      const netAccel = Math.max(0, 9.8 * (Math.sin(angleRad) - mu * Math.cos(angleRad)));
      const tMod = time % 5;
      const vel = netAccel * tMod;
      setChartData(prev => [...prev.slice(-59), { x: Number(tMod.toFixed(2)), y: Number(vel.toFixed(2)) }]);
    } else {
      const v = variables.v ?? 50;
      const angleRad = ((variables.angle ?? 45) * Math.PI) / 180;
      const g = variables.g ?? 9.8;
      const tFlight = Math.max(0.5, (2 * v * Math.sin(angleRad)) / g);
      const tMod = time % (tFlight + 0.4);
      const clampedT = Math.min(tMod, tFlight);
      const x = v * Math.cos(angleRad) * clampedT;
      const y = Math.max(0, v * Math.sin(angleRad) * clampedT - 0.5 * g * clampedT * clampedT);
      if (tMod < 0.1) setTrail([{ x, y }]);
      else setTrail(prev => [...prev.slice(-35), { x, y }]);
      setChartData(prev => [...prev.slice(-59), { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) }]);
    }
  }, [time, variables, lab.subMode, setChartData]);

  if (lab.subMode === 'orbit') {
    const mass = variables.mass ?? 150;
    const radius = variables.radius ?? 85;
    const ecc = variables.ecc ?? 0.15;
    const omega = Math.sqrt(mass / Math.pow(radius / 20, 3)) * 0.4;
    const theta = time * omega;
    const r = (radius * (1 - ecc * ecc)) / (1 + ecc * Math.cos(theta));
    const satX = 200 + r * Math.cos(theta);
    const satY = 135 + r * Math.sin(theta);

    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
        <svg viewBox="0 0 400 270" className="w-full h-full">
          <circle cx="50" cy="40" r="1" fill="#fff" opacity="0.6" />
          <circle cx="340" cy="60" r="1.5" fill="#fff" opacity="0.5" />
          <circle cx="90" cy="230" r="1" fill="#fff" opacity="0.7" />
          <ellipse cx={200 - radius * ecc} cy={135} rx={radius} ry={radius * Math.sqrt(1 - ecc * ecc)} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.5" />
          <circle cx="200" cy="135" r={Math.max(12, mass / 12)} fill="#facc15" />
          <line x1={satX} y1={satY} x2={200} y2={135} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2,2" />
          <circle cx={satX} cy={satY} r="7" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" />
        </svg>
        <div className="absolute top-3 left-3 bg-slate-800/90 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-700">
          <div className="text-sky-400 font-bold mb-1">Orbital Mechanics</div>
          <div>Radius r: {r.toFixed(1)} AU</div>
          <div>Angle θ: {((theta * 180) / Math.PI % 360).toFixed(0)}°</div>
          <div>Period T: {(2 * Math.PI / omega).toFixed(1)} s</div>
        </div>
      </div>
    );
  }

  if (lab.subMode === 'pendulum') {
    const len = variables.length ?? 2.0;
    const amp = variables.angle ?? 30;
    const damp = variables.damping ?? 0.05;
    const omega = Math.sqrt(9.8 / len);
    const thetaDeg = amp * Math.exp(-damp * time) * Math.cos(omega * time);
    const thetaRad = (thetaDeg * Math.PI) / 180;
    const ropePx = 70 + len * 26;
    const bobX = 200 + ropePx * Math.sin(thetaRad);
    const bobY = 30 + ropePx * Math.cos(thetaRad);

    return (
      <div className="relative w-full h-full bg-blue-50/40 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100">
        <svg viewBox="0 0 400 260" className="w-full h-full">
          <line x1="140" y1="30" x2="260" y2="30" stroke="#334155" strokeWidth="5" />
          <line x1="200" y1="30" x2="200" y2="230" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />
          <line x1="200" y1="30" x2={bobX} y2={bobY} stroke="#475569" strokeWidth="2.5" />
          <circle cx={bobX} cy={bobY} r="14" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
        </svg>
        <div className="absolute top-3 left-3 bg-white/95 text-slate-700 font-mono text-xs p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="font-bold text-blue-700 mb-1">Harmonic Oscillator</div>
          <div>Angle θ(t): {thetaDeg.toFixed(1)}°</div>
          <div>Period T: {(2 * Math.PI / omega).toFixed(2)} s</div>
          <div>Angular Freq ω: {omega.toFixed(2)} rad/s</div>
        </div>
      </div>
    );
  }

  if (lab.subMode === 'collision') {
    const m1 = variables.m1 ?? 8;
    const m2 = variables.m2 ?? 5;
    const v1 = variables.v1 ?? 12;
    const v1After = ((m1 - m2) / (m1 + m2)) * v1;
    const v2After = ((2 * m1) / (m1 + m2)) * v1;
    const tMod = time % 4;
    const pos1 = tMod < 2 ? 60 + tMod * 65 : 190 + (tMod - 2) * v1After * 4;
    const pos2 = tMod < 2 ? 215 : 215 + (tMod - 2) * v2After * 5;

    return (
      <div className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
        <svg viewBox="0 0 400 250" className="w-full h-full">
          <line x1="20" y1="180" x2="380" y2="180" stroke="#475569" strokeWidth="4" />
          <rect x={pos1} y="144" width="36" height="36" rx="4" fill="#2563eb" />
          <text x={pos1 + 18} y="166" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{m1}kg</text>
          <rect x={pos2} y="148" width="32" height="32" rx="4" fill="#0d9488" />
          <text x={pos2 + 16} y="168" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{m2}kg</text>
        </svg>
        <div className="absolute top-3 left-3 bg-white/95 text-slate-700 font-mono text-xs p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="font-bold text-blue-700 mb-1">Collision Track</div>
          <div>Initial p: {(m1 * v1).toFixed(1)} kg·m/s</div>
          <div>Post-Collision v₁': {v1After.toFixed(2)} m/s</div>
          <div>Post-Collision v₂': {v2After.toFixed(2)} m/s</div>
        </div>
      </div>
    );
  }

  if (lab.subMode === 'incline') {
    const angle = variables.angle ?? 25;
    const mu = variables.mu ?? 0.2;
    const mass = variables.mass ?? 6;
    const angleRad = (angle * Math.PI) / 180;
    const netAccel = Math.max(0, 9.8 * (Math.sin(angleRad) - mu * Math.cos(angleRad)));
    const tMod = time % 5;
    const slideDist = Math.min(180, 0.5 * netAccel * tMod * tMod * 12);

    return (
      <div className="relative w-full h-full bg-blue-50/50 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100">
        <svg viewBox="0 0 400 260" className="w-full h-full">
          <line x1="30" y1="220" x2="370" y2="220" stroke="#64748b" strokeWidth="3" />
          <g transform={`translate(70, 220) rotate(${-angle})`}>
            <line x1="0" y1="0" x2="260" y2="0" stroke="#334155" strokeWidth="5" />
            <g transform={`translate(${210 - slideDist}, -28)`}>
              <rect x="0" y="0" width="36" height="28" rx="4" fill="#2563eb" stroke="#1e40af" strokeWidth="2" />
              <text x="18" y="18" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{mass}kg</text>
              <line x1="18" y1="0" x2="18" y2="-28" stroke="#16a34a" strokeWidth="2" />
              <line x1="36" y1="14" x2={36 + mu * 35} y2="14" stroke="#dc2626" strokeWidth="2" />
            </g>
          </g>
        </svg>
        <div className="absolute top-3 left-3 bg-white/90 text-slate-700 font-mono text-xs p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="font-bold text-blue-700 mb-1">Incline Dynamics</div>
          <div>Net Accel (a): {netAccel.toFixed(2)} m/s²</div>
          <div>Friction (F_f): {(mu * mass * 9.8 * Math.cos(angleRad)).toFixed(1)} N</div>
          <div>Status: {netAccel > 0 ? 'Accelerating' : 'Static Equilibrium'}</div>
        </div>
      </div>
    );
  }

  // Projectile default
  const v = variables.v ?? 50;
  const angle = variables.angle ?? 45;
  const g = variables.g ?? 9.8;
  const angleRad = (angle * Math.PI) / 180;
  const tFlight = Math.max(0.5, (2 * v * Math.sin(angleRad)) / g);
  const maxRange = (v * v * Math.sin(2 * angleRad)) / g;
  const maxHeight = Math.pow(v * Math.sin(angleRad), 2) / (2 * g);
  const currentPoint = trail[trail.length - 1] || { x: 0, y: 0 };
  const scaleX = 300 / Math.max(120, maxRange * 1.1);
  const scaleY = 180 / Math.max(60, maxHeight * 1.2);

  return (
    <div className="relative w-full h-full bg-blue-50/40 rounded-xl overflow-hidden border border-blue-100">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <svg viewBox="0 0 400 260" className="w-full h-full relative z-10">
        <rect x="0" y="225" width="400" height="35" fill="#e2e8f0" />
        <line x1="0" y1="225" x2="400" y2="225" stroke="#94a3b8" strokeWidth="2" />
        <path
          d={Array.from({ length: 30 }).map((_, i) => {
            const tStep = (i / 29) * tFlight;
            const px = 35 + v * Math.cos(angleRad) * tStep * scaleX;
            const py = 225 - Math.max(0, v * Math.sin(angleRad) * tStep - 0.5 * g * tStep * tStep) * scaleY;
            return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
          }).join(' ')}
          fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="4,4"
        />
        {trail.map((pt, idx) => (
          <circle key={idx} cx={35 + pt.x * scaleX} cy={225 - pt.y * scaleY} r="2.5" fill="#3b82f6" opacity={(idx + 1) / trail.length} />
        ))}
        <circle cx={35 + currentPoint.x * scaleX} cy={225 - currentPoint.y * scaleY} r="7" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
      </svg>
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-700 font-mono text-xs p-3 rounded-lg border border-slate-200 shadow-sm z-20">
        <div className="font-bold text-blue-700 mb-1">Projectile Telemetry</div>
        <div>Range (x): {currentPoint.x.toFixed(1)} m (Max: {maxRange.toFixed(1)} m)</div>
        <div>Height (y): {currentPoint.y.toFixed(1)} m (Peak: {maxHeight.toFixed(1)} m)</div>
        <div>Flight Time: {tFlight.toFixed(2)} s</div>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 2: CIRCUIT & SIMPLE MACHINES (dc | rc | ac | magnetism | lever)
// ============================================================================
const CircuitEngine: React.FC<EngineProps> = ({ lab, variables, setChartData, isPlaying, resetSignal }) => {
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState(0);

  const v = variables.v ?? 12;
  const r = variables.r ?? 12;
  const r2 = variables.r2 ?? 3;
  const c = variables.c ?? 50;
  const freq = variables.freq ?? 50;

  useEffect(() => {
    setTime(0);
    setPhase(0);
    setChartData([]);
  }, [resetSignal, lab.id, setChartData]);

  useEffect(() => {
    if (lab.subMode === 'lever') {
      const dE = variables.effortDist ?? 6;
      const dL = variables.loadDist ?? 3;
      const mL = variables.loadMass ?? 40;
      const fLoad = mL * 9.8;
      const fEffort = (fLoad * dL) / dE;
      setChartData(prev => [...prev.slice(-39), { x: dE, y: Number(fEffort.toFixed(1)) }]);
    }
  }, [variables, lab.subMode, setChartData]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => {
        const nextT = Number((t + 0.1).toFixed(1));
        if (lab.subMode === 'rc') {
          const tau = Math.max(0.3, (r * c) / 500);
          const vc = v * (1 - Math.exp(-nextT / tau));
          setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(vc.toFixed(2)) }]);
        } else if (lab.subMode === 'ac') {
          const iInst = (v / r) * Math.sin(nextT * (freq / 10));
          setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(iInst.toFixed(2)) }]);
        } else if (lab.subMode === 'magnetism') {
          const b = variables.bField ?? 2.0;
          const n = variables.turns ?? 80;
          const spd = variables.speed ?? 6;
          const emf = (b * n * spd * 0.05) * Math.cos(nextT * spd);
          setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(emf.toFixed(2)) }]);
        } else if (lab.subMode === 'dc') {
          const curr = v / (r + r2);
          setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(curr.toFixed(2)) }]);
        }
        return nextT;
      });
      setPhase(p => (p + 4) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying, lab.subMode, v, r, r2, c, freq, variables, setChartData]);

  if (lab.subMode === 'lever') {
    const dE = variables.effortDist ?? 6;
    const dL = variables.loadDist ?? 3;
    const mL = variables.loadMass ?? 40;
    const fLoad = mL * 9.8;
    const fEffort = (fLoad * dL) / dE;
    const ima = dE / dL;
    const tilt = Math.max(-12, Math.min(12, (dL - dE) * 1.5));

    return (
      <div className="relative w-full h-full bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full h-full">
          <polygon points="200,145 182,195 218,195" fill="#475569" />
          <g transform={`translate(200, 145) rotate(${tilt})`}>
            <rect x="-150" y="-6" width="300" height="10" rx="3" fill="#2563eb" />
            <rect x={-dL * 13 - 15} y="-34" width="30" height="28" rx="4" fill="#dc2626" />
            <text x={-dL * 13} y="-16" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">{mL}kg</text>
            <line x1={dE * 13} y1="-45" x2={dE * 13} y2="-8" stroke="#16a34a" strokeWidth="3" />
            <polygon points={`${dE * 13},-6 ${dE * 13 - 5},-16 ${dE * 13 + 5},-16`} fill="#16a34a" />
          </g>
        </svg>
        <div className="absolute top-3 left-3 bg-white/95 p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700">
          <div className="font-bold text-blue-700 mb-1">Simple Machine Torque</div>
          <div>Mechanical Advantage: {ima.toFixed(2)}x</div>
          <div>Load Weight: {fLoad.toFixed(0)} N</div>
          <div className="text-emerald-700 font-bold">Effort Required: {fEffort.toFixed(1)} N</div>
        </div>
      </div>
    );
  }

  if (lab.subMode === 'magnetism') {
    const b = variables.bField ?? 2.0;
    const n = variables.turns ?? 80;
    const spd = variables.speed ?? 6;
    const magX = 110 + Math.sin(time * spd * 0.5) * 45;

    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full h-full">
          {/* Bar Magnet */}
          <g transform={`translate(${magX}, 105)`}>
            <rect x="0" y="0" width="45" height="30" fill="#dc2626" />
            <rect x="-45" y="0" width="45" height="30" fill="#2563eb" />
            <text x="22" y="20" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">N</text>
            <text x="-22" y="20" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
          </g>
          {/* Solenoid Coil */}
          <rect x="210" y="85" width="90" height="70" rx="8" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8,6" />
          <text x="255" y="175" fill="#fcd34d" fontSize="11" fontWeight="bold" textAnchor="middle">{n} Turns Solenoid</text>
        </svg>
        <div className="absolute top-3 left-3 bg-slate-800/95 text-slate-100 p-3 rounded-lg border border-slate-700 font-mono text-xs">
          <div className="font-bold text-amber-400 mb-1">Electromagnetic Induction</div>
          <div>B-Field: {b.toFixed(1)} T | N: {n}</div>
          <div>Peak EMF: {(b * n * spd * 0.05).toFixed(1)} V</div>
        </div>
      </div>
    );
  }

  const totalR = r + r2;
  const currentI = v / totalR;
  const glow = Math.min(1, currentI / 2.0);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
      <svg viewBox="0 0 420 240" className="w-full h-full max-w-[460px] text-slate-700">
        <rect x="60" y="45" width="300" height="150" rx="8" fill="none" stroke="#334155" strokeWidth="4" />
        <rect x="60" y="45" width="300" height="150" rx="8" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6,18" strokeDashoffset={-phase} />
        <rect x="42" y="95" width="36" height="50" fill="#f8fafc" />
        <line x1="45" y1="108" x2="75" y2="108" stroke="#0f172a" strokeWidth="4" />
        <line x1="52" y1="120" x2="68" y2="120" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="45" y1="132" x2="75" y2="132" stroke="#0f172a" strokeWidth="4" />
        <text x="35" y="124" fill="#2563eb" fontSize="11" fontWeight="bold" textAnchor="end">{v}V</text>
        <rect x="175" y="33" width="70" height="24" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
        <text x="210" y="49" fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle">
          {lab.subMode === 'rc' ? `C = ${c}μF` : lab.subMode === 'ac' ? `f = ${freq}Hz` : `R₂ = ${r2}Ω`}
        </text>
        <circle cx="360" cy="120" r="34" fill={`rgba(250, 204, 21, ${glow * 0.45})`} />
        <circle cx="360" cy="120" r="22" fill="#ffffff" stroke="#334155" strokeWidth="3" />
        <circle cx="360" cy="120" r="18" fill={`rgba(250, 204, 21, ${glow})`} />
        <text x="360" y="160" fill="#334155" fontSize="11" fontWeight="bold" textAnchor="middle">R₁ = {r}Ω</text>
      </svg>
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700">
        <div className="font-bold text-blue-700 mb-1">Circuit Analyzer ({lab.subMode.toUpperCase()})</div>
        <div>Current (I): {currentI.toFixed(2)} A</div>
        <div className="text-orange-600 font-bold">Power (P): {(v * currentI).toFixed(2)} W</div>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 3: PARTICLE, THERMO & EARTH (gas | phase | atomic | tectonics | weather)
// ============================================================================
const ParticleThermoEngine: React.FC<EngineProps> = ({ lab, variables, setChartData, isPlaying, resetSignal }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    setChartData([]);
  }, [resetSignal, lab.id, setChartData]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (lab.subMode === 'atomic') {
      const z = variables.protons ?? 6;
      const nShell = variables.energy ?? 2;
      const eVal = -13.6 * (z * z) / (nShell * nShell);
      setChartData(prev => [...prev.slice(-49), { x: nShell, y: Number(eVal.toFixed(1)) }]);
    } else if (lab.subMode === 'tectonics') {
      const heat = variables.mantleHeat ?? 550;
      const spd = variables.plateSpeed ?? 6;
      const strain = (heat * 0.05) + spd * 4;
      setChartData(prev => [...prev.slice(-49), { x: Number((tick * 0.2).toFixed(1)), y: Number(strain.toFixed(1)) }]);
    } else if (lab.subMode === 'weather') {
      const solar = variables.solar ?? 600;
      const ghg = variables.ghg ?? 50;
      const tempC = 12 + (solar - 500) * 0.02 + ghg * 0.12;
      setChartData(prev => [...prev.slice(-49), { x: Number((tick * 0.5).toFixed(1)), y: Number(tempC.toFixed(1)) }]);
    } else if (lab.subMode === 'phase') {
      const temp = variables.t ?? 280;
      const q = variables.heat ?? 80;
      setChartData(prev => [...prev.slice(-49), { x: q, y: temp }]);
    } else {
      const temp = variables.t ?? 300;
      const vol = variables.v ?? 25;
      const n = variables.n ?? 30;
      const press = Number(((n * 0.0821 * temp) / vol).toFixed(2));
      setChartData(prev => [...prev.slice(-49), { x: vol, y: press }]);
    }
  }, [tick, variables, lab.subMode, setChartData]);

  if (lab.subMode === 'atomic') {
    const z = variables.protons ?? 6;
    const nCount = variables.neutrons ?? 6;
    const shell = variables.energy ?? 2;

    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
        <svg viewBox="0 0 400 250" className="w-full h-full">
          {[1, 2, 3].map(s => (
            <circle key={s} cx="200" cy="125" r={s * 32} fill="none" stroke={s === shell ? '#38bdf8' : '#334155'} strokeWidth="1.5" strokeDasharray="4,4" />
          ))}
          <circle cx="200" cy="125" r="14" fill="#ef4444" />
          <text x="200" y="129" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{z}p/{nCount}n</text>
          {Array.from({ length: Math.min(8, z) }).map((_, i) => {
            const ang = (i * (2 * Math.PI / Math.min(8, z))) + tick * 0.08;
            const r = Math.min(3, shell) * 32;
            return <circle key={i} cx={200 + r * Math.cos(ang)} cy={125 + r * Math.sin(ang)} r="5" fill="#38bdf8" />;
          })}
        </svg>
        <div className="absolute top-3 left-3 bg-slate-800/95 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-700">
          <div className="font-bold text-sky-400 mb-1">Atomic & Quantum Model</div>
          <div>Mass Number (A): {z + nCount} amu</div>
          <div>Active Shell: n = {shell}</div>
        </div>
      </div>
    );
  }

  if (lab.subMode === 'tectonics') {
    const spd = variables.plateSpeed ?? 6;
    const shift = (tick * spd * 0.2) % 30;
    return (
      <div className="relative w-full h-full bg-amber-50/40 rounded-xl flex items-center justify-center border border-amber-200 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full h-full">
          <rect x="0" y="150" width="400" height="90" fill="#ea580c" />
          <path d={`M 0 110 L ${190 + shift} 110 L ${230 + shift} 175 L 0 175 Z`} fill="#78716c" />
          <path d={`M ${205 - shift} 95 L 400 95 L 400 150 L ${185 - shift} 150 Z`} fill="#57534e" />
          <polygon points="260,95 285,55 310,95" fill="#44403c" />
          <circle cx="285" cy="50" r="6" fill="#ef4444" />
        </svg>
        <div className="absolute top-3 left-3 bg-white/95 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
          <div className="font-bold text-amber-800 mb-1">Plate Tectonics & Crust</div>
          <div>Convergence Rate: {spd} cm/yr</div>
          <div>Mantle Flux: {variables.mantleHeat ?? 550} mW/m²</div>
        </div>
      </div>
    );
  }

  const temp = variables.t ?? variables.solar ?? 300;
  const vol = variables.v ?? variables.ghg ?? 25;
  const count = Math.min(45, Math.max(12, Math.round(variables.n ?? 28)));
  const speedFactor = (temp / 300) * (isPlaying ? 1.6 : 0.2);
  const chamberWidthPct = lab.subMode === 'gas' ? Math.max(35, Math.min(90, (vol / 50) * 90)) : 80;

  return (
    <div className="relative w-full h-full bg-orange-50/30 rounded-xl flex items-center justify-center border border-orange-100 overflow-hidden p-4">
      <div className="relative rounded-xl border-4 border-slate-400 bg-white shadow-inner overflow-hidden transition-all duration-300" style={{ width: `${chamberWidthPct}%`, height: '78%' }}>
        <div className="w-full h-3 bg-slate-500 border-b-2 border-slate-700" />
        {Array.from({ length: count }).map((_, i) => {
          const rawX = ((i * 37) % 84 + 8 + tick * ((i % 2 === 0 ? 1 : -1) * 2) * speedFactor) % 180;
          const rawY = ((i * 53) % 80 + 10 + tick * ((i % 3 === 0 ? 1 : -1) * 2) * speedFactor) % 180;
          const x = rawX > 90 ? 180 - rawX : Math.max(5, rawX);
          const y = rawY > 90 ? 180 - rawY : Math.max(8, rawY);
          return (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${temp > 480 ? 'bg-red-500' : temp < 220 ? 'bg-blue-500' : 'bg-orange-500'}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          );
        })}
      </div>
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700 z-10">
        <div className="font-bold text-orange-700 mb-1">Thermodynamic Chamber ({lab.subMode.toUpperCase()})</div>
        <div>Temp / Flux: {temp}</div>
        <div>State Volume: {vol}</div>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 4: CHEMISTRY REACTION (titration | kinetics | electrochem | equilibrium)
// ============================================================================
const ChemistryReactionEngine: React.FC<EngineProps> = ({ 
  lab, variables, setVariables, setChartData, isPlaying, setIsPlaying, resetSignal 
}) => {
  const [reactionTime, setReactionTime] = useState(0);

  const vol = variables.vol ?? 0;
  const conc = variables.conc ?? 0.5;
  const acidConc = variables.acidConc ?? 0.5;
  const rateK = variables.rate ?? 0.25;

  const calculatePH = (vBase: number) => {
    const vAcid = 25;
    const molesAcid = vAcid * acidConc;
    const molesBase = vBase * conc;
    const totalVol = vAcid + vBase;
    if (Math.abs(molesAcid - molesBase) < 0.001) return 7.0;
    if (molesBase < molesAcid) return Math.max(0.5, -Math.log10((molesAcid - molesBase) / totalVol));
    return Math.min(13.8, 14 + Math.log10((molesBase - molesAcid) / totalVol));
  };

  const currentPH = calculatePH(vol);

  useEffect(() => {
    setReactionTime(0);
    if (lab.subMode === 'titration') {
      setVariables(prev => ({ ...prev, vol: 0 }));
      setChartData([{ x: 0, y: Number(calculatePH(0).toFixed(2)) }]);
    } else {
      setChartData([]);
    }
  }, [resetSignal, lab.id]);

  useEffect(() => {
    if (lab.subMode === 'titration') {
      const pts: { x: number; y: number }[] = [];
      for (let v = 0; v <= vol; v += 0.5) {
        pts.push({ x: Number(v.toFixed(1)), y: Number(calculatePH(v).toFixed(2)) });
      }
      setChartData(pts.length ? pts : [{ x: 0, y: Number(calculatePH(0).toFixed(2)) }]);
    }
  }, [vol, conc, acidConc, lab.subMode]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (lab.subMode === 'titration') {
        setVariables(prev => {
          const nextVol = Number(Math.min(50, (prev.vol ?? 0) + 0.5).toFixed(1));
          if (nextVol >= 50) setIsPlaying(false);
          return { ...prev, vol: nextVol };
        });
      } else {
        setReactionTime(t => {
          const nextT = Number((t + 0.4).toFixed(1));
          if (lab.subMode === 'electrochem') {
            const e0 = variables.e0 ?? 1.1;
            const q = variables.qRatio ?? 1.0;
            const temp = variables.temp ?? 298;
            const eCell = e0 - ((8.314 * temp) / (2 * 96485)) * Math.log(q + nextT * 0.05);
            setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(eCell.toFixed(3)) }]);
          } else if (lab.subMode === 'equilibrium') {
            const a0 = variables.reactant ?? 1.0;
            const keq = variables.keq ?? 1.8;
            const cEq = (a0 * (keq / (1 + keq))) * (1 - Math.exp(-0.35 * nextT));
            setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(cEq.toFixed(3)) }]);
          } else {
            const initA = variables.conc ?? 1.2;
            const productP = initA * (1 - Math.exp(-rateK * nextT));
            setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(productP.toFixed(3)) }]);
          }
          return nextT;
        });
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, lab.subMode, rateK, variables, setVariables, setIsPlaying, setChartData]);

  if (lab.subMode === 'electrochem') {
    const e0 = variables.e0 ?? 1.1;
    const q = variables.qRatio ?? 1.0;
    const temp = variables.temp ?? 298;
    const eCell = e0 - ((8.314 * temp) / (2 * 96485)) * Math.log(q);

    return (
      <div className="relative w-full h-full bg-teal-50/40 rounded-xl flex items-center justify-center border border-teal-100 overflow-hidden">
        <svg viewBox="0 0 400 240" className="w-full h-full">
          {/* Anode & Cathode Beakers */}
          <rect x="70" y="100" width="90" height="100" rx="4" fill="#e0f2fe" stroke="#475569" strokeWidth="3" />
          <rect x="240" y="100" width="90" height="100" rx="4" fill="#dcfce7" stroke="#475569" strokeWidth="3" />
          {/* Electrodes */}
          <rect x="95" y="70" width="18" height="110" fill="#64748b" />
          <rect x="285" y="70" width="18" height="110" fill="#b45309" />
          {/* Salt Bridge */}
          <path d="M 140 120 L 140 75 L 260 75 L 260 120" fill="none" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          {/* Wire & Voltmeter */}
          <path d="M 104 70 L 104 35 L 294 35 L 294 70" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="200" cy="35" r="20" fill="#fff" stroke="#0d9488" strokeWidth="3" />
          <text x="200" y="39" fill="#0f766e" fontSize="10" fontWeight="bold" textAnchor="middle">{eCell.toFixed(2)}V</text>
        </svg>
        <div className="absolute top-3 left-3 bg-white/95 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
          <div className="font-bold text-teal-700 mb-1">Electrochemical Cell</div>
          <div>Nernst EMF: <strong>{eCell.toFixed(3)} V</strong></div>
          <div>Reaction Quotient Q: {q}</div>
        </div>
      </div>
    );
  }

  const liquidColor = lab.subMode === 'titration'
    ? (currentPH < 6.8 ? 'rgba(226, 232, 240, 0.65)' : currentPH < 8.2 ? 'rgba(244, 114, 182, 0.35)' : 'rgba(219, 39, 119, 0.75)')
    : 'rgba(20, 184, 166, 0.6)';

  return (
    <div className="relative w-full h-full bg-teal-50/40 rounded-xl flex flex-col items-center justify-end pb-8 border border-teal-100 overflow-hidden">
      <div className="absolute top-4 flex flex-col items-center">
        <div className="w-7 h-36 border-x-2 border-b-2 border-slate-400 rounded-b bg-white/80 flex items-end overflow-hidden shadow-inner">
          <div className="w-full bg-teal-300/80 transition-all duration-150" style={{ height: `${Math.max(5, 100 - (vol / 50) * 95)}%` }} />
        </div>
        <div className="w-5 h-2 bg-rose-500 rounded-full my-0.5" />
      </div>
      {isPlaying && (
        <motion.div className="absolute top-44 w-2.5 h-2.5 bg-teal-400 rounded-full" animate={{ y: [0, 55], opacity: [1, 0.2] }} transition={{ repeat: Infinity, duration: 0.35 }} />
      )}
      <div className="relative w-36 h-40 mt-24">
        <svg viewBox="0 0 100 120" className="w-full h-full relative z-10">
          <path d="M38 5 L62 5 L62 38 L92 108 A 8 8 0 0 1 84 118 L16 118 A 8 8 0 0 1 8 108 L38 38 Z" fill="none" stroke="#475569" strokeWidth="3.5" />
        </svg>
        <div className="absolute bottom-1 left-[10%] w-[80%] h-[55%] overflow-hidden" style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)' }}>
          <div className="w-full h-full transition-colors duration-300" style={{ backgroundColor: liquidColor }} />
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700 z-20">
        <div className="font-bold text-teal-700 mb-1">Chemical Analyzer ({lab.subMode.toUpperCase()})</div>
        {lab.subMode === 'titration' ? (
          <>
            <div>Titrant Volume: {vol.toFixed(1)} mL</div>
            <div className="text-teal-700 font-bold mt-1">Solution pH: {currentPH.toFixed(2)}</div>
          </>
        ) : (
          <div>Reaction Time: {reactionTime.toFixed(1)} s</div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 5: WAVE & OPTICS (wave | optics | interference | spectra)
// ============================================================================
const WaveOpticsEngine: React.FC<EngineProps> = ({ lab, variables, setChartData, isPlaying, resetSignal }) => {
  const [time, setTime] = useState(0);

  const wavelength = variables.wavelength ?? 530;
  const beamColor = wavelength < 490 ? '#3b82f6' : wavelength < 560 ? '#10b981' : wavelength < 610 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    setTime(0);
    setChartData([]);
  }, [resetSignal, lab.id, setChartData]);

  useEffect(() => {
    if (lab.subMode === 'optics') {
      const n2 = variables.n2 ?? 1.5;
      const curve: { x: number; y: number }[] = [];
      for (let a = 5; a <= 80; a += 5) {
        const rAngle = Math.asin(Math.min(1, Math.sin((a * Math.PI) / 180) / n2)) * (180 / Math.PI);
        curve.push({ x: a, y: Number(rAngle.toFixed(2)) });
      }
      setChartData(curve);
    } else if (lab.subMode === 'interference') {
      const d = variables.slitDist ?? 40;
      const L = variables.screenDist ?? 1.5;
      const curve: { x: number; y: number }[] = [];
      for (let y = -15; y <= 15; y += 1) {
        const phase = (Math.PI * d * y) / (wavelength * L * 0.05);
        curve.push({ x: y, y: Number(Math.pow(Math.cos(phase), 2).toFixed(2)) });
      }
      setChartData(curve);
    } else if (lab.subMode === 'spectra') {
      const conc = variables.conc ?? 0.8;
      const path = variables.path ?? 1.0;
      const curve: { x: number; y: number }[] = [];
      for (let w = 380; w <= 740; w += 15) {
        const abs = conc * path * Math.exp(-Math.pow((w - wavelength) / 65, 2));
        curve.push({ x: w, y: Number(abs.toFixed(2)) });
      }
      setChartData(curve);
    }
  }, [variables, wavelength, lab.subMode, setChartData]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => {
        const nextT = Number((t + 0.08).toFixed(2));
        if (lab.subMode === 'wave') {
          const freq = variables.freq ?? 4;
          const amp = variables.amp ?? 45;
          const yVal = Math.sin(nextT * freq) * amp;
          setChartData(prev => [...prev.slice(-59), { x: nextT, y: Number(yVal.toFixed(1)) }]);
        }
        return nextT;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, lab.subMode, variables, setChartData]);

  if (lab.subMode === 'optics' || lab.subMode === 'interference' || lab.subMode === 'spectra') {
    const angle1 = variables.angle ?? 40;
    const n2 = variables.n2 ?? 1.5;
    const angle2 = Math.asin(Math.min(1, Math.sin((angle1 * Math.PI) / 180) / n2)) * (180 / Math.PI);
    const rad1 = (angle1 * Math.PI) / 180;
    const rad2 = (angle2 * Math.PI) / 180;

    return (
      <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
        <svg viewBox="0 0 400 260" className="w-full h-full">
          <rect x="0" y="0" width="400" height="130" fill="#0f172a" />
          <rect x="0" y="130" width="400" height="130" fill="#1e293b" />
          <line x1="0" y1="130" x2="400" y2="130" stroke="#64748b" strokeWidth="2" />
          <line x1="200" y1="15" x2="200" y2="245" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
          <line x1={200 - 110 * Math.sin(rad1)} y1={130 - 110 * Math.cos(rad1)} x2="200" y2="130" stroke={beamColor} strokeWidth="3.5" />
          <line x1="200" y1="130" x2={200 + 110 * Math.sin(rad2)} y2={130 + 110 * Math.cos(rad2)} stroke={beamColor} strokeWidth="3.5" />
          <circle cx="200" cy="130" r="4" fill="#ffffff" />
        </svg>
        <div className="absolute top-3 left-3 bg-slate-800/90 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-700">
          <div className="font-bold text-sky-400 mb-1">Optical & Spectral Bench ({lab.subMode.toUpperCase()})</div>
          <div>Wavelength λ: {wavelength} nm</div>
          <div>Refracted θ₂: {angle2.toFixed(1)}°</div>
        </div>
      </div>
    );
  }

  const freq = variables.freq ?? 4;
  const amp = variables.amp ?? 45;
  const speed = variables.speed ?? 4;
  let path = 'M 0 130 ';
  for (let x = 0; x <= 400; x += 4) {
    const y = 130 + Math.sin((x / 400) * Math.PI * 2 * freq - time * speed) * amp;
    path += `L ${x} ${y.toFixed(1)} `;
  }

  return (
    <div className="relative w-full h-full bg-blue-50/40 rounded-xl flex items-center justify-center border border-blue-100 overflow-hidden">
      <svg viewBox="0 0 400 260" className="w-full h-full">
        <line x1="0" y1="130" x2="400" y2="130" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
        <path d={path} stroke="#2563eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </svg>
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700">
        <div className="font-bold text-blue-700 mb-1">Wave Oscilloscope</div>
        <div>Frequency: {freq} Hz | λ: {(speed / freq).toFixed(2)} m</div>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE 6: BIOLOGY & LIFE SCIENCES (microscope | genetics | physiology | ecology)
// ============================================================================
const BiologyEngine: React.FC<EngineProps> = ({ lab, variables, setChartData, isPlaying, resetSignal }) => {
  const [time, setTime] = useState(0);
  const [population, setPopulation] = useState(12);

  useEffect(() => {
    setTime(0);
    setPopulation(12);
    setChartData([]);
  }, [resetSignal, lab.id, setChartData]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => {
        const nextT = t + 1;
        if (lab.subMode === 'genetics') {
          const p0 = variables.pFreq ?? 0.6;
          const sel = variables.selection ?? 0.15;
          const pNext = Math.min(0.99, p0 + (1 - p0) * (1 - Math.exp(-sel * nextT * 0.2)));
          setChartData(prev => [...prev.slice(-49), { x: nextT, y: Number(pNext.toFixed(3)) }]);
        } else if (lab.subMode === 'physiology') {
          const stim = variables.stimulus ?? 60;
          const sub = variables.substrate ?? 50;
          const pulse = (stim * 0.7 + sub * 0.3) * (1 + 0.35 * Math.sin(nextT * 0.9));
          setChartData(prev => [...prev.slice(-49), { x: nextT, y: Number(pulse.toFixed(1)) }]);
        } else if (lab.subMode === 'ecology') {
          const alpha = variables.preyGrowth ?? 0.45;
          const cap = variables.carrying ?? 160;
          const osc = (cap * 0.6) + (cap * 0.3) * Math.sin(nextT * alpha);
          setChartData(prev => [...prev.slice(-49), { x: nextT, y: Math.round(osc) }]);
        } else {
          setPopulation(prevPop => {
            const nut = variables.nutrients ?? 65;
            const stress = variables.inhibitor ?? 10;
            const kCap = Math.max(20, nut * 2 - stress);
            const nextPop = Math.max(4, prevPop + 0.22 * prevPop * (1 - prevPop / kCap));
            setChartData(prev => [...prev.slice(-49), { x: nextT, y: Math.round(nextPop) }]);
            return nextPop;
          });
        }
        return nextT;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, lab.subMode, variables, setChartData]);

  if (lab.subMode === 'genetics') {
    const p = variables.pFreq ?? 0.6;
    const q = Number((1 - p).toFixed(2));
    return (
      <div className="relative w-full h-full bg-purple-50/40 rounded-xl flex items-center justify-center border border-purple-100 p-4">
        <div className="grid grid-cols-2 gap-3 w-56 h-56 bg-white p-4 rounded-xl border-2 border-purple-300 shadow-sm text-center font-mono">
          <div className="bg-purple-100 rounded-lg flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-purple-900">AA</span>
            <span className="text-xs text-purple-700">{(p * p * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-fuchsia-100 rounded-lg flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-fuchsia-900">Aa</span>
            <span className="text-xs text-fuchsia-700">{(p * q * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-fuchsia-100 rounded-lg flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-fuchsia-900">aA</span>
            <span className="text-xs text-fuchsia-700">{(p * q * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-slate-100 rounded-lg flex flex-col items-center justify-center p-2">
            <span className="text-lg font-bold text-slate-800">aa</span>
            <span className="text-xs text-slate-600">{(q * q * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-white/95 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
          <div className="font-bold text-purple-700 mb-1">Hardy-Weinberg Matrix</div>
          <div>p (Dom): {p.toFixed(2)} | q (Rec): {q.toFixed(2)}</div>
        </div>
      </div>
    );
  }

  const cellCountToRender = Math.min(100, Math.round(population));

  return (
    <div className="relative w-full h-full bg-purple-50/40 rounded-xl flex items-center justify-center border border-purple-100 overflow-hidden">
      <div className="relative w-60 h-60 rounded-full border-8 border-purple-200 bg-white shadow-inner flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#9333ea 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        {Array.from({ length: cellCountToRender }).map((_, i) => {
          const angle = (i * 137.5 * Math.PI) / 180 + (isPlaying ? time * 0.05 : 0);
          const radius = Math.min(44, Math.sqrt(i + 1) * 4.2);
          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-fuchsia-500 border border-purple-700 transition-all duration-300"
              style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%`, opacity: 0.8 }}
            />
          );
        })}
      </div>
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-xs text-slate-700 z-10">
        <div className="font-bold text-purple-700 mb-1">Bio-Monitor ({lab.subMode.toUpperCase()})</div>
        <div>Generation Step: {time}</div>
        <div className="text-purple-700 font-bold mt-1">Active Count: {Math.round(population)}</div>
      </div>
    </div>
  );
};

// ============================================================================
// UI COMPONENTS (THUMBNAIL, DISCUSSION, WORKSPACE & DASHBOARD)
// ============================================================================
const SimulationThumbnail = ({ subject, engineType }: { subject: Subject; engineType: EngineType }) => {
  let Icon = Activity;
  if (engineType === 'kinematics') Icon = Target;
  else if (engineType === 'circuit') Icon = Zap;
  else if (engineType === 'particle') Icon = Box;
  else if (engineType === 'reaction') Icon = FlaskConical;
  else if (engineType === 'wave') Icon = Waves;
  else if (engineType === 'biology') Icon = Microscope;

  const bgGradient = subject === 'Physics' ? 'from-blue-600 to-indigo-700'
    : subject === 'Chemistry' ? 'from-emerald-600 to-teal-700'
    : 'from-purple-600 to-fuchsia-700';

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${bgGradient}`}>
      <Icon className="w-16 h-16 text-white/25 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
    </div>
  );
};

const LabDiscussion = ({ 
  lab, onStart, onBack, onNavigateLab 
}: { 
  lab: Lab; 
  onStart: () => void; 
  onBack: () => void;
  onNavigateLab: (id: number) => void;
}) => {
  const currentIndex = curriculumData.findIndex(l => l.id === lab.id);
  const prevLab = currentIndex > 0 ? curriculumData[currentIndex - 1] : null;
  const nextLab = currentIndex < curriculumData.length - 1 ? curriculumData[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex gap-3 items-center">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors flex items-center gap-1 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> All 300 Labs
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-0 leading-tight">#{String(lab.id).padStart(3, '0')} {lab.title}</h1>
            <div className="text-xs text-gray-500 font-medium">{lab.subject} &bull; {lab.lesson}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {prevLab && (
            <button onClick={() => onNavigateLab(prevLab.id)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> #{String(prevLab.id).padStart(3, '0')}
            </button>
          )}
          {nextLab && (
            <button onClick={() => onNavigateLab(nextLab.id)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center gap-1">
              #{String(nextLab.id).padStart(3, '0')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-2">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-blue-600">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-2xl font-bold m-0 text-gray-900">Pre-Lab Theory & Curriculum Alignment</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
              Module #{String(lab.id).padStart(3, '0')} &bull; Mode: {lab.subMode.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50/60 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">Learning Competency</h4>
                <p className="text-sm text-gray-800 m-0 leading-relaxed">{lab.competency}</p>
              </div>
              <div className="bg-teal-50/60 border-l-4 border-teal-600 p-4 rounded-r-lg">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">Performance Standard</h4>
                <p className="text-sm text-gray-800 m-0 leading-relaxed">{lab.standard}</p>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5 mb-1">
                  <Calculator className="w-4 h-4" /> Governing Mathematical Model
                </div>
                <div className="text-lg md:text-xl font-mono font-bold tracking-wide text-white">{lab.formula}</div>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                X-Axis: {lab.engineConfig.chartTitles.x}<br />
                Y-Axis: {lab.engineConfig.chartTitles.y}
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-200" />
          <div className="flex justify-end">
            <button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
              Launch Virtual Experiment <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const LabWorkspace = ({ 
  lab, onBack, onNavigateLab 
}: { 
  lab: Lab; 
  onBack: () => void;
  onNavigateLab: (id: number) => void;
}) => {
  const [variables, setVariables] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    lab.engineConfig.variables.forEach(v => { init[v.id] = v.defaultValue; });
    return init;
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const initialVars: Record<string, number> = {};
    lab.engineConfig.variables.forEach(v => { initialVars[v.id] = v.defaultValue; });
    setVariables(initialVars);
    setChartData([]);
    setIsPlaying(true);
    setResetSignal(s => s + 1);
  }, [lab.id]);

  const handleReset = () => {
    setIsPlaying(false);
    const resetVars: Record<string, number> = {};
    lab.engineConfig.variables.forEach(v => { resetVars[v.id] = v.defaultValue; });
    setVariables(resetVars);
    setChartData([]);
    setResetSignal(s => s + 1);
  };

  const handleExportCSV = () => {
    const rows = [
      ['GiOLab Telemetry Export', `#${lab.id} ${lab.title}`, lab.subject],
      ['Formula', lab.formula],
      ['Notes', notes.replace(/,/g, ';')],
      [],
      [lab.engineConfig.chartTitles.x, lab.engineConfig.chartTitles.y],
      ...chartData.map(pt => [String(pt.x), String(pt.y)])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `GiOLab_${lab.id}_${lab.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const EngineComponent = useMemo(() => {
    switch (lab.engineType) {
      case 'kinematics': return KinematicsEngine;
      case 'circuit': return CircuitEngine;
      case 'particle': return ParticleThermoEngine;
      case 'reaction': return ChemistryReactionEngine;
      case 'wave': return WaveOpticsEngine;
      case 'biology': return BiologyEngine;
      default: return KinematicsEngine;
    }
  }, [lab.engineType]);

  const currentIndex = curriculumData.findIndex(l => l.id === lab.id);
  const prevLab = currentIndex > 0 ? curriculumData[currentIndex - 1] : null;
  const nextLab = currentIndex < curriculumData.length - 1 ? curriculumData[currentIndex + 1] : null;

  const badgeColor = lab.subject === 'Physics' ? 'bg-blue-100 text-blue-800' : lab.subject === 'Chemistry' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800';
  const iconColor = lab.subject === 'Physics' ? 'text-blue-600' : lab.subject === 'Chemistry' ? 'text-teal-600' : 'text-purple-600';
  const chartColor = lab.subject === 'Physics' ? '#2563eb' : lab.subject === 'Chemistry' ? '#0d9488' : '#9333ea';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-20 flex flex-wrap justify-between gap-4 items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex items-center gap-1 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Theory
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${badgeColor}`}>#{String(lab.id).padStart(3, '0')} {lab.subject}</span>
          <h1 className="text-base md:text-lg font-bold text-gray-900 m-0">{lab.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          {prevLab && (
            <button onClick={() => onNavigateLab(prevLab.id)} className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center gap-1" title={prevLab.title}>
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
          )}
          {nextLab && (
            <button onClick={() => onNavigateLab(nextLab.id)} className="px-2.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center gap-1" title={nextLab.title}>
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="h-[360px] md:h-[430px] w-full bg-white rounded-xl shadow-sm p-2 border border-gray-200">
            <EngineComponent 
              lab={lab}
              variables={variables} 
              setVariables={setVariables}
              setChartData={setChartData} 
              isPlaying={isPlaying} 
              setIsPlaying={setIsPlaying}
              resetSignal={resetSignal}
            />
          </div>

          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2 m-0">
                  <Activity className={`w-5 h-5 ${iconColor}`} /> Experimental Control Variables
                </h2>
                <p className="text-xs text-gray-500 m-0 mt-0.5 font-mono">{lab.formula}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                    isPlaying ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm border border-gray-200">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lab.engineConfig.variables.map(v => {
                const currentVal = variables[v.id] ?? v.defaultValue;
                return (
                  <div key={v.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50/70">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">{v.label}</label>
                      <span className={`text-sm font-mono font-bold ${iconColor}`}>{currentVal} {v.unit}</span>
                    </div>
                    <input 
                      type="range" min={v.min} max={v.max} step={v.step} value={currentVal} 
                      onChange={(e) => setVariables(prev => ({ ...prev, [v.id]: parseFloat(e.target.value) }))} 
                      className="w-full h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer accent-blue-600" 
                    />
                    <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-1">
                      <span>{v.min} {v.unit}</span>
                      <span>{v.max} {v.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 h-[340px] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800 m-0">Real-Time Telemetry Graph</h2>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                {isPlaying ? 'LIVE STREAM' : 'PAUSED'}
              </span>
            </div>
            <div className="flex-1 w-full min-h-0 bg-gray-50/70 rounded-lg p-2 border border-gray-200">
              <NativeLineChart 
                data={chartData} 
                xAxisLabel={lab.engineConfig.chartTitles.x} 
                yAxisLabel={lab.engineConfig.chartTitles.y} 
                color={chartColor} 
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 flex-1 shadow-sm flex flex-col min-h-[230px]">
            <h2 className="text-base font-bold text-gray-800 mb-2 pb-2 border-b border-gray-100">Competency & Lab Notes</h2>
            <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 mb-3">
              <strong>Competency:</strong> {lab.competency}
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Record experimental data and observations here..."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// DASHBOARD CATALOG WITH 300 LABS, ENGINE FILTER & PAGINATION / SHOW-ALL
// ============================================================================
const Dashboard = ({ onSelectLab }: { onSelectLab: (id: number, directToLab?: boolean) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'All'>('All');
  const [engineFilter, setEngineFilter] = useState<EngineType | 'All'>('All');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 48;

  const filteredLabs = useMemo(() => {
    return curriculumData.filter(lab => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        lab.title.toLowerCase().includes(q) || 
        lab.lesson.toLowerCase().includes(q) ||
        lab.subMode.toLowerCase().includes(q) ||
        String(lab.id).padStart(3, '0').includes(q);
      const matchesSubject = subjectFilter === 'All' || lab.subject === subjectFilter;
      const matchesEngine = engineFilter === 'All' || lab.engineType === engineFilter;
      return matchesSearch && matchesSubject && matchesEngine;
    });
  }, [searchTerm, subjectFilter, engineFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, subjectFilter, engineFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLabs.length / itemsPerPage));
  const displayedLabs = showAll ? filteredLabs : filteredLabs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-8 text-center pt-4">
        <div className="inline-flex items-center justify-center px-5 py-2.5 bg-white rounded-full mb-4 shadow-sm border border-gray-200 gap-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <FlaskConical className="w-5 h-5 text-teal-600" />
          <Globe className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 border-l border-gray-200 pl-3">
            Complete 300-Lab Curriculum Edition
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 px-4 leading-tight">
          GiOLab: Curriculum-Aligned Virtual Laboratory for Sciences
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto px-4">
          Explore <strong>300 interactive virtual laboratories</strong> (100 Physics, 100 Chemistry, and 100 General Science) powered by 27 specialized mathematical simulation sub-modes.
        </p>
      </header>

      {/* Sticky Filter & Search Control Bar */}
      <div className="max-w-7xl mx-auto sticky top-3 z-30 mb-6">
        <div className="bg-white/95 backdrop-blur p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-center">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search #001-#300, title, unit, formula..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {([
              { id: 'All', label: 'All (300)' },
              { id: 'Physics', label: 'Physics (100)' },
              { id: 'Chemistry', label: 'Chemistry (100)' },
              { id: 'General Science', label: 'General Science (100)' }
            ] as const).map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setSubjectFilter(tab.id)} 
                className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all border ${
                  subjectFilter === tab.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <select
              value={engineFilter}
              onChange={(e) => setEngineFilter(e.target.value as EngineType | 'All')}
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="All">All 6 Engines</option>
              <option value="kinematics">Kinematics & Orbit Engine</option>
              <option value="circuit">Circuit & Machine Engine</option>
              <option value="particle">Particle, Thermo & Earth</option>
              <option value="reaction">Chemistry Reaction Engine</option>
              <option value="wave">Wave, Optics & Spectra</option>
              <option value="biology">Biology & Ecology Engine</option>
            </select>

            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1 whitespace-nowrap ${
                showAll ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {showAll ? 'Paginate (48)' : `Show All (${filteredLabs.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedLabs.map((lab) => (
            <div 
              key={lab.id} 
              onClick={() => onSelectLab(lab.id, false)} 
              className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md hover:border-blue-300 flex flex-col h-full"
            >
              <div className="h-32 relative overflow-hidden bg-gray-100 border-b border-gray-200">
                <SimulationThumbnail subject={lab.subject} engineType={lab.engineType} />
                <div className="absolute top-2.5 left-2.5">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                    lab.subject === 'Physics' ? 'bg-blue-100 text-blue-800' : lab.subject === 'Chemistry' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {lab.subject}
                  </div>
                </div>
                <div className="absolute top-2.5 right-2.5 text-[10px] font-mono font-bold text-gray-800 bg-white/95 px-2 py-0.5 rounded shadow-sm">
                  #{String(lab.id).padStart(3, '0')}
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded truncate max-w-[70%]">
                    {lab.formula.split('  |  ')[0]}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-white/90 bg-white/20 backdrop-blur px-1.5 py-0.5 rounded">
                    {lab.subMode}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="text-[11px] font-semibold text-gray-400 mb-0.5">{lab.lesson}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {lab.title}
                </h3>
                <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-1 leading-relaxed">
                  {lab.competency}
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-500 hover:text-gray-800">Theory & Guide</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLab(lab.id, true);
                    }}
                    className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                      lab.subject === 'Physics' 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                        : lab.subject === 'Chemistry' 
                          ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' 
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    Launch Lab <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {!showAll && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              Previous Page
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setPage(idx + 1); window.scrollTo(0, 0); }}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-colors ${
                  page === idx + 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              Next Page
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

// ============================================================================
// MAIN APP ENTRY
// ============================================================================
export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'discussion' | 'lab'>('dashboard');
  const [activeLabId, setActiveLabId] = useState<number | null>(null);

  const activeLab = curriculumData.find(l => l.id === activeLabId);

  const handleSelectLab = (id: number, directToLab = false) => {
    setActiveLabId(id);
    setCurrentView(directToLab ? 'lab' : 'discussion');
    window.scrollTo(0, 0);
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard onSelectLab={handleSelectLab} />
      )}
      {currentView === 'discussion' && activeLab && (
        <LabDiscussion 
          lab={activeLab} 
          onStart={() => { setCurrentView('lab'); window.scrollTo(0, 0); }} 
          onBack={() => { setCurrentView('dashboard'); setActiveLabId(null); window.scrollTo(0, 0); }}
          onNavigateLab={(id) => handleSelectLab(id, false)}
        />
      )}
      {currentView === 'lab' && activeLab && (
        <LabWorkspace 
          lab={activeLab} 
          onBack={() => { setCurrentView('discussion'); window.scrollTo(0, 0); }}
          onNavigateLab={(id) => handleSelectLab(id, true)}
        />
      )}
    </>
  );
}