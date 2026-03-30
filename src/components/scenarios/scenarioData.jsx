// Complete scenario database for all 10 role-play scenarios

export const ROLES = {
    environmental_scientist: {
        id: 'environmental_scientist',
        title: 'Environmental Scientist',
        icon: '🌍',
        color: 'emerald',
        description: 'Protect ecosystems and public health using scientific analysis',
        difficulty: 'Beginner',
        scenarios: ['water_contamination', 'acid_rain', 'invasive_species']
    },
    biomedical_researcher: {
        id: 'biomedical_researcher',
        title: 'Biomedical Researcher',
        icon: '🧬',
        color: 'purple',
        description: 'Solve medical mysteries through genetic and biological analysis',
        difficulty: 'On-Track',
        scenarios: ['mutation_dilemma', 'reaction_time']
    },
    space_mission_chemist: {
        id: 'space_mission_chemist',
        title: 'Space Mission Chemist',
        icon: '🚀',
        color: 'blue',
        description: 'Ensure crew survival through chemical problem-solving in space',
        difficulty: 'Advanced',
        scenarios: ['oxygen_failure']
    },
    energy_engineer: {
        id: 'energy_engineer',
        title: 'Energy Engineer',
        icon: '⚡',
        color: 'amber',
        description: 'Design sustainable energy solutions for modern challenges',
        difficulty: 'On-Track',
        scenarios: ['power_grid', 'heat_loss']
    },
    industrial_chemist: {
        id: 'industrial_chemist',
        title: 'Industrial Chemist',
        icon: '🧪',
        color: 'red',
        description: 'Manage chemical processes safely in industrial settings',
        difficulty: 'On-Track',
        scenarios: ['reaction_gone_wrong']
    },
    pharmaceutical_scientist: {
        id: 'pharmaceutical_scientist',
        title: 'Pharmaceutical Scientist',
        icon: '💊',
        color: 'teal',
        description: 'Apply stoichiometry to produce life-saving medicines accurately',
        difficulty: 'Beginner',
        scenarios: ['aspirin_production']
    },
    fertilizer_engineer: {
        id: 'fertilizer_engineer',
        title: 'Stoichiometry Specialist',
        icon: '🌱',
        color: 'green',
        description: 'Optimize chemical reactions to maximize crop yield and sustainability',
        difficulty: 'On-Level',
        scenarios: ['haber_process', 'aspirin_percent_yield']
    },
    geologist: {
        id: 'geologist',
        title: 'Geologist',
        icon: '🏔️',
        color: 'orange',
        description: 'Analyze earth systems to predict and prevent natural disasters',
        difficulty: 'Beginner',
        scenarios: ['unstable_slope']
    }

};

