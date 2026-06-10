// Additional questions to pad each scenario's exit ticket to exactly 5 questions.
// This preserves the original scenarioData.jsx while ensuring academic rigor.

export const ADDITIONAL_QUESTIONS = {
  water_contamination: [
    {
      question: 'What is the primary source of nitrate contamination in groundwater near agricultural areas?',
      options: [
        { id: 'A', text: 'Industrial exhaust fumes', correct: false },
        { id: 'B', text: 'Runoff of nitrogen-based fertilizers', correct: true },
        { id: 'C', text: 'Decaying plastic waste', correct: false },
        { id: 'D', text: 'Natural mineral dissolution', correct: false }
      ]
    },
    {
      question: 'Which of the following processes is effective at removing dissolved nitrates from drinking water?',
      options: [
        { id: 'A', text: 'Boiling the water', correct: false },
        { id: 'B', text: 'Coarse sand filtration', correct: false },
        { id: 'C', text: 'Reverse osmosis or ion exchange', correct: true },
        { id: 'D', text: 'Aeration', correct: false }
      ]
    },
    {
      question: 'What health condition is linked to high nitrate consumption in infants (commonly called "blue baby syndrome")?',
      options: [
        { id: 'A', text: 'Dehydration', correct: false },
        { id: 'B', text: 'Methemoglobinemia', correct: true },
        { id: 'C', text: 'Fluorosis', correct: false },
        { id: 'D', text: 'Lead poisoning', correct: false }
      ]
    }
  ],
  reaction_gone_wrong: [
    {
      question: 'What is a runaway reaction in industrial chemistry?',
      options: [
        { id: 'A', text: 'A reaction that yields no products', correct: false },
        { id: 'B', text: 'An uncontrolled acceleration of a reaction due to heat buildup', correct: true },
        { id: 'C', text: 'A reaction that proceeds at absolute zero', correct: false },
        { id: 'D', text: 'A reaction that cannot be stopped by any inhibitor', correct: false }
      ]
    },
    {
      question: 'How does an increase in temperature affect the rate of an exothermic reaction?',
      options: [
        { id: 'A', text: 'It always slows it down', correct: false },
        { id: 'B', text: 'It increases collision frequency and energy, accelerating the rate', correct: true },
        { id: 'C', text: 'It has no effect on the rate', correct: false },
        { id: 'D', text: 'It decreases the activation energy', correct: false }
      ]
    },
    {
      question: 'Which device is commonly used to prevent over-pressurization during a runaway reaction?',
      options: [
        { id: 'A', text: 'A catalyst bed', correct: false },
        { id: 'B', text: 'A rupture disk or safety relief valve', correct: true },
        { id: 'C', text: 'A heat exchanger bypass', correct: false },
        { id: 'D', text: 'An agitator speed controller', correct: false }
      ]
    }
  ],
  acid_rain: [
    {
      question: 'Which fossil fuel pollutant is the primary precursor to sulfuric acid formation in the atmosphere?',
      options: [
        { id: 'A', text: 'Carbon monoxide', correct: false },
        { id: 'B', text: 'Sulfur dioxide (SO₂)', correct: true },
        { id: 'C', text: 'Methane (CH₄)', correct: false },
        { id: 'D', text: 'Lead particulates', correct: false }
      ]
    },
    {
      question: 'How does acid rain affect soil chemistry and plant health?',
      options: [
        { id: 'A', text: 'It increases soil pH, making it highly alkaline', correct: false },
        { id: 'B', text: 'It leaches vital nutrients like calcium and releases toxic aluminum', correct: true },
        { id: 'C', text: 'It increases nitrogen fixation rates', correct: false },
        { id: 'D', text: 'It has no effect on soil nutrients', correct: false }
      ]
    },
    {
      question: 'What is the chemical composition of limestone used to neutralize acidic lakes?',
      options: [
        { id: 'A', text: 'Calcium carbonate (CaCO₃)', correct: true },
        { id: 'B', text: 'Sodium chloride (NaCl)', correct: false },
        { id: 'C', text: 'Silicon dioxide (SiO₂)', correct: false },
        { id: 'D', text: 'Magnesium sulfate (MgSO₄)', correct: false }
      ]
    }
  ],
  mutation_dilemma: [
    {
      question: 'If a genetic disease is autosomal recessive, what genotype must an individual have to express the disease?',
      options: [
        { id: 'A', text: 'Heterozygous (Aa)', correct: false },
        { id: 'B', text: 'Homozygous dominant (AA)', correct: false },
        { id: 'C', text: 'Homozygous recessive (aa)', correct: true },
        { id: 'D', text: 'Hemizygous (A-)', correct: false }
      ]
    },
    {
      question: 'What is the primary purpose of Preimplantation Genetic Diagnosis (PGD)?',
      options: [
        { id: 'A', text: 'To cure genetic mutations in adult patients', correct: false },
        { id: 'B', text: 'To screen embryos created via IVF for specific genetic conditions', correct: true },
        { id: 'C', text: 'To modify the DNA sequence of a developing fetus', correct: false },
        { id: 'D', text: 'To estimate the age of a pregnant woman\'s eggs', correct: false }
      ]
    },
    {
      question: 'What is the probability that two carrier parents (Aa) will have a child who is also a carrier (Aa)?',
      options: [
        { id: 'A', text: '25%', correct: false },
        { id: 'B', text: '50%', correct: true },
        { id: 'C', text: '75%', correct: false },
        { id: 'D', text: '100%', correct: false }
      ]
    }
  ],
  reaction_time: [
    {
      question: 'Which part of the nervous system is responsible for processing sensory input and coordinating a motor response?',
      options: [
        { id: 'A', text: 'Peripheral sensory receptors', correct: false },
        { id: 'B', text: 'The Central Nervous System (Brain and Spinal Cord)', correct: true },
        { id: 'C', text: 'Autonomic endocrine glands', correct: false },
        { id: 'D', text: 'Somatic muscle fibers', correct: false }
      ]
    },
    {
      question: 'How does sleep deprivation affect synaptic transmission and reaction time?',
      options: [
        { id: 'A', text: 'It speeds up neurotransmitter release', correct: false },
        { id: 'B', text: 'It impairs neural communication, slowing cognitive and motor responses', correct: true },
        { id: 'C', text: 'It has no biological effect on synapses', correct: false },
        { id: 'D', text: 'It increases the thickness of myelin sheaths', correct: false }
      ]
    },
    {
      question: 'In a reaction time test, what is the dependent variable?',
      options: [
        { id: 'A', text: 'The amount of sleep the athlete received', correct: false },
        { id: 'B', text: 'The time taken to respond to the stimulus', correct: true },
        { id: 'C', text: 'The volume of the auditory starter beep', correct: false },
        { id: 'D', text: 'The type of shoes the athlete wore', correct: false }
      ]
    }
  ],
  unstable_slope: [
    {
      question: 'How does water accumulation inside a slope affect its stability?',
      options: [
        { id: 'A', text: 'It increases shear strength by binding soil grains', correct: false },
        { id: 'B', text: 'It increases weight and pore water pressure, reducing friction', correct: true },
        { id: 'C', text: 'It cools the slope down, preventing thermal slides', correct: false },
        { id: 'D', text: 'It has no effect on slope stability', correct: false }
      ]
    },
    {
      question: 'Which geological feature is characterized by a rapid downward movement of rock, earth, or debris?',
      options: [
        { id: 'A', text: 'Fold mountain formation', correct: false },
        { id: 'B', text: 'Landslide or mass wasting', correct: true },
        { id: 'C', text: 'Tectonic subduction', correct: false },
        { id: 'D', text: 'Glacial retreat', correct: false }
      ]
    },
    {
      question: 'Why are steep slopes more prone to mass movement than gentle slopes?',
      options: [
        { id: 'A', text: 'Gravitational force component parallel to the slope is greater', correct: true },
        { id: 'B', text: 'They receive more rainfall on average', correct: false },
        { id: 'C', text: 'They have higher soil compaction rates', correct: false },
        { id: 'D', text: 'Wind speeds are lower on steep slopes', correct: false }
      ]
    }
  ],
  invasive_species: [
    {
      question: 'Why do invasive species often experience rapid population growth in a new ecosystem?',
      options: [
        { id: 'A', text: 'They reproduce sexually, whereas native species do not', correct: false },
        { id: 'B', text: 'They lack natural predators, competitors, or pathogens in the new area', correct: true },
        { id: 'C', text: 'They are always larger and stronger than native species', correct: false },
        { id: 'D', text: 'They feed on abiotic resources like sand and water', correct: false }
      ]
    },
    {
      question: 'Which of the following is a primary ecological risk of using chemical herbicides to control invasive water plants?',
      options: [
        { id: 'A', text: 'It might speed up water evaporation rates', correct: false },
        { id: 'B', text: 'It can poison non-target native aquatic life and contaminate water', correct: true },
        { id: 'C', text: 'It makes the water too acidic for any plant to ever grow', correct: false },
        { id: 'D', text: 'It leads to instant microplastic accumulation', correct: false }
      ]
    },
    {
      question: 'What is biological control in ecosystem conservation?',
      options: [
        { id: 'A', text: 'Draining a lake to remove all species', correct: false },
        { id: 'B', text: 'Introducing a natural predator or disease to manage pest populations', correct: true },
        { id: 'C', text: 'Genetically modifying native species to resist pests', correct: false },
        { id: 'D', text: 'Constructing physical barriers to block animal movement', correct: false }
      ]
    }
  ],
  power_grid: [
    {
      question: 'What happens to the frequency of an electrical grid when power demand exceeds generation?',
      options: [
        { id: 'A', text: 'Frequency rises above nominal levels', correct: false },
        { id: 'B', text: 'Frequency drops, risking generator damage and blackouts', correct: true },
        { id: 'C', text: 'Frequency fluctuates between AC and DC', correct: false },
        { id: 'D', text: 'Frequency remains perfectly constant due to grid resistance', correct: false }
      ]
    },
    {
      question: 'If a transmission line operates at 400,000 V and transmits 2,000 A, what is the transmitted power in Megawatts (MW)?',
      options: [
        { id: 'A', text: '200 MW', correct: false },
        { id: 'B', text: '800 MW', correct: true },
        { id: 'C', text: '1,200 MW', correct: false },
        { id: 'D', text: '2,000 MW', correct: false }
      ]
    },
    {
      question: 'What is the purpose of a "smart grid" during high-demand summer heatwaves?',
      options: [
        { id: 'A', text: 'To generate clean fossil fuels automatically', correct: false },
        { id: 'B', text: 'To dynamically balance supply and demand using real-time data', correct: true },
        { id: 'C', text: 'To shut down all power to residential areas', correct: false },
        { id: 'D', text: 'To double the voltage inside home appliances', correct: false }
      ]
    }
  ],
  heat_loss: [
    {
      question: 'Which heat transfer mechanism involves the movement of thermal energy through direct molecular collisions?',
      options: [
        { id: 'A', text: 'Convection', correct: false },
        { id: 'B', text: 'Conduction', correct: true },
        { id: 'C', text: 'Radiation', correct: false },
        { id: 'D', text: 'Advection', correct: false }
      ]
    },
    {
      question: 'Why are double-glazed windows highly effective at reducing heat loss in buildings?',
      options: [
        { id: 'A', text: 'The glass panes are twice as thick', correct: false },
        { id: 'B', text: 'The sealed air or argon gas gap between panes is a poor thermal conductor', correct: true },
        { id: 'C', text: 'They block 100% of visible solar radiation', correct: false },
        { id: 'D', text: 'They attract heat from the outside', correct: false }
      ]
    },
    {
      question: 'Which material would serve as the most effective insulator when retrofitting a roof?',
      options: [
        { id: 'A', text: 'Solid copper sheets', correct: false },
        { id: 'B', text: 'Fiberglass or mineral wool', correct: true },
        { id: 'C', text: 'Tempered glass blocks', correct: false },
        { id: 'D', text: 'Poured concrete blocks', correct: false }
      ]
    }
  ],
  oxygen_failure: [
    {
      question: 'What chemical compound is commonly used in solid "oxygen candles" to generate breathable air during life-support emergencies?',
      options: [
        { id: 'A', text: 'Sodium chloride', correct: false },
        { id: 'B', text: 'Sodium chlorate or lithium perchlorate', correct: true },
        { id: 'C', text: 'Carbon dioxide', correct: false },
        { id: 'D', text: 'Calcium carbonate', correct: false }
      ]
    },
    {
      question: 'The decomposition of hydrogen peroxide (H₂O₂) yields water and which gas?',
      options: [
        { id: 'A', text: 'Hydrogen gas (H₂)', correct: false },
        { id: 'B', text: 'Oxygen gas (O₂)', correct: true },
        { id: 'C', text: 'Nitrogen gas (N₂)', correct: false },
        { id: 'D', text: 'Carbon dioxide (CO₂)', correct: false }
      ]
    },
    {
      question: 'Which gas law explains why oxygen cylinders must be stored at high pressures to contain large masses of gas in small volumes?',
      options: [
        { id: 'A', text: 'Boyle\'s Law', correct: false },
        { id: 'B', text: 'Ideal Gas Law (PV = nRT)', correct: true },
        { id: 'C', text: 'Charles\'s Law', correct: false },
        { id: 'D', text: 'Graham\'s Law', correct: false }
      ]
    }
  ],
  aspirin_production: [
    {
      question: 'If you start with 2.0 moles of salicylic acid in a 1:1 reaction to produce aspirin, what is the theoretical yield of aspirin in moles?',
      options: [
        { id: 'A', text: '1.0 mole', correct: false },
        { id: 'B', text: '2.0 moles', correct: true },
        { id: 'C', text: '4.0 moles', correct: false },
        { id: 'D', text: '0.5 moles', correct: false }
      ]
    },
    {
      question: 'What is the molecular formula of salicylic acid, the primary reactant in aspirin synthesis?',
      options: [
        { id: 'A', text: 'C₆H₁₂O₆', correct: false },
        { id: 'B', text: 'C₇H₆O₃', correct: true },
        { id: 'C', text: 'C₉H₈O₄', correct: false },
        { id: 'D', text: 'CH₃COOH', correct: false }
      ]
    },
    {
      question: 'Why is recrystallization used during pharmaceutical aspirin synthesis?',
      options: [
        { id: 'A', text: 'To increase the speed of the reaction', correct: false },
        { id: 'B', text: 'To purify the crude product by removing unreacted salicylic acid', correct: true },
        { id: 'C', text: 'To change the color of the tablets', correct: false },
        { id: 'D', text: 'To reduce the molar mass of the product', correct: false }
      ]
    }
  ],
  fuelproduction: [
    {
      question: 'Steam methane reforming reacts methane (CH₄) and water (H₂O) to produce carbon monoxide (CO) and hydrogen (H₂). What is the balanced mole ratio of CH₄ to H₂ in this reaction?',
      options: [
        { id: 'A', text: '1:1 ratio', correct: false },
        { id: 'B', text: '1:3 ratio', correct: true },
        { id: 'C', text: '1:2 ratio', correct: false },
        { id: 'D', text: '2:3 ratio', correct: false }
      ]
    },
    {
      question: 'If a process requires 3.0 moles of methane, how many moles of steam (H₂O) are needed for complete reaction (1:1 stoichiometry)?',
      options: [
        { id: 'A', text: '1.5 moles', correct: false },
        { id: 'B', text: '3.0 moles', correct: true },
        { id: 'C', text: '6.0 moles', correct: false },
        { id: 'D', text: '9.0 moles', correct: false }
      ]
    }
  ],
  aspirin_percent_yield: [
    {
      question: 'Which of the following would cause the actual yield of a chemical product to be lower than the theoretical yield?',
      options: [
        { id: 'A', text: 'Incomplete reaction or side reactions occurring', correct: true },
        { id: 'B', text: 'The reaction going to 100% completion', correct: false },
        { id: 'C', text: 'Product containing water weight', correct: false },
        { id: 'D', text: 'Using excess reactants', correct: false }
      ]
    },
    {
      question: 'If the theoretical yield of a compound is 50.0 g and you isolate 40.0 g, what is the percent yield?',
      options: [
        { id: 'A', text: '60%', correct: false },
        { id: 'B', text: '80%', correct: true },
        { id: 'C', text: '90%', correct: false },
        { id: 'D', text: '125%', correct: false }
      ]
    },
    {
      question: 'What is the actual yield in a stoichiometry experiment?',
      options: [
        { id: 'A', text: 'The calculated amount based on the limiting reactant', correct: false },
        { id: 'B', text: 'The measured amount of product physically obtained in the lab', correct: true },
        { id: 'C', text: 'The mass of the limiting reactant used', correct: false },
        { id: 'D', text: 'The mass of the excess reactant remaining', correct: false }
      ]
    }
  ],
  gas_boyle_adnoc: [
    {
      question: 'According to Boyle\'s Law, what is the relationship between pressure and volume at constant temperature?',
      options: [
        { id: 'A', text: 'Directly proportional', correct: false },
        { id: 'B', text: 'Inversely proportional', correct: true },
        { id: 'C', text: 'Exponentially proportional', correct: false },
        { id: 'D', text: 'No mathematical relationship exists', correct: false }
      ]
    },
    {
      question: 'A sample of gas occupies 10.0 L at 1.0 atm. If the volume is decreased to 2.0 L at constant temperature, what is the new pressure?',
      options: [
        { id: 'A', text: '0.2 atm', correct: false },
        { id: 'B', text: '5.0 atm', correct: true },
        { id: 'C', text: '10.0 atm', correct: false },
        { id: 'D', text: '20.0 atm', correct: false }
      ]
    },
    {
      question: 'Which molecular behavior explains why pressure increases as gas volume decreases?',
      options: [
        { id: 'A', text: 'Gas molecules grow larger in size', correct: false },
        { id: 'B', text: 'Molecules collide more frequently with the container walls', correct: true },
        { id: 'C', text: 'Molecules slow down their average speed', correct: false },
        { id: 'D', text: 'Attractive forces between molecules increase', correct: false }
      ]
    }
  ],
  gas_charles_aviation: [
    {
      question: 'Charles\'s Law states that at constant pressure, the volume of a gas is directly proportional to its:',
      options: [
        { id: 'A', text: 'Mass in grams', correct: false },
        { id: 'B', text: 'Absolute temperature in Kelvin', correct: true },
        { id: 'C', text: 'Pressure in kilopascals', correct: false },
        { id: 'D', text: 'Density in grams per liter', correct: false }
      ]
    },
    {
      question: 'How do you convert a Celsius temperature (°C) to absolute temperature in Kelvin (K)?',
      options: [
        { id: 'A', text: 'Multiply by 1.8 and add 32', correct: false },
        { id: 'B', text: 'Add 273.15', correct: true },
        { id: 'C', text: 'Subtract 273.15', correct: false },
        { id: 'D', text: 'Divide by 100', correct: false }
      ]
    },
    {
      question: 'If a gas occupies 4.0 L at 300 K, what is its volume at 150 K under constant pressure?',
      options: [
        { id: 'A', text: '1.0 L', correct: false },
        { id: 'B', text: '2.0 L', correct: true },
        { id: 'C', text: '8.0 L', correct: false },
        { id: 'D', text: '16.0 L', correct: false }
      ]
    }
  ],
  gas_gaylussac_cylinder: [
    {
      question: 'Which gas law describes the direct relationship between pressure and absolute temperature at constant volume?',
      options: [
        { id: 'A', text: 'Gay-Lussac\'s Law', correct: true },
        { id: 'B', text: 'Boyle\'s Law', correct: false },
        { id: 'C', text: 'Charles\'s Law', correct: false },
        { id: 'D', text: 'Avogadro\'s Law', correct: false }
      ]
    },
    {
      question: 'If a gas cylinder at 300 K has a pressure of 100 kPa, what will the pressure be if it is heated to 600 K?',
      options: [
        { id: 'A', text: '50 kPa', correct: false },
        { id: 'B', text: '200 kPa', correct: true },
        { id: 'C', text: '300 kPa', correct: false },
        { id: 'D', text: '400 kPa', correct: false }
      ]
    },
    {
      question: 'Why does the pressure in a sealed rigid container rise when the temperature increases?',
      options: [
        { id: 'A', text: 'The volume of the container expands', correct: false },
        { id: 'B', text: 'Gas molecules gain kinetic energy and strike the walls with more force', correct: true },
        { id: 'C', text: 'Gas molecules multiply and increase in number', correct: false },
        { id: 'D', text: 'The density of the gas decreases', correct: false }
      ]
    }
  ]
};