export const SCENARIOS = {
    // ============================================
    // SCENARIO 1: Water Contamination (Environmental Chemistry)
    // ============================================
    water_contamination: {
        id: 'water_contamination',
        title: 'The Invisible Threat',
        role: 'Environmental Chemist – Water Safety Specialist',
        roleQuote: 'Your job is to protect public health using science-based decisions.',
        context: 'A small community relies on groundwater as its main source of drinking water. Recent complaints about taste and odor have raised concerns about possible contamination.',
        scienceFocus: ['Water quality', 'Solubility & concentration', 'Human impact on environment', 'Data interpretation'],
        strand: 'Chemistry',
        estimatedTime: 15,
        badge: 'Water Safety Analyst',
        badgeIcon: '💧',

        scenes: [
            {
                id: 1,
                title: 'Understanding the Problem',
                narrative: 'You receive a report from the local municipality. Residents are complaining about strange taste in their drinking water. A nearby factory has recently expanded its operations.',
                data: {
                    type: 'table_and_graph',
                    table: {
                        headers: ['Substance', 'Measured (ppm)', 'Safe Limit (ppm)'],
                        rows: [
                            ['Nitrates', '55', '50'],
                            ['Chlorides', '210', '250'],
                            ['Heavy Metals', 'Trace', '0']
                        ]
                    },
                    graphDescription: 'Bar graph showing measured vs safe levels',
                    mapNote: 'Map shows factory upstream of groundwater flow'
                },
                question: 'What is the most serious scientific concern in this situation?',
                options: [
                    { id: 'A', text: 'High chloride concentration', correct: false, feedback: 'Chloride levels are actually within safe limits.' },
                    { id: 'B', text: 'Slight change in water taste', correct: false, feedback: 'Taste changes are symptoms, not the scientific concern itself.' },
                    { id: 'C', text: 'Nitrate concentration above safe limit', correct: true, feedback: 'Correct. Elevated nitrate levels can affect human health, especially infants.' },
                    { id: 'D', text: 'Distance of factory from the town', correct: false, feedback: 'Distance alone is not the scientific concern—contamination level is.' }
                ],
                learningObjective: 'Identifying environmental risks using data'
            },
            {
                id: 2,
                title: 'The Decision Point',
                narrative: 'Further tests show the contamination may increase if no action is taken. You must recommend a course of action.',
                question: 'What should you recommend FIRST as the environmental chemist?',
                options: [
                    {
                        id: 'A',
                        text: 'Increase chemical treatment at the water plant',
                        icon: '🧪',
                        tags: ['Fast solution', 'Higher cost'],
                        consequence: 'treatment',
                        ethical: 'economic'
                    },
                    {
                        id: 'B',
                        text: 'Shut down the factory temporarily',
                        icon: '🏭',
                        tags: ['Strong impact', 'Economic consequences'],
                        consequence: 'shutdown',
                        ethical: 'environmental'
                    },
                    {
                        id: 'C',
                        text: 'Conduct further testing and monitor nitrate trends',
                        icon: '📊',
                        tags: ['Delays action', 'Improves accuracy'],
                        consequence: 'monitor',
                        ethical: 'scientific'
                    },
                    {
                        id: 'D',
                        text: 'Advise residents to boil water',
                        icon: '🚰',
                        tags: ['Public safety focus', 'Not a chemical solution'],
                        consequence: 'boil',
                        ethical: 'safety'
                    }
                ],
                justificationStarter: 'I chose this option because scientifically...',
                learningObjective: 'Applying scientific concepts and ethical reasoning'
            },
            {
                id: 3,
                title: 'Consequences & Response',
                consequences: {
                    treatment: {
                        outcome: 'Nitrate levels decrease slightly. Chemical costs increase. Public concerns remain.',
                        message: 'The treatment reduced nitrates, but long-term sustainability is questioned.',
                        newData: 'Nitrate levels: 48 ppm (within limit, but monitoring needed)'
                    },
                    shutdown: {
                        outcome: 'Nitrate levels drop significantly. 200 workers temporarily laid off. Community divided.',
                        message: 'Environmental protection achieved, but economic impact is severe.',
                        newData: 'Nitrate levels: 35 ppm. Unemployment rate increased 8%.'
                    },
                    monitor: {
                        outcome: 'Two weeks pass. Nitrate levels rise to 62 ppm. Three infants show symptoms.',
                        message: 'Delay in action led to worsening conditions.',
                        newData: 'Nitrate levels: 62 ppm. Health reports filed.'
                    },
                    boil: {
                        outcome: 'Residents feel safer but boiling does not remove nitrates. Contamination continues.',
                        message: 'Boiling water does not address dissolved chemical contaminants.',
                        newData: 'Nitrate levels unchanged at 55 ppm despite boiling advisory.'
                    }
                },
                followUpQuestion: 'What additional step should be taken to ensure long-term water safety?',
                learningObjective: 'Evaluating effectiveness of scientific solutions'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Nitrates dissolve easily in water because they are:',
                    options: [
                        { id: 'A', text: 'Insoluble salts', correct: false },
                        { id: 'B', text: 'Non-polar molecules', correct: false },
                        { id: 'C', text: 'Highly soluble ionic compounds', correct: true },
                        { id: 'D', text: 'Suspended solids', correct: false }
                    ]
                },
                {
                    question: 'Which factor most directly affects groundwater contamination from a factory?',
                    options: [
                        { id: 'A', text: 'Factory building height', correct: false },
                        { id: 'B', text: 'Direction of groundwater flow', correct: true },
                        { id: 'C', text: 'Number of employees', correct: false },
                        { id: 'D', text: 'Color of factory emissions', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How did your decision balance public health and scientific evidence?',
            transferQuestion: 'If nitrate levels were below the safe limit but increasing rapidly, would your decision change? Why?'
        }
    },

    // ============================================
    // SCENARIO 2: Reaction Gone Wrong (Industrial Chemistry)
    // ============================================
    reaction_gone_wrong: {
        id: 'reaction_gone_wrong',
        title: 'The Reaction Gone Wrong',
        role: 'Industrial Chemist – Process Safety Specialist',
        roleQuote: 'Your expertise prevents disasters and keeps workers safe.',
        context: 'A chemical manufacturing plant is producing a new batch of industrial solvent. During the reaction, temperature readings spike unexpectedly and warning alarms trigger.',
        scienceFocus: ['Exothermic reactions', 'Reaction rates', 'Safety protocols', 'Temperature control'],
        strand: 'Chemistry',
        estimatedTime: 14,
        badge: 'Process Safety Expert',
        badgeIcon: '🛡️',

        scenes: [
            {
                id: 1,
                title: 'Identifying the Crisis',
                narrative: 'Alarms blare across the facility. The main reactor vessel shows temperature rising from 80°C to 120°C in just 5 minutes. The reaction should plateau at 90°C.',
                data: {
                    type: 'graph_and_readings',
                    readings: [
                        { time: '0 min', temp: '80°C', pressure: 'Normal' },
                        { time: '2 min', temp: '95°C', pressure: 'Elevated' },
                        { time: '5 min', temp: '120°C', pressure: 'Critical' }
                    ],
                    graphDescription: 'Temperature curve showing exponential rise instead of expected plateau'
                },
                question: 'What is the most likely cause of this runaway reaction?',
                options: [
                    { id: 'A', text: 'The reactor is too small for the batch size', correct: false, feedback: 'Reactor size affects capacity but not reaction rate directly.' },
                    { id: 'B', text: 'Cooling system failure preventing heat removal', correct: true, feedback: 'Correct! Without cooling, exothermic reactions can become runaway reactions.' },
                    { id: 'C', text: 'Wrong color indicator in the mixture', correct: false, feedback: 'Color indicators don\'t affect reaction rates.' },
                    { id: 'D', text: 'Workers added chemicals too slowly', correct: false, feedback: 'Slow addition typically reduces, not increases, reaction rate.' }
                ],
                learningObjective: 'Understanding exothermic reactions and heat transfer'
            },
            {
                id: 2,
                title: 'Emergency Response',
                narrative: 'Temperature continues rising. You have 3 minutes to make a decision before the reactor reaches critical pressure.',
                question: 'What is the safest immediate action?',
                options: [
                    {
                        id: 'A',
                        text: 'Add more reactants to dilute the mixture',
                        icon: '🧪',
                        tags: ['Counterintuitive', 'Risk of acceleration'],
                        consequence: 'add_reactants',
                        ethical: 'risky'
                    },
                    {
                        id: 'B',
                        text: 'Emergency vent to release pressure',
                        icon: '💨',
                        tags: ['Releases fumes', 'Reduces explosion risk'],
                        consequence: 'vent',
                        ethical: 'environmental'
                    },
                    {
                        id: 'C',
                        text: 'Inject cold water directly into reactor',
                        icon: '❄️',
                        tags: ['Rapid cooling', 'Thermal shock risk'],
                        consequence: 'cold_water',
                        ethical: 'technical'
                    },
                    {
                        id: 'D',
                        text: 'Activate emergency quench system with inhibitor',
                        icon: '🛑',
                        tags: ['Stops reaction', 'Batch loss'],
                        consequence: 'quench',
                        ethical: 'safety'
                    }
                ],
                justificationStarter: 'This action is safest because chemically...',
                learningObjective: 'Applying knowledge of reaction control'
            },
            {
                id: 3,
                title: 'Aftermath Analysis',
                consequences: {
                    add_reactants: {
                        outcome: 'Temperature spikes to 180°C. Emergency evacuation triggered. Minor injuries reported.',
                        message: 'Adding reactants provided more fuel for the exothermic reaction.',
                        newData: 'Incident report filed. Facility closed for 2 weeks.'
                    },
                    vent: {
                        outcome: 'Pressure reduced. Some toxic fumes released. Environmental agency notified.',
                        message: 'Venting prevented explosion but created environmental incident.',
                        newData: 'Air quality monitors show temporary spike. Fine likely.'
                    },
                    cold_water: {
                        outcome: 'Thermal shock causes reactor lining crack. Controlled leak begins.',
                        message: 'Rapid temperature change damaged equipment but reaction slowed.',
                        newData: 'Repair cost: $500,000. Production delayed 1 month.'
                    },
                    quench: {
                        outcome: 'Reaction stopped completely. Batch lost ($50,000) but no injuries or releases.',
                        message: 'Chemical inhibitor neutralized the reaction safely.',
                        newData: 'Safety record maintained. Process review initiated.'
                    }
                },
                followUpQuestion: 'What process change would prevent this situation in future batches?',
                learningObjective: 'Evaluating safety vs. economic trade-offs'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'In an exothermic reaction, heat is:',
                    options: [
                        { id: 'A', text: 'Absorbed from surroundings', correct: false },
                        { id: 'B', text: 'Released to surroundings', correct: true },
                        { id: 'C', text: 'Neither absorbed nor released', correct: false },
                        { id: 'D', text: 'Converted to sound energy', correct: false }
                    ]
                },
                {
                    question: 'A runaway reaction can be prevented by:',
                    options: [
                        { id: 'A', text: 'Increasing reactant concentration', correct: false },
                        { id: 'B', text: 'Removing the cooling system', correct: false },
                        { id: 'C', text: 'Controlling temperature and using inhibitors', correct: true },
                        { id: 'D', text: 'Adding catalysts to speed up the reaction', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'What role does understanding reaction kinetics play in industrial safety?',
            transferQuestion: 'If the same reaction was endothermic instead of exothermic, how would your emergency response differ?'
        }
    },

    // ============================================
    // SCENARIO 3: Acid Rain Alert (Environmental Chemistry)
    // ============================================
    acid_rain: {
        id: 'acid_rain',
        title: 'Acid Rain Alert',
        role: 'Environmental Scientist – Air Quality Analyst',
        roleQuote: 'You monitor the invisible threats in our atmosphere.',
        context: 'A region downwind from industrial areas reports dying forests and corroded statues. Fish populations in local lakes are declining rapidly.',
        scienceFocus: ['pH and acidity', 'Atmospheric chemistry', 'Ecosystem impact', 'Pollution sources'],
        strand: 'Chemistry',
        estimatedTime: 13,
        badge: 'Atmosphere Guardian',
        badgeIcon: '🌧️',

        scenes: [
            {
                id: 1,
                title: 'Analyzing the Evidence',
                narrative: 'Your monitoring station detects unusual readings. Local farmers report crop damage with unusual leaf patterns.',
                data: {
                    type: 'table_and_map',
                    table: {
                        headers: ['Location', 'Rainfall pH', 'Normal pH', 'SO₂ levels (ppb)'],
                        rows: [
                            ['Forest Zone A', '4.2', '5.6', '85'],
                            ['Lake District', '4.5', '5.6', '72'],
                            ['Urban Area', '5.1', '5.6', '45'],
                            ['Control Site', '5.5', '5.6', '12']
                        ]
                    },
                    mapNote: 'Wind patterns show prevailing winds from industrial zone toward affected areas'
                },
                question: 'Which data point most clearly indicates acid rain damage?',
                options: [
                    { id: 'A', text: 'Urban area pH of 5.1', correct: false, feedback: 'This is slightly acidic but close to normal range.' },
                    { id: 'B', text: 'Forest Zone A pH of 4.2 with high SO₂', correct: true, feedback: 'Correct! pH 4.2 is significantly acidic, and high SO₂ indicates pollution source.' },
                    { id: 'C', text: 'Control site pH of 5.5', correct: false, feedback: 'The control site shows normal conditions.' },
                    { id: 'D', text: 'Wind direction from industrial zone', correct: false, feedback: 'Wind direction explains distribution but isn\'t the damage indicator itself.' }
                ],
                learningObjective: 'Interpreting pH data and pollution patterns'
            },
            {
                id: 2,
                title: 'Recommending Action',
                narrative: 'Your report goes to policymakers. They need a scientific recommendation that balances environmental protection with economic reality.',
                question: 'What is your primary recommendation?',
                options: [
                    {
                        id: 'A',
                        text: 'Mandate scrubbers on all industrial smokestacks',
                        icon: '🏭',
                        tags: ['High cost', 'Long-term solution'],
                        consequence: 'scrubbers',
                        ethical: 'environmental'
                    },
                    {
                        id: 'B',
                        text: 'Add limestone to affected lakes to neutralize acid',
                        icon: '�ite',
                        tags: ['Treats symptoms', 'Ongoing expense'],
                        consequence: 'limestone',
                        ethical: 'reactive'
                    },
                    {
                        id: 'C',
                        text: 'Relocate affected communities',
                        icon: '🏘️',
                        tags: ['Extreme measure', 'Social disruption'],
                        consequence: 'relocate',
                        ethical: 'avoidance'
                    },
                    {
                        id: 'D',
                        text: 'Implement emissions trading with gradual reduction targets',
                        icon: '📈',
                        tags: ['Market-based', 'Slower change'],
                        consequence: 'trading',
                        ethical: 'economic'
                    }
                ],
                justificationStarter: 'This recommendation addresses acid rain because...',
                learningObjective: 'Connecting chemistry to policy solutions'
            },
            {
                id: 3,
                title: 'Long-term Outcomes',
                consequences: {
                    scrubbers: {
                        outcome: 'SO₂ emissions drop 80% in 2 years. Industries report $2B in installation costs. Forest recovery begins.',
                        message: 'Direct source control is most effective but expensive.',
                        newData: 'pH levels recovering: Forest Zone A now 5.0'
                    },
                    limestone: {
                        outcome: 'Lake pH temporarily improves. Fish return briefly. Without addressing source, damage continues.',
                        message: 'Treating symptoms without addressing causes requires perpetual intervention.',
                        newData: 'Annual limestone cost: $5M. SO₂ levels unchanged.'
                    },
                    relocate: {
                        outcome: 'Massive public backlash. Legal challenges. Pollution problem remains and spreads to new areas.',
                        message: 'Running from pollution doesn\'t solve the chemistry of the problem.',
                        newData: 'Affected area expanded by 40% over 5 years.'
                    },
                    trading: {
                        outcome: 'Emissions decrease 30% over 5 years. Some companies buy credits instead of reducing. Mixed results.',
                        message: 'Market solutions work but may be too slow for ecological timelines.',
                        newData: 'pH improvement: 4.2 → 4.8 (still damaging)'
                    }
                },
                followUpQuestion: 'Why is preventing SO₂ emissions more effective than neutralizing acid rain after it falls?',
                learningObjective: 'Understanding prevention vs. treatment in environmental chemistry'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Acid rain forms primarily when these gases dissolve in water:',
                    options: [
                        { id: 'A', text: 'Oxygen and nitrogen', correct: false },
                        { id: 'B', text: 'Sulfur dioxide and nitrogen oxides', correct: true },
                        { id: 'C', text: 'Carbon dioxide only', correct: false },
                        { id: 'D', text: 'Methane and hydrogen', correct: false }
                    ]
                },
                {
                    question: 'A pH of 4.2 compared to normal rain (pH 5.6) is approximately:',
                    options: [
                        { id: 'A', text: 'Slightly more acidic', correct: false },
                        { id: 'B', text: '25 times more acidic', correct: true },
                        { id: 'C', text: 'Less acidic', correct: false },
                        { id: 'D', text: 'The same acidity', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How does understanding pH help you make better environmental decisions?',
            transferQuestion: 'If acid rain was caused by natural volcanic emissions instead of factories, how would your recommendations change?'
        }
    },

    // ============================================
    // SCENARIO 4: Mutation Dilemma (Genetics/Biology)
    // ============================================
    mutation_dilemma: {
        id: 'mutation_dilemma',
        title: 'The Mutation Dilemma',
        role: 'Genetic Counselor',
        roleQuote: 'You help families navigate the complex world of genetic information.',
        context: 'A couple seeking to start a family has come to you after learning they both carry a gene variant associated with a rare genetic condition.',
        scienceFocus: ['Inheritance patterns', 'Genetic probability', 'Ethical considerations', 'DNA and mutations'],
        strand: 'Biology',
        estimatedTime: 15,
        badge: 'Genetic Guide',
        badgeIcon: '🧬',

        scenes: [
            {
                id: 1,
                title: 'Understanding the Genetics',
                narrative: 'The genetic test results show both parents are heterozygous carriers (Aa) for an autosomal recessive condition. You need to explain the inheritance pattern.',
                data: {
                    type: 'punnett_square',
                    parent1: 'Aa',
                    parent2: 'Aa',
                    outcomes: [
                        { genotype: 'AA', phenotype: 'Unaffected (not carrier)', probability: '25%' },
                        { genotype: 'Aa', phenotype: 'Carrier (unaffected)', probability: '50%' },
                        { genotype: 'aa', phenotype: 'Affected', probability: '25%' }
                    ]
                },
                question: 'What is the probability that their child will be affected by this condition?',
                options: [
                    { id: 'A', text: '0% - both parents are healthy', correct: false, feedback: 'Carriers can pass on the recessive allele even if they are healthy.' },
                    { id: 'B', text: '25% - one in four chance', correct: true, feedback: 'Correct! When both parents are Aa, there is a 1/4 chance of aa offspring.' },
                    { id: 'C', text: '50% - half will be affected', correct: false, feedback: '50% will be carriers, but only 25% will be affected.' },
                    { id: 'D', text: '75% - most children will be affected', correct: false, feedback: 'Actually, 75% will be unaffected (AA or Aa).' }
                ],
                learningObjective: 'Calculating genetic probability using Punnett squares'
            },
            {
                id: 2,
                title: 'Counseling Decisions',
                narrative: 'The couple is distressed and asks for your guidance. They want to have biological children but are concerned about the risk.',
                question: 'What counseling approach do you recommend?',
                options: [
                    {
                        id: 'A',
                        text: 'Recommend they not have children to avoid the risk',
                        icon: '🚫',
                        tags: ['Eliminates risk', 'Personal choice removed'],
                        consequence: 'no_children',
                        ethical: 'paternalistic'
                    },
                    {
                        id: 'B',
                        text: 'Explain options including IVF with genetic testing',
                        icon: '🔬',
                        tags: ['Informed choice', 'Additional cost'],
                        consequence: 'ivf_pgd',
                        ethical: 'autonomy'
                    },
                    {
                        id: 'C',
                        text: 'Suggest they adopt instead',
                        icon: '👨‍👩‍👧',
                        tags: ['Alternative path', 'Avoids genetic risk'],
                        consequence: 'adoption',
                        ethical: 'alternative'
                    },
                    {
                        id: 'D',
                        text: 'Present all information neutrally and let them decide',
                        icon: '📋',
                        tags: ['Full autonomy', 'No guidance'],
                        consequence: 'neutral',
                        ethical: 'non-directive'
                    }
                ],
                justificationStarter: 'This counseling approach is appropriate because ethically...',
                learningObjective: 'Balancing scientific information with ethical counseling'
            },
            {
                id: 3,
                title: 'Living with Decisions',
                consequences: {
                    no_children: {
                        outcome: 'The couple feels judged and seeks a second opinion. They later have a healthy child naturally.',
                        message: 'Removing choice from patients can damage trust and isn\'t evidence-based counseling.',
                        newData: 'Their child was genotype AA (unaffected).'
                    },
                    ivf_pgd: {
                        outcome: 'After IVF with preimplantation genetic diagnosis, they have a healthy child confirmed to be AA.',
                        message: 'Technology can help families make informed reproductive choices.',
                        newData: 'Cost: $25,000. Success after 2 cycles.'
                    },
                    adoption: {
                        outcome: 'The couple considers this but still wants biological children. They appreciate knowing all options.',
                        message: 'Presenting alternatives respects autonomy while providing options.',
                        newData: 'They eventually try naturally and have a carrier child (Aa).'
                    },
                    neutral: {
                        outcome: 'Overwhelmed by information without guidance, the couple delays decisions. Anxiety increases.',
                        message: 'Purely neutral counseling may not serve patients who need support processing information.',
                        newData: 'Follow-up shows increased stress levels and decision paralysis.'
                    }
                },
                followUpQuestion: 'How does understanding probability help families process genetic risk?',
                learningObjective: 'Connecting genetic science to real-world counseling outcomes'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'If both parents are carriers (Aa) of a recessive condition, what fraction of their children will be carriers?',
                    options: [
                        { id: 'A', text: '1/4', correct: false },
                        { id: 'B', text: '1/2', correct: true },
                        { id: 'C', text: '3/4', correct: false },
                        { id: 'D', text: 'All of them', correct: false }
                    ]
                },
                {
                    question: 'A recessive genetic condition appears when an individual is:',
                    options: [
                        { id: 'A', text: 'Heterozygous (Aa)', correct: false },
                        { id: 'B', text: 'Homozygous dominant (AA)', correct: false },
                        { id: 'C', text: 'Homozygous recessive (aa)', correct: true },
                        { id: 'D', text: 'Any genotype can show it', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How would you balance giving scientific facts with supporting emotional needs?',
            transferQuestion: 'If the condition was dominant rather than recessive, how would the probability and counseling change?'
        }
    },

    // ============================================
    // SCENARIO 5: Reaction Time Test (Sports Biology)
    // ============================================
    reaction_time: {
        id: 'reaction_time',
        title: 'The Reaction Time Test',
        role: 'Sports Scientist',
        roleQuote: 'You optimize athletic performance through understanding human physiology.',
        context: 'A professional sprinter is concerned their reaction time at the starting blocks has slowed. You need to investigate potential causes using scientific methods.',
        scienceFocus: ['Nervous system', 'Reaction time factors', 'Scientific variables', 'Data analysis'],
        strand: 'Biology',
        estimatedTime: 12,
        badge: 'Performance Analyst',
        badgeIcon: '⏱️',

        scenes: [
            {
                id: 1,
                title: 'Collecting the Data',
                narrative: 'You conduct standardized reaction time tests under different conditions. The athlete\'s baseline reaction time was 0.14 seconds (excellent for sprinters).',
                data: {
                    type: 'experiment_results',
                    baseline: '0.14s',
                    tests: [
                        { condition: 'After 8 hours sleep', result: '0.15s' },
                        { condition: 'After 5 hours sleep', result: '0.21s' },
                        { condition: 'After caffeine intake', result: '0.13s' },
                        { condition: 'After high-carb meal', result: '0.17s' },
                        { condition: 'During high stress', result: '0.19s' }
                    ]
                },
                question: 'Which factor shows the most significant negative impact on reaction time?',
                options: [
                    { id: 'A', text: 'Caffeine intake', correct: false, feedback: 'Caffeine actually improved reaction time slightly.' },
                    { id: 'B', text: 'Sleep deprivation (5 hours)', correct: true, feedback: 'Correct! Lack of sleep slowed reaction time by 50% from baseline.' },
                    { id: 'C', text: 'High-carbohydrate meal', correct: false, feedback: 'This had a minor effect compared to sleep deprivation.' },
                    { id: 'D', text: 'Normal sleep (8 hours)', correct: false, feedback: 'Normal sleep maintained near-baseline performance.' }
                ],
                learningObjective: 'Identifying variables that affect nervous system function'
            },
            {
                id: 2,
                title: 'Training Recommendation',
                narrative: 'The athlete has a major competition in 3 weeks. You need to design an intervention to optimize their reaction time.',
                question: 'What training protocol do you recommend?',
                options: [
                    {
                        id: 'A',
                        text: 'Intense daily reaction drills with minimal rest',
                        icon: '🏃',
                        tags: ['High volume', 'Fatigue risk'],
                        consequence: 'intense',
                        ethical: 'performance'
                    },
                    {
                        id: 'B',
                        text: 'Focus on sleep optimization and moderate training',
                        icon: '😴',
                        tags: ['Recovery focus', 'Evidence-based'],
                        consequence: 'sleep_focus',
                        ethical: 'holistic'
                    },
                    {
                        id: 'C',
                        text: 'Caffeine supplementation before all practices',
                        icon: '☕',
                        tags: ['Quick boost', 'Dependency risk'],
                        consequence: 'caffeine',
                        ethical: 'supplement'
                    },
                    {
                        id: 'D',
                        text: 'Meditation and stress reduction only',
                        icon: '🧘',
                        tags: ['Mental focus', 'Ignores physical'],
                        consequence: 'meditation',
                        ethical: 'mental'
                    }
                ],
                justificationStarter: 'This protocol targets the nervous system by...',
                learningObjective: 'Applying physiology knowledge to performance optimization'
            },
            {
                id: 3,
                title: 'Competition Results',
                consequences: {
                    intense: {
                        outcome: 'Athlete shows fatigue. Reaction time actually worsens to 0.18s at competition. Muscle strain develops.',
                        message: 'Overtraining impairs nervous system recovery and performance.',
                        newData: 'Finished 4th. Season ended early due to injury.'
                    },
                    sleep_focus: {
                        outcome: 'With 8-9 hours sleep nightly and moderate training, reaction time improves to 0.13s at competition.',
                        message: 'Sleep allows neural pathway consolidation and optimal neurotransmitter function.',
                        newData: 'Won gold medal. Personal best start time.'
                    },
                    caffeine: {
                        outcome: 'Initial improvements seen. By competition, tolerance developed. Reaction time: 0.16s with anxiety symptoms.',
                        message: 'Stimulant tolerance reduces effectiveness and can increase competition anxiety.',
                        newData: 'Finished 3rd. Post-race jitters reported.'
                    },
                    meditation: {
                        outcome: 'Stress reduced but reaction time unchanged at 0.15s. Physical conditioning slightly declined.',
                        message: 'Mental training helps but cannot replace physiological optimization.',
                        newData: 'Finished 2nd. Calm but not at peak physical readiness.'
                    }
                },
                followUpQuestion: 'How does sleep deprivation specifically affect neurotransmitter function and reaction time?',
                learningObjective: 'Understanding the nervous system\'s role in athletic performance'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Reaction time is primarily controlled by which body system?',
                    options: [
                        { id: 'A', text: 'Digestive system', correct: false },
                        { id: 'B', text: 'Nervous system', correct: true },
                        { id: 'C', text: 'Skeletal system', correct: false },
                        { id: 'D', text: 'Circulatory system', correct: false }
                    ]
                },
                {
                    question: 'In an experiment testing reaction time, sleep duration would be considered a:',
                    options: [
                        { id: 'A', text: 'Dependent variable', correct: false },
                        { id: 'B', text: 'Control variable', correct: false },
                        { id: 'C', text: 'Independent variable', correct: true },
                        { id: 'D', text: 'Constant', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'Why is it important to consider multiple factors when analyzing athletic performance?',
            transferQuestion: 'How would you design an experiment to test whether age affects reaction time?'
        }
    },

    // ============================================
    // SCENARIO 6: Unstable Slope (Geology)
    // ============================================
    unstable_slope: {
        id: 'unstable_slope',
        title: 'The Unstable Slope',
        role: 'Geologist – Hazard Assessment Specialist',
        roleQuote: 'You read the earth\'s warning signs to protect communities.',
        context: 'A hillside community has reported cracks appearing in the ground after recent heavy rains. Several homes are built near the slope.',
        scienceFocus: ['Mass movement', 'Rock and soil properties', 'Water and erosion', 'Risk assessment'],
        strand: 'Earth Science',
        estimatedTime: 14,
        badge: 'Earth Guardian',
        badgeIcon: '🏔️',

        scenes: [
            {
                id: 1,
                title: 'Site Assessment',
                narrative: 'You arrive at the hillside community to assess the situation. Recent rainfall has been 300% above average this month.',
                data: {
                    type: 'geological_survey',
                    observations: [
                        { feature: 'Soil type', finding: 'Clay-rich, low permeability' },
                        { feature: 'Slope angle', finding: '35° (steeper than 25° threshold)' },
                        { feature: 'Vegetation', finding: 'Recently cleared for construction' },
                        { feature: 'Crack width', finding: '5-10 cm, extending 50 meters' },
                        { feature: 'Water seepage', finding: 'Visible at base of slope' }
                    ],
                    riskNote: 'Historical records show a landslide in this area 40 years ago'
                },
                question: 'Which combination of factors creates the highest landslide risk?',
                options: [
                    { id: 'A', text: 'Slope angle and rainfall only', correct: false, feedback: 'These are factors, but you\'re missing the soil and vegetation data.' },
                    { id: 'B', text: 'Clay soil, steep slope, removed vegetation, and heavy rain', correct: true, feedback: 'Correct! Clay holds water, steep angles increase gravitational force, and vegetation removal eliminates root stability.' },
                    { id: 'C', text: 'The 40-year-old historical landslide', correct: false, feedback: 'History indicates risk but current conditions determine immediate danger.' },
                    { id: 'D', text: 'Crack width alone', correct: false, feedback: 'Cracks are symptoms—you need to understand the causes.' }
                ],
                learningObjective: 'Identifying factors contributing to mass movement'
            },
            {
                id: 2,
                title: 'Emergency Decision',
                narrative: 'Your assessment indicates high risk of imminent slope failure. 15 families live in the danger zone. Weather forecast shows more rain coming.',
                question: 'What do you recommend as the immediate priority?',
                options: [
                    {
                        id: 'A',
                        text: 'Monitor the cracks and wait for more data',
                        icon: '📊',
                        tags: ['More information', 'Potential delay'],
                        consequence: 'wait',
                        ethical: 'cautious'
                    },
                    {
                        id: 'B',
                        text: 'Evacuate all residents immediately',
                        icon: '🚨',
                        tags: ['Safety first', 'Disruption'],
                        consequence: 'evacuate',
                        ethical: 'safety'
                    },
                    {
                        id: 'C',
                        text: 'Install drainage pipes to reduce water buildup',
                        icon: '🔧',
                        tags: ['Engineering fix', 'Takes time'],
                        consequence: 'drainage',
                        ethical: 'technical'
                    },
                    {
                        id: 'D',
                        text: 'Build a retaining wall at the base',
                        icon: '🧱',
                        tags: ['Structural solution', 'Long-term project'],
                        consequence: 'wall',
                        ethical: 'engineering'
                    }
                ],
                justificationStarter: 'This action is geologically justified because...',
                learningObjective: 'Making risk-based decisions using geological evidence'
            },
            {
                id: 3,
                title: 'The Aftermath',
                consequences: {
                    wait: {
                        outcome: 'Landslide occurs 36 hours later. 3 homes destroyed. Fortunately, residents had self-evacuated.',
                        message: 'Waiting for more data when risk indicators are clear can have catastrophic consequences.',
                        newData: 'Damage: $2.5 million. Near-miss casualties.'
                    },
                    evacuate: {
                        outcome: 'Residents relocated to temporary shelter. Landslide occurs 48 hours later. No casualties. Homes damaged.',
                        message: 'Early evacuation saved lives. Property can be rebuilt, lives cannot.',
                        newData: 'All families safe. Insurance claims processed.'
                    },
                    drainage: {
                        outcome: 'Installation begins but landslide occurs during construction. Workers injured. Partial success in slowing flow.',
                        message: 'Engineering solutions take time that may not be available in emergencies.',
                        newData: '2 workers hospitalized. Drainage helped limit damage extent.'
                    },
                    wall: {
                        outcome: 'Construction impossible to complete before failure. Wall foundation undermined by slide.',
                        message: 'Long-term solutions can\'t address immediate geological hazards.',
                        newData: 'Wall collapsed. Additional debris created.'
                    }
                },
                followUpQuestion: 'How does water content in clay soil specifically increase landslide risk?',
                learningObjective: 'Understanding the relationship between water, soil, and slope stability'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Clay-rich soils increase landslide risk because they:',
                    options: [
                        { id: 'A', text: 'Drain water quickly', correct: false },
                        { id: 'B', text: 'Become slippery when saturated with water', correct: true },
                        { id: 'C', text: 'Are lighter than sandy soils', correct: false },
                        { id: 'D', text: 'Contain plant roots', correct: false }
                    ]
                },
                {
                    question: 'Vegetation on slopes reduces landslide risk by:',
                    options: [
                        { id: 'A', text: 'Making the slope look nicer', correct: false },
                        { id: 'B', text: 'Blocking rainfall completely', correct: false },
                        { id: 'C', text: 'Root systems binding soil together', correct: true },
                        { id: 'D', text: 'Adding weight to the slope', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How do you balance scientific uncertainty with the need to protect human life?',
            transferQuestion: 'Would your assessment change if the soil was sandy instead of clay? Why?'
        }
    },

    // ============================================
    // SCENARIO 7: Invasive Species Crisis (Conservation Biology)
    // ============================================
    invasive_species: {
        id: 'invasive_species',
        title: 'Invasive Species Crisis',
        role: 'Conservation Biologist',
        roleQuote: 'You protect biodiversity by understanding ecological relationships.',
        context: 'An invasive aquatic plant has been discovered in a lake ecosystem that contains several endangered native species. The invasion is spreading rapidly.',
        scienceFocus: ['Ecosystem interactions', 'Population dynamics', 'Biodiversity', 'Conservation strategies'],
        strand: 'Biology',
        estimatedTime: 14,
        badge: 'Biodiversity Defender',
        badgeIcon: '🦋',

        scenes: [
            {
                id: 1,
                title: 'Assessing the Invasion',
                narrative: 'The invasive water hyacinth has covered 20% of the lake surface in just 3 months. Native fish populations are declining.',
                data: {
                    type: 'ecosystem_data',
                    coverage: { month1: '5%', month2: '12%', month3: '20%', projected: '80% by month 6' },
                    species_impact: [
                        { species: 'Native carp', status: 'Population -40%' },
                        { species: 'Lake salamander (endangered)', status: 'Critical - breeding sites covered' },
                        { species: 'Water birds', status: 'Declining - food sources reduced' },
                        { species: 'Algae', status: 'Dying - blocked sunlight' }
                    ]
                },
                question: 'Why is the water hyacinth particularly damaging to this ecosystem?',
                options: [
                    { id: 'A', text: 'It is poisonous to fish', correct: false, feedback: 'Water hyacinth is not toxic—its damage is ecological.' },
                    { id: 'B', text: 'It blocks sunlight and oxygen, disrupting the food web', correct: true, feedback: 'Correct! Surface coverage prevents photosynthesis below and reduces dissolved oxygen.' },
                    { id: 'C', text: 'It attracts predators from outside the lake', correct: false, feedback: 'The plant itself doesn\'t attract predators.' },
                    { id: 'D', text: 'It makes the water taste bad', correct: false, feedback: 'Taste is not the ecological concern.' }
                ],
                learningObjective: 'Understanding how invasive species disrupt ecosystem balance'
            },
            {
                id: 2,
                title: 'Choosing a Control Strategy',
                narrative: 'The endangered salamander may go extinct if action isn\'t taken within 2 months. But aggressive removal could also disturb the ecosystem.',
                question: 'What control strategy do you recommend?',
                options: [
                    {
                        id: 'A',
                        text: 'Introduce a biological control agent (plant-eating insect)',
                        icon: '🐛',
                        tags: ['Natural solution', 'Unpredictable outcomes'],
                        consequence: 'biocontrol',
                        ethical: 'ecological'
                    },
                    {
                        id: 'B',
                        text: 'Chemical herbicide treatment of affected areas',
                        icon: '🧪',
                        tags: ['Fast action', 'Collateral damage risk'],
                        consequence: 'herbicide',
                        ethical: 'aggressive'
                    },
                    {
                        id: 'C',
                        text: 'Manual removal with floating barriers to contain spread',
                        icon: '🚧',
                        tags: ['Labor intensive', 'Precise control'],
                        consequence: 'manual',
                        ethical: 'careful'
                    },
                    {
                        id: 'D',
                        text: 'Drain the lake partially to expose and kill the plants',
                        icon: '💧',
                        tags: ['Drastic measure', 'Habitat destruction'],
                        consequence: 'drain',
                        ethical: 'extreme'
                    }
                ],
                justificationStarter: 'This strategy balances ecosystem protection because...',
                learningObjective: 'Evaluating conservation intervention trade-offs'
            },
            {
                id: 3,
                title: 'Ecosystem Recovery',
                consequences: {
                    biocontrol: {
                        outcome: 'Weevils successfully reduce hyacinth by 60%. However, they also damage some native water lilies.',
                        message: 'Biological control can work but introduces new variables to the ecosystem.',
                        newData: 'Salamander population stabilizing. Native lily population -20%.'
                    },
                    herbicide: {
                        outcome: 'Hyacinth eliminated quickly. Herbicide residue affects native fish reproduction. Salamander eggs damaged.',
                        message: 'Chemical solutions can cause unintended harm to non-target species.',
                        newData: 'Hyacinth gone. Fish population -25%. Salamander reproduction delayed.'
                    },
                    manual: {
                        outcome: 'Slower progress but precise removal protects native species. Salamander breeding sites cleared first.',
                        message: 'Targeted intervention allows prioritization of endangered species.',
                        newData: 'Coverage reduced to 8%. Salamander population recovering. Cost: $500,000.'
                    },
                    drain: {
                        outcome: 'Massive fish die-off. Salamanders stranded. Hyacinth regrows from seeds when refilled.',
                        message: 'Drastic measures often create worse ecological damage than the original problem.',
                        newData: 'Native fish population -70%. Salamander listed as critically endangered.'
                    }
                },
                followUpQuestion: 'Why is protecting the endangered salamander a priority over total removal of the invasive plant?',
                learningObjective: 'Understanding biodiversity conservation priorities'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Invasive species typically outcompete native species because they:',
                    options: [
                        { id: 'A', text: 'Are always larger', correct: false },
                        { id: 'B', text: 'Lack natural predators and diseases in the new environment', correct: true },
                        { id: 'C', text: 'Photosynthesize faster', correct: false },
                        { id: 'D', text: 'Are more colorful', correct: false }
                    ]
                },
                {
                    question: 'A food web describes:',
                    options: [
                        { id: 'A', text: 'What humans eat', correct: false },
                        { id: 'B', text: 'The interconnected feeding relationships in an ecosystem', correct: true },
                        { id: 'C', text: 'A single food chain', correct: false },
                        { id: 'D', text: 'Only predator-prey relationships', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How do you decide which species to prioritize when an ecosystem is under threat?',
            transferQuestion: 'If the invasive species was an animal instead of a plant, how would your control strategies differ?'
        }
    },

    // ============================================
    // SCENARIO 8: Power Grid Failure (Physics/Engineering)
    // ============================================
    power_grid: {
        id: 'power_grid',
        title: 'Power Grid Failure',
        role: 'Electrical Engineer – Grid Operations',
        roleQuote: 'You keep the lights on through understanding electrical systems.',
        context: 'A major city is experiencing rolling blackouts during a heat wave. Demand has exceeded supply, and the grid is unstable.',
        scienceFocus: ['Electrical circuits', 'Power and energy', 'Load balancing', 'Renewable integration'],
        strand: 'Physics',
        estimatedTime: 13,
        badge: 'Grid Guardian',
        badgeIcon: '⚡',

        scenes: [
            {
                id: 1,
                title: 'Diagnosing the Problem',
                narrative: 'Demand has spiked to 45,000 MW while your generation capacity is only 42,000 MW. Air conditioning use is the main driver.',
                data: {
                    type: 'grid_status',
                    demand: '45,000 MW',
                    supply: '42,000 MW',
                    deficit: '3,000 MW',
                    sources: [
                        { type: 'Natural Gas', output: '20,000 MW', status: 'Maximum' },
                        { type: 'Coal', output: '12,000 MW', status: 'Maximum' },
                        { type: 'Nuclear', output: '8,000 MW', status: 'Steady' },
                        { type: 'Solar', output: '2,000 MW', status: 'Declining (evening)' },
                        { type: 'Wind', output: '0 MW', status: 'No wind' }
                    ]
                },
                question: 'What is the primary cause of this grid crisis?',
                options: [
                    { id: 'A', text: 'Nuclear plants are not producing enough', correct: false, feedback: 'Nuclear is running at steady capacity as designed.' },
                    { id: 'B', text: 'Demand exceeds generation capacity by 3,000 MW', correct: true, feedback: 'Correct! The grid cannot supply more power than it generates.' },
                    { id: 'C', text: 'Solar power is decreasing', correct: false, feedback: 'Solar decline contributes but the core issue is total demand vs. supply.' },
                    { id: 'D', text: 'Coal plants are inefficient', correct: false, feedback: 'Coal is at maximum output—efficiency isn\'t the immediate issue.' }
                ],
                learningObjective: 'Understanding electrical power supply and demand'
            },
            {
                id: 2,
                title: 'Emergency Response',
                narrative: 'You have 30 minutes before the grid could collapse entirely, causing a complete blackout that would take days to restore.',
                question: 'What immediate action should you take?',
                options: [
                    {
                        id: 'A',
                        text: 'Implement rolling blackouts to reduce demand',
                        icon: '🔌',
                        tags: ['Controlled reduction', 'Affects some users'],
                        consequence: 'rolling',
                        ethical: 'distributed'
                    },
                    {
                        id: 'B',
                        text: 'Request emergency power from neighboring grids',
                        icon: '🔗',
                        tags: ['Imports power', 'Depends on availability'],
                        consequence: 'import',
                        ethical: 'cooperative'
                    },
                    {
                        id: 'C',
                        text: 'Broadcast public appeal to reduce AC use',
                        icon: '📢',
                        tags: ['Voluntary reduction', 'Uncertain effect'],
                        consequence: 'appeal',
                        ethical: 'voluntary'
                    },
                    {
                        id: 'D',
                        text: 'Start emergency diesel generators',
                        icon: '⛽',
                        tags: ['Quick power', 'Expensive and polluting'],
                        consequence: 'diesel',
                        ethical: 'emergency'
                    }
                ],
                justificationStarter: 'This is the best choice for grid stability because...',
                learningObjective: 'Applying physics concepts to real-world energy decisions'
            },
            {
                id: 3,
                title: 'Grid Stabilization',
                consequences: {
                    rolling: {
                        outcome: 'Blackouts rotate through neighborhoods. Demand drops to 40,000 MW. Grid stabilizes. Some residents face 2-hour outages.',
                        message: 'Controlled load shedding prevents uncontrolled cascade failure.',
                        newData: 'Grid frequency: stable at 60 Hz. No equipment damage.'
                    },
                    import: {
                        outcome: 'Neighboring state provides 2,000 MW emergency power. Combined with small reductions, grid stabilizes.',
                        message: 'Interconnected grids allow mutual support during emergencies.',
                        newData: 'Import cost: $500,000. All customers maintained.'
                    },
                    appeal: {
                        outcome: 'Only 10% reduction achieved. Grid frequency drops dangerously. Automatic systems trigger larger blackouts.',
                        message: 'Voluntary measures alone often insufficient in emergencies.',
                        newData: 'Uncontrolled blackouts affected 500,000 people for 6 hours.'
                    },
                    diesel: {
                        outcome: 'Emergency generators provide 1,500 MW. Combined with small reductions, crisis averted. Air quality decreases.',
                        message: 'Emergency backup can bridge gaps but has environmental costs.',
                        newData: 'Fuel cost: $300,000. CO2 emissions: 2,000 tons additional.'
                    }
                },
                followUpQuestion: 'How could better integration of renewable energy help prevent future grid crises?',
                learningObjective: 'Understanding the challenges of balancing electrical supply and demand'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Electrical power is calculated as:',
                    options: [
                        { id: 'A', text: 'Voltage only', correct: false },
                        { id: 'B', text: 'Current × Voltage (P = IV)', correct: true },
                        { id: 'C', text: 'Resistance × Time', correct: false },
                        { id: 'D', text: 'Energy ÷ Distance', correct: false }
                    ]
                },
                {
                    question: 'When electrical demand exceeds supply, the grid frequency:',
                    options: [
                        { id: 'A', text: 'Increases', correct: false },
                        { id: 'B', text: 'Decreases, potentially causing blackouts', correct: true },
                        { id: 'C', text: 'Stays exactly the same', correct: false },
                        { id: 'D', text: 'Doubles', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How does understanding P=IV help you make decisions about energy use?',
            transferQuestion: 'If this happened during winter instead of summer, how would the demand patterns differ?'
        }
    },

    // ============================================
    // SCENARIO 9: Heat Loss in Buildings (Energy Physics)
    // ============================================
    heat_loss: {
        id: 'heat_loss',
        title: 'Heat Loss in Buildings',
        role: 'Energy Consultant',
        roleQuote: 'You help buildings become more efficient through understanding heat transfer.',
        context: 'A historic school building has extremely high heating bills. The school board wants to reduce energy costs without damaging the historic structure.',
        scienceFocus: ['Heat transfer methods', 'Thermal conductivity', 'Energy efficiency', 'Insulation'],
        strand: 'Physics',
        estimatedTime: 12,
        badge: 'Efficiency Expert',
        badgeIcon: '🏠',

        scenes: [
            {
                id: 1,
                title: 'Thermal Investigation',
                narrative: 'You conduct a thermal audit using infrared cameras. The building loses heat through multiple pathways.',
                data: {
                    type: 'thermal_audit',
                    heatLoss: [
                        { area: 'Windows (single-pane)', percentage: '35%', method: 'Conduction + Radiation' },
                        { area: 'Roof', percentage: '25%', method: 'Conduction + Convection' },
                        { area: 'Walls', percentage: '20%', method: 'Conduction' },
                        { area: 'Floors', percentage: '10%', method: 'Conduction' },
                        { area: 'Air leaks (drafts)', percentage: '10%', method: 'Convection' }
                    ],
                    currentBill: '$45,000/year',
                    buildingAge: '120 years'
                },
                question: 'Which area should be the primary focus for reducing heat loss?',
                options: [
                    { id: 'A', text: 'Floors (10% loss)', correct: false, feedback: 'Floors contribute less to total heat loss than other areas.' },
                    { id: 'B', text: 'Windows (35% loss through conduction and radiation)', correct: true, feedback: 'Correct! Windows are the biggest heat loss pathway—addressing them has the most impact.' },
                    { id: 'C', text: 'Air leaks (10% loss)', correct: false, feedback: 'While important, air leaks are not the largest contributor.' },
                    { id: 'D', text: 'All areas equally', correct: false, feedback: 'Prioritizing the largest loss area is more efficient than spreading resources equally.' }
                ],
                learningObjective: 'Identifying heat transfer mechanisms and efficiency priorities'
            },
            {
                id: 2,
                title: 'Recommending Upgrades',
                narrative: 'The school has a budget of $100,000 for energy improvements. Historic preservation rules limit some modifications.',
                question: 'What upgrade package do you recommend?',
                options: [
                    {
                        id: 'A',
                        text: 'Replace all windows with triple-pane glass',
                        icon: '🪟',
                        tags: ['Maximum window efficiency', 'May alter historic appearance'],
                        consequence: 'new_windows',
                        ethical: 'efficiency'
                    },
                    {
                        id: 'B',
                        text: 'Add interior storm windows (preserves historic exterior)',
                        icon: '🏛️',
                        tags: ['Preserves character', 'Moderate improvement'],
                        consequence: 'storm_windows',
                        ethical: 'preservation'
                    },
                    {
                        id: 'C',
                        text: 'Blow insulation into roof and seal air leaks',
                        icon: '🧱',
                        tags: ['Hidden improvements', 'Doesn\'t address windows'],
                        consequence: 'insulation',
                        ethical: 'invisible'
                    },
                    {
                        id: 'D',
                        text: 'Install a more powerful heating system',
                        icon: '🔥',
                        tags: ['More heat output', 'Doesn\'t reduce loss'],
                        consequence: 'new_heater',
                        ethical: 'brute_force'
                    }
                ],
                justificationStarter: 'This upgrade addresses heat loss by...',
                learningObjective: 'Applying heat transfer principles to building efficiency'
            },
            {
                id: 3,
                title: 'Year-End Results',
                consequences: {
                    new_windows: {
                        outcome: 'Heat loss reduced 40%. Historic commission requires restoration of original window appearance. Additional cost: $80,000.',
                        message: 'Maximum efficiency must balance with other constraints like historic preservation.',
                        newData: 'New bill: $27,000/year. Total project cost: $180,000.'
                    },
                    storm_windows: {
                        outcome: 'Heat loss reduced 25%. Historic character preserved. Installation complete within budget.',
                        message: 'Preservation-friendly solutions can still achieve significant improvements.',
                        newData: 'New bill: $33,750/year. Savings: $11,250/year.'
                    },
                    insulation: {
                        outcome: 'Heat loss reduced 20%. Windows still major issue. Comfort improved but bills still high.',
                        message: 'Addressing secondary issues while ignoring the primary problem limits effectiveness.',
                        newData: 'New bill: $36,000/year. Windows still account for 35% of remaining loss.'
                    },
                    new_heater: {
                        outcome: 'Building warmer but bills increase to $52,000/year. Heat still escaping through same pathways.',
                        message: 'Adding more heat doesn\'t solve heat loss—it\'s like filling a leaky bucket faster.',
                        newData: 'Energy use up 15%. Carbon footprint increased.'
                    }
                },
                followUpQuestion: 'Explain why reducing heat loss is more effective than increasing heating capacity.',
                learningObjective: 'Understanding energy conservation vs. energy production'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'Heat transfers through solid materials (like walls and windows) primarily by:',
                    options: [
                        { id: 'A', text: 'Convection', correct: false },
                        { id: 'B', text: 'Conduction', correct: true },
                        { id: 'C', text: 'Radiation only', correct: false },
                        { id: 'D', text: 'Evaporation', correct: false }
                    ]
                },
                {
                    question: 'Double or triple-pane windows reduce heat loss because:',
                    options: [
                        { id: 'A', text: 'They are heavier', correct: false },
                        { id: 'B', text: 'Air gaps between panes are poor conductors of heat', correct: true },
                        { id: 'C', text: 'They absorb all the cold', correct: false },
                        { id: 'D', text: 'They block visible light', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How could understanding heat transfer help you make decisions about your own home?',
            transferQuestion: 'If this was a cooling problem instead of heating, would the same solutions work? Why or why not?'
        }
    },

    // ============================================
    // SCENARIO 11: Aspirin Production (Pharmaceutical Stoichiometry - Beginner)
    // ============================================
    aspirin_production: {
        id: 'aspirin_production',
        title: 'The Aspirin Crisis',
        role: 'Pharmaceutical Scientist – Tablet Production Specialist',
        roleQuote: 'Every gram matters. Precision in chemistry protects patient lives.',
        context: 'A pharmaceutical company must produce a batch of 1000 aspirin tablets for distribution to hospitals. Each tablet contains exactly 500 mg of aspirin (acetylsalicylic acid). A production error has occurred and the team needs your expertise.',
        scienceFocus: ['Stoichiometry basics', 'Mole concept', 'Mass relationships', 'Quality control in chemistry'],
        strand: 'Chemistry',
        estimatedTime: 14,
        badge: 'Precision Chemist',
        badgeIcon: '💊',

        scenes: [
            {
                id: 1,
                title: 'Understanding the Recipe',
                narrative: 'Your lab has been asked to produce 1000 aspirin tablets. Each tablet contains 500 mg of aspirin. The production team accidentally ordered salicylic acid (the raw material) in moles rather than grams. You need to figure out how many grams of salicylic acid they actually need.',
                data: {
                    type: 'table_and_graph',
                    table: {
                        headers: ['Substance', 'Molar Mass (g/mol)', 'Required Amount', 'Mole Ratio'],
                        rows: [
                            ['Salicylic acid (C₇H₆O₃)', '138 g/mol', '?', '1 mol'],
                            ['Acetic anhydride (C₄H₆O₃)', '102 g/mol', 'Excess', '1 mol'],
                            ['Aspirin (C₉H₈O₄)', '180 g/mol', '500 mg × 1000', '1 mol']
                        ]
                    },
                    graphDescription: 'Reaction: C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + CH₃COOH (1:1:1:1 mole ratio)',
                    mapNote: 'Each mole of salicylic acid produces exactly one mole of aspirin'
                },
                question: 'The team needs 500 g of aspirin total (1000 tablets × 0.5 g each). Using the 1:1 mole ratio, how many grams of salicylic acid are needed?',
                options: [
                    { id: 'A', text: '500 g — same mass as aspirin needed', correct: false, feedback: 'Incorrect. The mole ratio is 1:1, but the molar masses are different (138 vs 180 g/mol). You cannot use mass directly.' },
                    { id: 'B', text: '383 g — using molar mass ratio (138/180 × 500)', correct: true, feedback: 'Correct! 500 g aspirin ÷ 180 g/mol = 2.78 mol aspirin. Since ratio is 1:1, need 2.78 mol salicylic acid × 138 g/mol = 383 g.' },
                    { id: 'C', text: '650 g — using the larger molar mass', correct: false, feedback: 'Incorrect. You need to convert using the mole ratio, not just pick the larger number.' },
                    { id: 'D', text: '180 g — using aspirin molar mass directly', correct: false, feedback: 'Incorrect. 180 g/mol is aspirin\'s molar mass, not the amount of salicylic acid needed.' }
                ],
                learningObjective: 'Applying mole-to-mass conversions using stoichiometry'
            },
            {
                id: 2,
                title: 'Quality Control Crisis',
                narrative: 'The lab technician reports they only have 300 g of salicylic acid available, not 383 g. The hospital order is urgent — they need the tablets within 24 hours for a patient care programme.',
                question: 'What is the most scientifically responsible decision?',
                options: [
                    {
                        id: 'A',
                        text: 'Produce tablets with less active ingredient to meet the order quantity',
                        icon: '⚠️',
                        tags: ['Meets quantity', 'Unsafe for patients'],
                        consequence: 'underdose',
                        ethical: 'dangerous'
                    },
                    {
                        id: 'B',
                        text: 'Produce as many correct-dose tablets as possible and report the shortage',
                        icon: '✅',
                        tags: ['Scientifically accurate', 'Partial delivery'],
                        consequence: 'partial',
                        ethical: 'honest'
                    },
                    {
                        id: 'C',
                        text: 'Rush emergency order for more salicylic acid and delay production',
                        icon: '🚚',
                        tags: ['Correct quantity eventually', 'Delays patient care'],
                        consequence: 'delay',
                        ethical: 'responsible'
                    },
                    {
                        id: 'D',
                        text: 'Add a filler material to make up the tablet weight to 500 mg',
                        icon: '🧂',
                        tags: ['Correct weight', 'Wrong composition'],
                        consequence: 'filler',
                        ethical: 'deceptive'
                    }
                ],
                justificationStarter: 'I chose this option because stoichiometrically and ethically...',
                learningObjective: 'Connecting stoichiometric accuracy to real-world pharmaceutical ethics'
            },
            {
                id: 3,
                title: 'Production Outcomes',
                consequences: {
                    underdose: {
                        outcome: 'Patients receive under-dosed tablets. Three patients\' pain is inadequately managed. Regulatory agency issues a recall.',
                        message: 'Under-dosing in pharmaceuticals causes patient harm. Stoichiometric accuracy is non-negotiable.',
                        newData: 'Recall issued. Production halted. 3 patients reported insufficient pain relief.'
                    },
                    partial: {
                        outcome: 'You produce 833 correctly-dosed tablets using 300 g of salicylic acid. Hospital is informed and accepts partial delivery.',
                        message: 'Correct! 300 g ÷ 138 g/mol = 2.17 mol → 2.17 mol × 180 g/mol = 391 g aspirin → 782 tablets at 500 mg each.',
                        newData: '782 correct tablets delivered. Emergency order placed for 218 more. No patient harm.'
                    },
                    delay: {
                        outcome: 'New salicylic acid arrives in 8 hours. Full order delivered. Some patients experienced a delay in receiving medication.',
                        message: 'A small delay is better than unsafe medicine. Responsible science protects patients.',
                        newData: 'Full order of 1000 tablets delivered. Minor delay noted in care plan.'
                    },
                    filler: {
                        outcome: 'Regulatory inspection catches the filler addition. Entire batch destroyed. Company faces €500,000 fine.',
                        message: 'Pharmaceutical fraud is illegal and endangers lives. Stoichiometry cannot be "cheated".',
                        newData: 'Batch destroyed. Production license suspended. Criminal investigation opened.'
                    }
                },
                followUpQuestion: 'If the mole ratio for a different reaction was 2:1 (reactant:product), how would your calculation change?',
                learningObjective: 'Understanding how stoichiometric errors directly impact real-world outcomes'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'The synthesis of aspirin uses a 1:1 mole ratio of salicylic acid to aspirin. If you have 2.5 mol of salicylic acid, how many moles of aspirin can you make?',
                    options: [
                        { id: 'A', text: '1.25 mol', correct: false },
                        { id: 'B', text: '5.0 mol', correct: false },
                        { id: 'C', text: '2.5 mol', correct: true },
                        { id: 'D', text: '180 mol', correct: false }
                    ]
                },
                {
                    question: 'A mole of any substance contains approximately:',
                    options: [
                        { id: 'A', text: '1000 particles', correct: false },
                        { id: 'B', text: '6.02 × 10²³ particles', correct: true },
                        { id: 'C', text: '180 particles', correct: false },
                        { id: 'D', text: 'One gram of substance', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How does understanding stoichiometry help prevent real-world errors in manufacturing?',
            transferQuestion: 'A factory needs to make 1 kg of a product with molar mass 200 g/mol. The reactant has molar mass 100 g/mol and a 1:1 ratio. How many grams of reactant are needed?'
        }
    },

    // ============================================
    // SCENARIO 12: Fuel Production Optimization (Stoichiometry - Limiting Reactant)
    // ============================================
    haber_process: {
        id: 'haber_process',
        title: 'Fuel Production Optimization',
        role: 'Fuel Blending Engineer at ADNOC Distribution',
        roleQuote: 'Your chemical calculations keep Abu Dhabi moving.',
        context: 'You are a fuel blending engineer at ADNOC Distribution. A large shipment of premium fuel additive is needed for stations across Abu Dhabi before a busy holiday weekend. One key additive is produced by reacting sulfur with oxygen to form sulfur dioxide.',
        scienceFocus: ['Mole-to-mole conversions', 'Mass-to-mass conversions', 'Balanced chemical equations', 'Limiting reactant'],
        strand: 'Chemistry',
        estimatedTime: 17,
        badge: 'ADNOC Fuel Process Specialist',
        badgeIcon: '⛽',

        scenes: [
            {
                id: 1,
                title: 'Emergency Fuel Order',
                narrative: 'A large shipment of premium fuel additive is needed before a busy holiday weekend. The reaction used is: S + O₂ → SO₂. You have 64 g of sulfur and 64 g of oxygen gas available. Your first task is to convert these masses into moles.',
                data: {
                    type: 'table_and_graph',
                    table: {
                        headers: ['Substance', 'Role', 'Mass Available', 'Molar Mass'],
                        rows: [
                            ['Sulfur (S)', 'Reactant', '64 g', '32 g/mol'],
                            ['Oxygen gas (O₂)', 'Reactant', '64 g', '32 g/mol'],
                            ['Sulfur dioxide (SO₂)', 'Product', '—', '64 g/mol'],
                        ]
                    },
                    graphDescription: 'S + O₂ → SO₂  |  1 mol S reacts with 1 mol O₂ to produce 1 mol SO₂',
                    mapNote: 'Moles = Mass ÷ Molar Mass. For S: 64 g ÷ 32 g/mol = 2 mol'
                },
                question: 'Convert the given masses into moles. How many moles of each reactant do you have?',
                options: [
                    { id: 'A', text: '64 g S = 1 mol,  64 g O₂ = 1 mol', correct: false, feedback: 'Check your calculation: moles = mass ÷ molar mass. For S: 64 ÷ 32 = 2 mol, not 1 mol.' },
                    { id: 'B', text: '64 g S = 2 mol,  64 g O₂ = 2 mol', correct: true, feedback: 'Correct! 64 ÷ 32 = 2 mol for each. You have 2 mol of sulfur and 2 mol of oxygen.' },
                    { id: 'C', text: '64 g S = 2 mol,  64 g O₂ = 1 mol', correct: false, feedback: 'The molar mass of O₂ is 32 g/mol, so 64 ÷ 32 = 2 mol, not 1 mol.' },
                    { id: 'D', text: '64 g S = 1 mol,  64 g O₂ = 2 mol', correct: false, feedback: 'The molar mass of S is 32 g/mol, so 64 ÷ 32 = 2 mol, not 1 mol.' },
                ],
                learningObjective: 'Converting mass to moles using the formula: moles = mass ÷ molar mass'
            },
            {
                id: 2,
                title: 'Which Reactant Runs Out First?',
                narrative: 'The balanced equation shows a 1:1 mole ratio: 1 mol S + 1 mol O₂ → 1 mol SO₂. The operations manager asks whether one reactant will run out before the other. Getting this wrong could cause the plant to over-order materials or under-produce the additive.',
                question: 'Based on the balanced equation and your mole calculations, which substance is the limiting reactant?',
                options: [
                    {
                        id: 'A',
                        text: 'Sulfur — it will run out first',
                        icon: '🔴',
                        tags: ['Incorrect', 'Both are equal'],
                        consequence: 'sulfur',
                        ethical: 'incorrect'
                    },
                    {
                        id: 'B',
                        text: 'Oxygen — it will run out first',
                        icon: '🔴',
                        tags: ['Incorrect', 'Both are equal'],
                        consequence: 'oxygen',
                        ethical: 'incorrect'
                    },
                    {
                        id: 'C',
                        text: 'Neither — both are used completely (1:1 ratio, 2 mol each)',
                        icon: '✅',
                        tags: ['Correct mole ratio', 'No limiting reactant'],
                        consequence: 'neither',
                        ethical: 'correct'
                    },
                    {
                        id: 'D',
                        text: 'Sulfur dioxide — it is produced in limited amounts',
                        icon: '🔴',
                        tags: ['SO₂ is the product', 'Not a reactant'],
                        consequence: 'so2',
                        ethical: 'incorrect'
                    }
                ],
                justificationStarter: 'Based on the balanced equation, the mole ratio between sulfur and oxygen is…',
                learningObjective: 'Identifying the limiting reactant using mole ratios from a balanced equation'
            },
            {
                id: 3,
                title: 'Predicting Production — Reduced Supply',
                narrative: 'A delivery problem occurs. Now only 32 g of oxygen gas is available while sulfur remains at 64 g. You must identify the new limiting reactant and calculate exactly how much SO₂ can still be produced.',
                consequences: {
                    neither: {
                        outcome: 'With 2 mol S and 2 mol O₂ and a 1:1 ratio, both reactants are fully consumed. Mass of SO₂ = 2 mol × 64 g/mol = 128 g. The production team confirms the full batch and the holiday supply is secured.',
                        message: 'Step 1: Both reactants = 2 mol each. Step 2: 1:1 ratio → 2 mol SO₂ formed. Step 3: 2 × 64 = 128 g SO₂. No waste, no shortage.',
                        newData: 'SO₂ produced: 128 g. Full batch completed. All Abu Dhabi stations supplied on time.'
                    },
                    sulfur: {
                        outcome: 'Incorrectly identifying sulfur as limiting caused the team to discard 32 g of usable oxygen. The batch was undersized and two stations ran short.',
                        message: 'With 2 mol S and 2 mol O₂, neither is limiting. Always compare available moles against the required ratio before deciding.',
                        newData: 'Batch undersized by 64 g SO₂. Two stations experienced supply delays.'
                    },
                    oxygen: {
                        outcome: 'Incorrectly identifying oxygen as limiting caused the team to order more O₂ unnecessarily, wasting budget. The actual batch size was correct.',
                        message: 'Both reactants were available in equal moles (2 mol each) matching the 1:1 ratio. No single reactant was limiting.',
                        newData: 'Unnecessary O₂ order placed. AED 4,000 wasted. Inventory audit requested.'
                    },
                    so2: {
                        outcome: 'SO₂ is the product of the reaction, not a reactant. It cannot be a limiting reactant. The production calculation was skipped and the batch was delayed.',
                        message: 'The limiting reactant is always one of the starting materials (reactants), never the product. Review the balanced equation carefully.',
                        newData: 'Production delayed 3 hours. Manager requested stoichiometry re-training for the team.'
                    }
                },
                followUpQuestion: 'If only 32 g of oxygen gas were available instead of 64 g, which reactant would now be limiting and how much SO₂ would be produced?',
                learningObjective: 'Performing a complete mass-to-mass stoichiometric calculation using the limiting reactant'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'In a chemical reaction, what does the limiting reactant determine?',
                    options: [
                        { id: 'A', text: 'The color of the product', correct: false },
                        { id: 'B', text: 'The amount of product formed', correct: true },
                        { id: 'C', text: 'The reaction temperature', correct: false },
                        { id: 'D', text: 'The number of reactants', correct: false },
                    ]
                },
                {
                    question: 'A reaction uses 96 g of sulfur (M = 32 g/mol) and 64 g of oxygen (M = 32 g/mol). Which is the limiting reactant?',
                    options: [
                        { id: 'A', text: 'Sulfur — because its mass is larger', correct: false },
                        { id: 'B', text: 'Oxygen — because it provides fewer moles (2 mol vs 3 mol)', correct: true },
                        { id: 'C', text: 'Neither — both masses are similar', correct: false },
                        { id: 'D', text: 'Sulfur dioxide — it is produced in limited amounts', correct: false },
                    ]
                }
            ],
            reflectionPrompt: 'Why is it important for engineers at ADNOC Distribution to know which reactant is limiting before starting a production batch?',
            transferQuestion: 'A reaction uses 96 g of sulfur and 64 g of oxygen gas. (1) Convert each to moles. (2) Identify the limiting reactant. (3) Calculate the mass of sulfur dioxide produced.'
        }
    },

    // ============================================
    // SCENARIO 13: Aspirin Percent Yield (UAE Pharmaceutical - Stoichiometry Specialist)
    // ============================================
    aspirin_percent_yield: {
        id: 'aspirin_percent_yield',
        title: 'The Efficiency Report',
        role: 'Chemical Process Engineer – Pharmaceutical Quality Control',
        roleQuote: 'In a UAE pharmaceutical plant, every percentage point of yield counts.',
        context: 'You are a chemical process engineer at a pharmaceutical company in the UAE producing Aspirin (Acetylsalicylic Acid) — a widely used pain reliever. The factory has completed a production run and needs you to evaluate the reaction efficiency before the next batch.',
        scienceFocus: ['Percent yield', 'Theoretical vs actual yield', 'Stoichiometry', 'Quality control in pharmaceutical production'],
        strand: 'Chemistry',
        estimatedTime: 12,
        badge: 'Efficiency Analyst',
        badgeIcon: '📊',

        scenes: [
            {
                id: 1,
                title: 'Understanding Yield',
                narrative: 'The factory has completed its aspirin production run. The chemical reaction used is: Salicylic acid + Acetic anhydride → Aspirin + Acetic acid. Your team used 138 g of salicylic acid. Based on stoichiometric calculations, the theoretical yield of aspirin is 180 g. After production, the team collected only 135 g of aspirin.',
                data: {
                    type: 'table_and_graph',
                    table: {
                        headers: ['Quantity', 'Value'],
                        rows: [
                            ['Mass of salicylic acid used', '138 g'],
                            ['Theoretical yield of aspirin', '180 g'],
                            ['Actual yield collected', '135 g'],
                            ['Chemical equation', 'C₇H₆O₃ + C₄H₆O₃ → C₉H₈O₄ + CH₃COOH']
                        ]
                    },
                    graphDescription: 'Salicylic acid + Acetic anhydride → Aspirin + Acetic acid (1:1:1:1 mole ratio)',
                    mapNote: '138 g of salicylic acid (MW 138 g/mol) = 1 mol → produces 1 mol aspirin (MW 180 g/mol) = 180 g theoretical yield'
                },
                question: 'What does the theoretical yield of 180 g represent in this process?',
                options: [
                    { id: 'A', text: 'The amount of product actually collected', correct: false, feedback: 'That describes the actual yield (135 g), not the theoretical yield.' },
                    { id: 'B', text: 'The maximum amount of product expected from the reaction', correct: true, feedback: 'Correct! The theoretical yield is the maximum amount of product that can be formed based on the balanced equation and given reactants.' },
                    { id: 'C', text: 'The leftover reactants after the reaction', correct: false, feedback: 'Leftover reactants are excess reagents, not the theoretical yield.' },
                    { id: 'D', text: 'The amount of waste produced during manufacturing', correct: false, feedback: 'Waste is a separate consideration. The theoretical yield refers to the maximum possible product.' }
                ],
                learningObjective: 'Distinguishing between theoretical yield and actual yield in a chemical reaction'
            },
            {
                id: 2,
                title: 'Evaluating Process Efficiency',
                narrative: 'The production manager notices that only 135 g of aspirin was collected — less than the expected 180 g. They ask you to evaluate how efficient the production process was so the company can report accurately to UAE pharmaceutical regulators.',
                question: 'What is the BEST way to determine how efficient the reaction was?',
                options: [
                    {
                        id: 'A',
                        text: 'Compare actual yield to theoretical yield using percent yield formula',
                        icon: '📐',
                        tags: ['Scientifically accurate', 'Industry standard'],
                        consequence: 'percent_yield',
                        ethical: 'correct'
                    },
                    {
                        id: 'B',
                        text: 'Subtract actual yield from theoretical yield only (180 − 135 = 45 g lost)',
                        icon: '➖',
                        tags: ['Shows mass lost', 'Not a measure of efficiency'],
                        consequence: 'subtraction',
                        ethical: 'incomplete'
                    },
                    {
                        id: 'C',
                        text: 'Divide theoretical yield by actual yield (180 ÷ 135)',
                        icon: '🔀',
                        tags: ['Wrong formula', 'Misleading result'],
                        consequence: 'wrong_formula',
                        ethical: 'incorrect'
                    },
                    {
                        id: 'D',
                        text: 'Ignore the difference since product was still formed',
                        icon: '🙈',
                        tags: ['No analysis done', 'Regulatory risk'],
                        consequence: 'ignore',
                        ethical: 'negligent'
                    }
                ],
                justificationStarter: 'Based on the relationship between actual and theoretical yield...',
                learningObjective: 'Selecting the correct method to calculate and communicate reaction efficiency'
            },
            {
                id: 3,
                title: 'Calculating the Percent Yield',
                consequences: {
                    percent_yield: {
                        outcome: 'You apply the percent yield formula: (135 ÷ 180) × 100 = 75%. The process is 75% efficient. You report this accurately to the production manager. The company identifies that product loss occurred during filtration and purification steps, and plans process improvements.',
                        message: 'Correct! Percent yield = (Actual Yield ÷ Theoretical Yield) × 100 = (135 ÷ 180) × 100 = 75%. This is the industry-standard measure of reaction efficiency.',
                        newData: 'Percent yield: 75%. Loss attributed to: product transfer (10%), purification step (15%). Next batch target: ≥80% yield.'
                    },
                    subtraction: {
                        outcome: 'You report that 45 g was "lost." The manager asks: "But how efficient is our process compared to others?" You cannot answer without a percent yield. The regulator flags the report as incomplete.',
                        message: 'Mass difference alone doesn\'t communicate efficiency. A 45 g loss from 180 g (75%) is very different from 45 g loss from 500 g (91%).',
                        newData: 'Regulatory report rejected — insufficient efficiency data. Rework required.'
                    },
                    wrong_formula: {
                        outcome: 'Your calculation gives 180 ÷ 135 = 1.33, or 133%. A percent yield above 100% is impossible and signals a calculation error. The quality control team flags the report immediately.',
                        message: 'Reversing the formula gives a result over 100%, which is physically impossible. Always use: (Actual ÷ Theoretical) × 100.',
                        newData: 'Report flagged for error. Credibility of analysis questioned. Re-submission required.'
                    },
                    ignore: {
                        outcome: 'You submit no efficiency analysis. The UAE Ministry of Health pharmaceutical audit finds no yield data on file. The production license is placed under review for missing quality control documentation.',
                        message: 'Pharmaceutical regulations in the UAE require yield reporting for every production batch. Ignoring data gaps violates Good Manufacturing Practice (GMP) standards.',
                        newData: 'Audit flag raised. Production license under review. Company faces AED 50,000 compliance penalty.'
                    }
                },
                followUpQuestion: 'Why is the percent yield less than 100% even when the reaction is carried out correctly?',
                learningObjective: 'Calculating percent yield and interpreting efficiency in a real pharmaceutical context'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'What does a percent yield of 100% indicate?',
                    options: [
                        { id: 'A', text: 'No reaction occurred', correct: false },
                        { id: 'B', text: 'The maximum possible product was obtained', correct: true },
                        { id: 'C', text: 'Reactants were wasted', correct: false },
                        { id: 'D', text: 'The reaction was too slow', correct: false }
                    ]
                },
                {
                    question: 'The correct formula for percent yield is:',
                    options: [
                        { id: 'A', text: '(Theoretical Yield ÷ Actual Yield) × 100', correct: false },
                        { id: 'B', text: 'Actual Yield − Theoretical Yield', correct: false },
                        { id: 'C', text: '(Actual Yield ÷ Theoretical Yield) × 100', correct: true },
                        { id: 'D', text: 'Theoretical Yield × Actual Yield', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How does percent yield help improve pharmaceutical production processes in real-world factories like those in the UAE?',
            transferQuestion: 'A reaction has a theoretical yield of 90 g and an actual yield of 72 g. Calculate the percent yield and explain what it tells you about the reaction efficiency.'
        }
    },

    // ============================================
    // SCENARIO 10: Mission Oxygen Failure (Space Science)
    // ============================================
    oxygen_failure: {
        id: 'oxygen_failure',
        title: 'Mission Oxygen Failure',
        role: 'Life-Support Engineer',
        roleQuote: 'You keep astronauts alive by mastering the chemistry of survival.',
        context: 'A spacecraft en route to Mars experiences a malfunction in the primary oxygen generation system. The crew of 4 has limited backup supplies.',
        scienceFocus: ['Chemical reactions', 'Gas laws', 'Life support systems', 'Problem-solving under pressure'],
        strand: 'Chemistry',
        estimatedTime: 15,
        badge: 'Life Support Hero',
        badgeIcon: '🚀',

        scenes: [
            {
                id: 1,
                title: 'System Failure Analysis',
                narrative: 'Warning alarms indicate the electrolysis unit (which splits water into oxygen and hydrogen) has failed. You have 72 hours of backup oxygen.',
                data: {
                    type: 'life_support_status',
                    crew: 4,
                    oxygenBackup: '72 hours at normal consumption',
                    consumption: '0.84 kg O₂/person/day',
                    waterAvailable: '200 kg (potential O₂ source)',
                    failedSystem: 'Electrolysis unit - electrode degradation',
                    distanceToEarth: '6 months (no resupply possible)'
                },
                question: 'What is the fundamental chemistry behind the normal oxygen generation system?',
                options: [
                    { id: 'A', text: 'Burning fuel to release oxygen', correct: false, feedback: 'Burning consumes oxygen, it doesn\'t produce it.' },
                    { id: 'B', text: 'Electrolysis: using electricity to split H₂O into H₂ and O₂', correct: true, feedback: 'Correct! 2H₂O → 2H₂ + O₂ is the key reaction for space life support.' },
                    { id: 'C', text: 'Filtering oxygen from the vacuum of space', correct: false, feedback: 'Space is a vacuum—there\'s no oxygen to filter.' },
                    { id: 'D', text: 'Photosynthesis from plants', correct: false, feedback: 'While used in some systems, the primary system uses electrolysis.' }
                ],
                learningObjective: 'Understanding chemical reactions in life support systems'
            },
            {
                id: 2,
                title: 'Emergency Protocol',
                narrative: 'You must decide how to extend the crew\'s survival. The ship carries various chemicals for experiments and repairs.',
                question: 'Which emergency oxygen generation method should you implement?',
                options: [
                    {
                        id: 'A',
                        text: 'Activate chemical oxygen generators (lithium perchlorate candles)',
                        icon: '🕯️',
                        tags: ['Proven technology', 'Fire hazard in pure O₂'],
                        consequence: 'candles',
                        ethical: 'emergency'
                    },
                    {
                        id: 'B',
                        text: 'Attempt repair of electrolysis unit using spare parts',
                        icon: '🔧',
                        tags: ['Best long-term', 'May not work'],
                        consequence: 'repair',
                        ethical: 'technical'
                    },
                    {
                        id: 'C',
                        text: 'Reduce crew activity to minimal levels to conserve oxygen',
                        icon: '😴',
                        tags: ['Extends supply', 'Doesn\'t generate O₂'],
                        consequence: 'conserve',
                        ethical: 'passive'
                    },
                    {
                        id: 'D',
                        text: 'Use hydrogen peroxide decomposition (2H₂O₂ → 2H₂O + O₂)',
                        icon: '🧪',
                        tags: ['Quick reaction', 'Limited supply'],
                        consequence: 'peroxide',
                        ethical: 'chemical'
                    }
                ],
                justificationStarter: 'This method generates oxygen through the chemical reaction...',
                learningObjective: 'Applying chemistry knowledge to life-or-death decisions'
            },
            {
                id: 3,
                title: 'Survival Outcome',
                consequences: {
                    candles: {
                        outcome: 'Chemical oxygen generators provide 30 days additional oxygen. One unit overheats, requiring fire suppression.',
                        message: 'Lithium perchlorate candles work but require careful handling: LiClO₄ → LiCl + 2O₂',
                        newData: 'Crew safe. Minor fire damage to one module. O₂ supply extended to 45 days total.'
                    },
                    repair: {
                        outcome: 'After 18 hours of work, electrolysis unit restored to 70% capacity. Long-term solution achieved.',
                        message: 'Repairing the root cause is ideal when possible and safe.',
                        newData: 'Mission continues. Water reserves sufficient for remainder of journey.'
                    },
                    conserve: {
                        outcome: 'Oxygen supply stretched to 96 hours. Without generation, crew faces critical situation.',
                        message: 'Conservation alone cannot solve a supply problem—generation is necessary.',
                        newData: 'Crew weakening. Secondary measures eventually required.'
                    },
                    peroxide: {
                        outcome: 'H₂O₂ decomposition provides 10 days of oxygen using catalyst. Buys time for electrolysis repair.',
                        message: 'Chemical backup systems can bridge gaps while primary systems are restored.',
                        newData: 'Crew stable. Electrolysis repair completed during peroxide operation.'
                    }
                },
                followUpQuestion: 'Write the balanced equation for water electrolysis and explain why this is ideal for spacecraft.',
                learningObjective: 'Understanding chemical equations in practical applications'
            }
        ],

        exitTicket: {
            mcqs: [
                {
                    question: 'The balanced equation for water electrolysis is:',
                    options: [
                        { id: 'A', text: 'H₂O → H + O', correct: false },
                        { id: 'B', text: '2H₂O → 2H₂ + O₂', correct: true },
                        { id: 'C', text: 'H₂O → H₂O₂', correct: false },
                        { id: 'D', text: 'H₂ + O₂ → H₂O', correct: false }
                    ]
                },
                {
                    question: 'Why is water an ideal source for oxygen generation in space?',
                    options: [
                        { id: 'A', text: 'It is lighter than air', correct: false },
                        { id: 'B', text: 'It can be recycled from crew waste and provides both drinking water and oxygen', correct: true },
                        { id: 'C', text: 'It is magnetic', correct: false },
                        { id: 'D', text: 'It glows in the dark', correct: false }
                    ]
                }
            ],
            reflectionPrompt: 'How did understanding chemistry help you make a life-saving decision?',
            transferQuestion: 'If the carbon dioxide removal system also failed, what chemical principle would you use to address it?'
        }
    }
};

export const BADGES = {
    'Water Safety Analyst': { icon: '💧', color: 'blue', description: 'Protected water quality through scientific analysis' },
    'Process Safety Expert': { icon: '🛡️', color: 'red', description: 'Managed chemical reactions safely' },
    'Atmosphere Guardian': { icon: '🌧️', color: 'purple', description: 'Defended against air pollution' },
    'Genetic Guide': { icon: '🧬', color: 'pink', description: 'Helped families understand inheritance' },
    'Performance Analyst': { icon: '⏱️', color: 'orange', description: 'Optimized athletic performance' },
    'Earth Guardian': { icon: '🏔️', color: 'amber', description: 'Protected communities from geological hazards' },
    'Biodiversity Defender': { icon: '🦋', color: 'green', description: 'Preserved ecosystem balance' },
    'Grid Guardian': { icon: '⚡', color: 'yellow', description: 'Maintained electrical infrastructure' },
    'Efficiency Expert': { icon: '🏠', color: 'teal', description: 'Reduced energy waste' },
    'Life Support Hero': { icon: '🚀', color: 'indigo', description: 'Kept astronauts alive in space' },
    'Precision Chemist': { icon: '💊', color: 'teal', description: 'Applied stoichiometry to pharmaceutical production' },
    'Conversion Specialist': { icon: '⚗️', color: 'green', description: 'Mastered mole-to-mole and mass-to-mass stoichiometric conversions' },
    'Efficiency Analyst': { icon: '📊', color: 'teal', description: 'Calculated percent yield and evaluated pharmaceutical production efficiency' },
    'Ethical Thinker': { icon: '🤔', color: 'violet', description: 'Considered ethical implications in decisions' },
    'Data Detective': { icon: '🔍', color: 'cyan', description: 'Extracted insights from scientific data' },
    'Risk Manager': { icon: '⚠️', color: 'rose', description: 'Balanced risks and benefits effectively' }
};

export const SKILLS = {
    data_analysis: { name: 'Data Analysis', icon: '📊', description: 'Interpreting graphs, tables, and measurements' },
    problem_solving: { name: 'Problem Solving', icon: '🧩', description: 'Identifying issues and finding solutions' },
    scientific_communication: { name: 'Scientific Communication', icon: '📝', description: 'Explaining reasoning clearly' },
    ethical_reasoning: { name: 'Ethical Reasoning', icon: '⚖️', description: 'Considering impacts on people and environment' },
    critical_thinking: { name: 'Critical Thinking', icon: '🎯', description: 'Evaluating evidence and making decisions' }
};