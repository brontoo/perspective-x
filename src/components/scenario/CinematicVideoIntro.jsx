import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, RotateCcw,
    AlertCircle, CheckCircle2, Subtitles, BarChart3, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScenarioVisual from './ScenarioVisual';

// Character definitions with gender
const CHARACTERS = {
    water_contamination: { name: 'Dr. Fatima Al Mazrouei', avatar: '👩‍🔬', gender: 'female' },
    reaction_gone_wrong: { name: 'Eng. Ahmed Al Hammadi', avatar: '👨‍🔬', gender: 'male' },
    acid_rain: { name: 'Dr. Mariam Al Qassimi', avatar: '👩‍🔬', gender: 'female' },
    mutation_dilemma: { name: 'Dr. Noura Al Shamsi', avatar: '👩‍⚕️', gender: 'female' },
    reaction_time: { name: 'Coach Khalid Al Mulla', avatar: '🏃', gender: 'male' },
    unstable_slope: { name: 'Dr. Sultan Al Nuaimi', avatar: '👨‍🔬', gender: 'male' },
    invasive_species: { name: 'Dr. Shaikha Al Dhaheri', avatar: '🧑‍🔬', gender: 'female' },
    power_grid: { name: 'Eng. Reem Al Falasi', avatar: '👩‍💻', gender: 'female' },
    heat_loss: { name: 'Eng. Hamad Al Ketbi', avatar: '👨‍💼', gender: 'male' },
    oxygen_failure: { name: 'Eng. Hazza Al Mansoori', avatar: '👨‍🚀', gender: 'male' },
    aspirin_production: { name: 'Dr. Aisha Al Breiki', avatar: '👩‍🔬', gender: 'female' },
    haber_process: { name: 'Eng. Saeed Al Romaithi', avatar: '👨‍🔬', gender: 'male' }
};

// Full scenario video content
const VIDEO_CONTENT = {
    water_contamination: {
        scenes: [
            { visual: 'Aerial view of Ras Al Khaimah coastline with desalination plant', narration: 'Welcome to Ras Al Khaimah. This beautiful coastal emirate, like all of the UAE, depends entirely on desalinated seawater for its freshwater supply. The Al Hamra desalination plant you see here provides clean water to over 50,000 residents.', duration: 8000, showData: false },
            { visual: 'Industrial zone expanding near the coast', narration: 'Six months ago, the Al Hamra Industrial Zone expanded its operations. New chemical manufacturing facilities now operate just 2 kilometers upstream from our primary water intake point. This proximity raises immediate concerns.', duration: 7000, showData: false },
            { visual: 'Water quality monitoring station', narration: 'Our water quality monitoring stations collect samples every 6 hours. Today readings revealed concerning results. Let me show you the data that triggered this investigation.', duration: 6000, showData: false },
            { visual: 'Data table showing water quality measurements', narration: 'Look at this water quality table. We measured three key substances. First, Nitrates: measured at 55 parts per million. The safe limit is 50 parts per million. This reading exceeds the safety threshold by 10 percent.', duration: 9000, showData: true, dataTable: { headers: ['Substance', 'Measured (ppm)', 'Safe Limit (ppm)', 'Status'], rows: [['Nitrates', '55', '50', '⚠️ Exceeded'], ['Chlorides', '210', '250', '✓ Safe'], ['Heavy Metals', 'Trace', '0', '⚠️ Detected']] } },
            { visual: 'Continued data explanation', narration: 'Second, Chlorides: measured at 210 parts per million, below the 250 ppm limit. This is within safe range. Third, Heavy Metals: we detected trace amounts. The safe limit is zero. Any detection requires investigation.', duration: 9000, showData: true, dataTable: { headers: ['Substance', 'Measured (ppm)', 'Safe Limit (ppm)', 'Status'], rows: [['Nitrates', '55', '50', '⚠️ Exceeded'], ['Chlorides', '210', '250', '✓ Safe'], ['Heavy Metals', 'Trace', '0', '⚠️ Detected']] } },
            { visual: 'Map showing water flow direction', narration: 'This map shows groundwater flow direction. The industrial zone sits upstream. Contaminants flow directly toward our intake. The science indicates the factory is the likely source. Your analysis and recommendations will determine how we protect this community.', duration: 8000, showData: false }
        ]
    },
    reaction_gone_wrong: {
        scenes: [
            { visual: 'ADNOC Ruwais petrochemical facility', narration: 'This is the ADNOC Ruwais facility in Abu Dhabi. One of the largest integrated refining and petrochemical complexes in the world. We produce industrial solvents essential for manufacturing across the globe.', duration: 7000, showData: false },
            { visual: 'Control room with monitoring screens', narration: 'I am monitoring reactor vessel 7 from the control room. This exothermic reaction produces heat during the chemical process. The cooling system normally removes this excess heat to maintain safe temperatures.', duration: 7000, showData: false },
            { visual: 'Temperature readings on display', narration: 'The reaction should stabilize at 90 degrees Celsius. But observe these readings. At time zero, temperature was normal at 80 degrees. The pressure was also normal.', duration: 6000, showData: true, dataTable: { headers: ['Time', 'Temperature (°C)', 'Pressure', 'Status'], rows: [['0 min', '80', 'Normal', '✓ Stable'], ['2 min', '95', 'Elevated', '⚠️ Warning'], ['5 min', '120', 'Critical', '🚨 Danger']] } },
            { visual: 'Escalating readings', narration: 'At 2 minutes, temperature climbed to 95 degrees with elevated pressure. Now at 5 minutes, we see 120 degrees Celsius with critical pressure. This is a 50 percent increase above safe operating limits.', duration: 8000, showData: true, dataTable: { headers: ['Time', 'Temperature (°C)', 'Pressure', 'Status'], rows: [['0 min', '80', 'Normal', '✓ Stable'], ['2 min', '95', 'Elevated', '⚠️ Warning'], ['5 min', '120', 'Critical', '🚨 Danger']] } },
            { visual: 'Diagram of runaway reaction', narration: 'This is a runaway exothermic reaction. Heat builds faster than the cooling system can remove it. Without intervention, temperature and pressure will continue rising. We have approximately 3 minutes before critical failure. Your chemistry knowledge is essential.', duration: 8000, showData: false }
        ]
    },
    acid_rain: {
        scenes: [
            { visual: 'Al Ain date palm oasis', narration: 'Al Ain, the Garden City of the UAE. These date palm groves represent thousands of years of agricultural heritage. The Al Ain oasis has been a UNESCO World Heritage site, sustaining communities across generations.', duration: 7000, showData: false },
            { visual: 'Farmers reporting damaged crops', narration: 'Local farmers have reported unusual damage to palm fronds. Yellow discoloration and weakened leaves that should remain green year-round. Our atmospheric monitoring stations detected anomalies that may explain this damage.', duration: 7000, showData: false },
            { visual: 'pH measurement equipment', narration: 'We collected rainfall samples from four locations across the region. The pH scale measures acidity: 7 is neutral, below 7 is acidic. Normal rain has a pH of approximately 5.6 due to natural carbon dioxide.', duration: 7000, showData: false },
            { visual: 'Rainfall pH data table', narration: 'Examine this data carefully. Agricultural Zone A shows pH 4.2 with sulfur dioxide at 85 parts per billion. The Oasis District: pH 4.5 with 72 ppb sulfur dioxide. Urban Area: pH 5.1 with 45 ppb. Control Site in the desert: pH 5.5 with only 12 ppb.', duration: 12000, showData: true, dataTable: { headers: ['Location', 'Rainfall pH', 'Normal pH', 'SO₂ (ppb)'], rows: [['Agricultural Zone A', '4.2', '5.6', '85'], ['Oasis District', '4.5', '5.6', '72'], ['Urban Area', '5.1', '5.6', '45'], ['Control Site (Desert)', '5.5', '5.6', '12']] } },
            { visual: 'Analysis explanation', narration: 'The pattern is clear. Areas with higher sulfur dioxide show lower pH values. Agricultural Zone A at pH 4.2 is approximately 25 times more acidic than normal rain. At this acidity level, plant tissues suffer direct chemical damage. What solution will you recommend?', duration: 9000, showData: true, dataTable: { headers: ['Location', 'Rainfall pH', 'Normal pH', 'SO₂ (ppb)'], rows: [['Agricultural Zone A', '4.2', '5.6', '85'], ['Oasis District', '4.5', '5.6', '72'], ['Urban Area', '5.1', '5.6', '45'], ['Control Site (Desert)', '5.5', '5.6', '12']] } }
        ]
    },
    mutation_dilemma: {
        scenes: [
            { visual: 'Sheikh Khalifa Medical City genetics center', narration: 'Welcome to the National Genetics Center at Sheikh Khalifa Medical City in Abu Dhabi. Here we help Emirati families understand their genetic heritage and make informed decisions about their future.', duration: 7000, showData: false },
            { visual: 'Young Emirati couple in consultation', narration: 'Today I am meeting with Omar and Layla. They are planning to start a family. However, genetic screening has revealed that both of them carry a variant for an autosomal recessive condition.', duration: 7000, showData: false },
            { visual: 'Punnett square diagram', narration: 'Let me explain the inheritance pattern using a Punnett square. When both parents are carriers, written as Aa, each parent passes one gene copy to their children. The square shows all possible combinations.', duration: 7000, showData: false },
            { visual: 'Genetic probability table', narration: 'Here are the precise probabilities. First outcome: AA genotype, meaning unaffected and not a carrier. Probability is 25 percent. Second outcome: Aa genotype, carrier like the parents but unaffected. Probability is 50 percent.', duration: 9000, showData: true, dataTable: { headers: ['Outcome', 'Genotype', 'Probability'], rows: [['Unaffected (not carrier)', 'AA', '25%'], ['Carrier (unaffected)', 'Aa', '50%'], ['Affected', 'aa', '25%']] } },
            { visual: 'Final probability explanation', narration: 'Third outcome: aa genotype, affected by the condition. Probability is 25 percent. These probabilities apply to each pregnancy independently. Omar and Layla need guidance that balances scientific facts with their emotional needs and cultural values.', duration: 9000, showData: true, dataTable: { headers: ['Outcome', 'Genotype', 'Probability'], rows: [['Unaffected (not carrier)', 'AA', '25%'], ['Carrier (unaffected)', 'Aa', '50%'], ['Affected', 'aa', '25%']] } }
        ]
    },
    reaction_time: {
        scenes: [
            { visual: 'Zayed Sports City training facility', narration: 'Welcome to the UAE National Training Center at Zayed Sports City. Here we develop world-class athletes using cutting-edge sports science. Our goal is Olympic excellence for the Emirates.', duration: 6000, showData: false },
            { visual: 'Emirati sprinter Rashid at starting blocks', narration: 'Meet Rashid, one of our most promising 100-meter sprinters. He is preparing for the Asian Games. His reaction times at the starting blocks have always been exceptional, consistently under 0.15 seconds.', duration: 7000, showData: false },
            { visual: 'Reaction time testing equipment', narration: 'Recently, Rashid performance has declined. We conducted standardized reaction time tests under controlled conditions to identify the cause. His baseline when fully rested was 0.14 seconds, which is excellent.', duration: 7000, showData: false },
            { visual: 'Test results data table', narration: 'Examine these test results carefully. After 8 hours of sleep, reaction time was 0.15 seconds, a 7 percent increase from baseline. After only 5 hours of sleep, reaction time jumped to 0.21 seconds. That is a 50 percent increase, extremely significant.', duration: 10000, showData: true, dataTable: { headers: ['Condition', 'Reaction Time', 'Change from Baseline'], rows: [['Baseline (fully rested)', '0.14s', '—'], ['After 8 hours sleep', '0.15s', '+7%'], ['After 5 hours sleep', '0.21s', '+50%'], ['After caffeine intake', '0.13s', '-7%'], ['During high stress', '0.19s', '+36%']] } },
            { visual: 'Additional data analysis', narration: 'After caffeine, reaction time improved to 0.13 seconds, 7 percent faster than baseline. During high stress conditions, reaction time increased to 0.19 seconds, 36 percent slower. The nervous system is clearly affected by multiple factors. What training protocol will optimize his performance?', duration: 10000, showData: true, dataTable: { headers: ['Condition', 'Reaction Time', 'Change from Baseline'], rows: [['Baseline (fully rested)', '0.14s', '—'], ['After 8 hours sleep', '0.15s', '+7%'], ['After 5 hours sleep', '0.21s', '+50%'], ['After caffeine intake', '0.13s', '-7%'], ['During high stress', '0.19s', '+36%']] } }
        ]
    },
    unstable_slope: {
        scenes: [
            { visual: 'Hajar Mountains near Hatta', narration: 'The Hajar Mountains near Hatta, a geological treasure of the UAE. These ancient rock formations have stood for millions of years. Mountain communities here enjoy stunning views, but nature can present sudden challenges.', duration: 7000, showData: false },
            { visual: 'Recent heavy rainfall', narration: 'This month brought unusual weather. Rainfall measured 300 percent above average. The normally dry wadis filled with rushing water. Now residents report alarming ground changes near their homes.', duration: 6000, showData: false },
            { visual: 'Ground cracks visible', narration: 'My field survey revealed serious warning signs. These cracks in the ground measure 5 to 10 centimeters wide, extending for 50 meters along the hillside. This is not normal settling. This indicates potential slope failure.', duration: 7000, showData: false },
            { visual: 'Geological survey data', narration: 'Let me present the geological findings. Soil type: clay-rich with low drainage capacity, rated high risk. Slope angle: 35 degrees, well above the 25 degree stability threshold, rated critical risk. Vegetation: recently cleared for construction, eliminating root stabilization, high risk.', duration: 11000, showData: true, dataTable: { headers: ['Factor', 'Finding', 'Risk Level'], rows: [['Soil Type', 'Clay-rich, low drainage', 'High'], ['Slope Angle', '35° (threshold: 25°)', 'Critical'], ['Vegetation', 'Recently cleared', 'High'], ['Crack Width', '5-10 cm, extending 50m', 'Severe']] } },
            { visual: 'Risk assessment conclusion', narration: 'Crack width and extent: 5 to 10 centimeters wide across 50 meters, rated severe. Water seepage is visible at the slope base. Fifteen families live in the potential impact zone. More rain is forecast. What is your recommendation to protect these residents?', duration: 9000, showData: true, dataTable: { headers: ['Factor', 'Finding', 'Risk Level'], rows: [['Soil Type', 'Clay-rich, low drainage', 'High'], ['Slope Angle', '35° (threshold: 25°)', 'Critical'], ['Vegetation', 'Recently cleared', 'High'], ['Crack Width', '5-10 cm, extending 50m', 'Severe']] } }
        ]
    },
    invasive_species: {
        scenes: [
            { visual: 'Abu Dhabi mangrove forests', narration: 'The mangrove forests of Abu Dhabi, a critical coastal ecosystem. These trees protect our shoreline from erosion, capture carbon dioxide, and nurture marine biodiversity. For decades, conservation efforts have helped these forests thrive.', duration: 7000, showData: false },
            { visual: 'Invasive algae on water surface', narration: 'Three months ago, monitoring teams detected an invasive algae species. It likely arrived in ship ballast water discharged in our coastal waters. This organism has no natural predators in our ecosystem.', duration: 7000, showData: false },
            { visual: 'Spread progression', narration: 'The spread has been exponential. In month one, coverage was 5 percent of the water surface. Month two: 12 percent coverage. Month three: 20 percent coverage. This doubling pattern threatens to overwhelm the entire system.', duration: 8000, showData: false },
            { visual: 'Ecosystem impact data', narration: 'Examine the ecosystem impact data. Current algae coverage: 20 percent now, projected to reach 80 percent in 6 months. Native fish population: declined 40 percent, rated critical. Mangrove health: stressed condition, rated endangered if trends continue.', duration: 10000, showData: true, dataTable: { headers: ['Metric', 'Current Status', 'Projection'], rows: [['Algae Coverage', '20%', '80% in 6 months'], ['Native Fish Population', '-40%', 'Critical'], ['Mangrove Health', 'Stressed', 'Endangered'], ['Water Oxygen Levels', 'Declining', 'Dangerous']] } },
            { visual: 'Call to action', narration: 'Water oxygen levels: declining, rated dangerous for marine life. The algae blocks sunlight from underwater plants that produce oxygen through photosynthesis. The entire food web is collapsing. What conservation strategy do you recommend?', duration: 8000, showData: true, dataTable: { headers: ['Metric', 'Current Status', 'Projection'], rows: [['Algae Coverage', '20%', '80% in 6 months'], ['Native Fish Population', '-40%', 'Critical'], ['Mangrove Health', 'Stressed', 'Endangered'], ['Water Oxygen Levels', 'Declining', 'Dangerous']] } }
        ]
    },
    power_grid: {
        scenes: [
            { visual: 'Dubai skyline during heatwave', narration: 'Dubai, a city of innovation, facing an extreme summer day. The temperature has reached 48 degrees Celsius. Every air conditioning unit across the emirate operates at maximum capacity. The electrical grid is under unprecedented stress.', duration: 7000, showData: false },
            { visual: 'DEWA smart grid control room', narration: 'I am in the DEWA Smart Grid Command Center. Our screens display real-time power flow across Dubai entire electrical network. The situation is critical. Demand has exceeded our projections.', duration: 6000, showData: false },
            { visual: 'Supply and demand display', narration: 'Here are the critical numbers. Total electricity demand: 45,000 megawatts. Total generation capacity: 42,000 megawatts. The deficit: 3,000 megawatts. We cannot generate enough power to meet demand.', duration: 8000, showData: true, dataTable: { headers: ['Source', 'Output (MW)', 'Status'], rows: [['Natural Gas Plants', '20,000', 'Maximum'], ['Solar (MBR Solar Park)', '2,000', 'Declining'], ['Nuclear (Barakah)', '5,600', 'Steady'], ['Other Sources', '14,400', 'Maximum'], ['TOTAL SUPPLY', '42,000', '—'], ['TOTAL DEMAND', '45,000', '🚨 Deficit']] } },
            { visual: 'Generation breakdown', narration: 'Generation breakdown: Natural gas plants produce 20,000 megawatts at maximum output. The Mohammed bin Rashid Solar Park provides 2,000 megawatts but is declining as evening approaches. Barakah nuclear provides 5,600 megawatts steady output. All other sources: 14,400 megawatts at maximum.', duration: 11000, showData: true, dataTable: { headers: ['Source', 'Output (MW)', 'Status'], rows: [['Natural Gas Plants', '20,000', 'Maximum'], ['Solar (MBR Solar Park)', '2,000', 'Declining'], ['Nuclear (Barakah)', '5,600', 'Steady'], ['Other Sources', '14,400', 'Maximum'], ['TOTAL SUPPLY', '42,000', '—'], ['TOTAL DEMAND', '45,000', '🚨 Deficit']] } },
            { visual: 'Grid frequency warning', narration: 'When demand exceeds supply, grid frequency drops below 50 hertz. If it falls too low, automatic protection systems trigger cascading blackouts. We have 30 minutes before the grid becomes unstable. What emergency action do you recommend?', duration: 8000, showData: false }
        ]
    },
    heat_loss: {
        scenes: [
            { visual: 'Al Fahidi Historical District building', narration: 'Al Fahidi Historical District in Dubai, where heritage meets the future. This 80-year-old building preserves Emirati architectural traditions. It is being retrofitted for modern sustainability while maintaining its cultural significance.', duration: 7000, showData: false },
            { visual: 'Energy consumption data', narration: 'The building current annual cooling cost is 180,000 dirhams, approximately 45,000 US dollars. In the UAE climate, cooling consumes over 70 percent of building energy. The school board wants to reduce costs without damaging the historic structure.', duration: 8000, showData: false },
            { visual: 'Thermal imaging survey', narration: 'I conducted a thermal imaging survey. The camera detects temperature differences, showing where conditioned air escapes and where external heat enters. The brighter areas indicate heat gain. Let me show you the detailed breakdown.', duration: 7000, showData: false },
            { visual: 'Heat loss data table', narration: 'Heat gain analysis: Windows account for 35 percent of heat gain through radiation and conduction, the single largest factor. The roof accounts for 25 percent through conduction. Walls contribute 20 percent through conduction.', duration: 10000, showData: true, dataTable: { headers: ['Area', 'Heat Gain', 'Transfer Method'], rows: [['Windows (single-pane)', '35%', 'Radiation + Conduction'], ['Roof', '25%', 'Conduction'], ['Walls', '20%', 'Conduction'], ['Air Leaks', '15%', 'Convection'], ['Floor', '5%', 'Conduction']] } },
            { visual: 'Complete analysis', narration: 'Air leaks through gaps and cracks contribute 15 percent through convection. The floor contributes only 5 percent. The budget is 400,000 dirhams. Heritage regulations limit exterior modifications. How do you recommend maximizing efficiency while respecting cultural preservation?', duration: 10000, showData: true, dataTable: { headers: ['Area', 'Heat Gain', 'Transfer Method'], rows: [['Windows (single-pane)', '35%', 'Radiation + Conduction'], ['Roof', '25%', 'Conduction'], ['Walls', '20%', 'Conduction'], ['Air Leaks', '15%', 'Convection'], ['Floor', '5%', 'Conduction']] } }
        ]
    },
    aspirin_production: {
        scenes: [
            { visual: 'Pharmaceutical production facility in Abu Dhabi', narration: 'Welcome to Gulf Pharma, one of the UAE\'s leading pharmaceutical manufacturers in Abu Dhabi. This facility produces over 50 million tablets annually, supplying hospitals and clinics across the region.', duration: 7000, showData: false },
            { visual: 'Aspirin tablet production line', narration: 'Today, we must fulfill an urgent order for 1000 aspirin tablets destined for a hospital pain management programme. Each tablet must contain exactly 500 milligrams of active ingredient — acetylsalicylic acid, commonly known as aspirin.', duration: 8000, showData: false },
            { visual: 'Chemical reaction diagram on whiteboard', narration: 'Aspirin is made by reacting salicylic acid with acetic anhydride. The balanced equation shows a 1 to 1 mole ratio: one mole of salicylic acid produces one mole of aspirin. This is the foundation of our stoichiometric calculation.', duration: 8000, showData: false },
            { visual: 'Production data and inventory table', narration: 'Here is the key data you need. Aspirin has a molar mass of 180 grams per mole. Salicylic acid, our raw material, has a molar mass of 138 grams per mole. We need 500 grams of aspirin total. Because of the 1 to 1 ratio, the moles of reactant equal the moles of product.', duration: 11000, showData: true, dataTable: { headers: ['Substance', 'Molar Mass', 'Required / Available', 'Mole Ratio'], rows: [['Salicylic acid (reactant)', '138 g/mol', '? grams needed', '1 mol'], ['Acetic anhydride', '102 g/mol', 'Excess available', '1 mol'], ['Aspirin (product)', '180 g/mol', '500 g needed', '1 mol']] } },
            { visual: 'Lab technician with inventory concern', narration: 'There is a problem. Our inventory shows only 300 grams of salicylic acid, not the 383 grams that stoichiometry tells us we need. The hospital order is urgent — they need the medication within 24 hours. What is the scientifically responsible action?', duration: 10000, showData: true, dataTable: { headers: ['Substance', 'Molar Mass', 'Required / Available', 'Mole Ratio'], rows: [['Salicylic acid (reactant)', '138 g/mol', '? grams needed', '1 mol'], ['Acetic anhydride', '102 g/mol', 'Excess available', '1 mol'], ['Aspirin (product)', '180 g/mol', '500 g needed', '1 mol']] } }
        ]
    },
    haber_process: {
        scenes: [
            { visual: 'ADNOC fertilizer plant, Ruwais, UAE', narration: 'The ADNOC fertilizer complex in Ruwais is one of the largest in the Middle East. This plant uses the Haber Process to produce ammonia, the key ingredient in nitrogen fertilizer that feeds crops across the UAE and beyond.', duration: 7000, showData: false },
            { visual: 'Agricultural fields in Al Ain needing fertilizer', narration: 'Farms across Al Ain are waiting for this season\'s fertilizer supply. The planting window opens in 3 days. A supply disruption has limited our nitrogen gas stock. We must calculate exactly how much ammonia we can produce with what is available.', duration: 8000, showData: false },
            { visual: 'Chemical equation on display screen', narration: 'The Haber Process reaction is: nitrogen gas plus 3 moles of hydrogen gas produces 2 moles of ammonia. The mole ratio is 1 to 3 to 2. Understanding this ratio is essential for calculating the theoretical yield of ammonia from our available reactants.', duration: 8000, showData: false },
            { visual: 'Inventory and stoichiometry table', narration: 'Our current inventory shows 280 kilograms of nitrogen gas and 90 kilograms of hydrogen gas. Nitrogen has a molar mass of 28 grams per mole, giving us 10,000 moles. Hydrogen has a molar mass of 2 grams per mole, giving us 45,000 moles. Ammonia has a molar mass of 17 grams per mole.', duration: 12000, showData: true, dataTable: { headers: ['Reactant', 'Molar Mass', 'Available', 'Moles Available'], rows: [['Nitrogen (N₂)', '28 g/mol', '280 kg', '10,000 mol'], ['Hydrogen (H₂)', '2 g/mol', '90 kg', '45,000 mol'], ['Ammonia (NH₃)', '17 g/mol', 'Product', 'Calculate →']] } },
            { visual: 'Engineer analyzing yield data', narration: 'To identify the limiting reactant, we compare what we have to what we need. To use all 10,000 moles of nitrogen, we would need 30,000 moles of hydrogen. We have 45,000 moles, which is more than enough. But to use all 45,000 moles of hydrogen, we would need 15,000 moles of nitrogen, yet we only have 10,000. Nitrogen is our limiting reactant. The theoretical yield is 20,000 moles of ammonia. At 65 percent plant efficiency, what is our actual yield? Your calculation determines whether the farms receive their fertilizer on time.', duration: 14000, showData: true, dataTable: { headers: ['Reactant', 'Molar Mass', 'Available', 'Moles Available'], rows: [['Nitrogen (N₂)', '28 g/mol', '280 kg', '10,000 mol'], ['Hydrogen (H₂)', '2 g/mol', '90 kg', '45,000 mol'], ['Ammonia (NH₃)', '17 g/mol', 'Product', 'Calculate →']] } }
        ]
    },
    oxygen_failure: {
        scenes: [
            { visual: 'UAE spacecraft approaching Mars', narration: 'This is the Emirates Mars Crew Vehicle, the successor to the historic Hope Probe. We are 8 months into humanity first UAE-led crewed mission to Mars. Our position: 60 million kilometers from Earth. Too far for any rescue mission.', duration: 8000, showData: false },
            { visual: 'Warning alarms in spacecraft', narration: 'At 0400 hours UAE time, alarms woke the entire crew. Our primary oxygen generation system has failed. The electrolysis unit, which splits water into breathable oxygen, has stopped functioning completely.', duration: 7000, showData: false },
            { visual: 'Life support status display', narration: 'Here is our critical situation. Crew members: 4 astronauts aboard. Oxygen requirement: 0.84 kilograms per person per day. Backup oxygen supply: 72 hours remaining. After that, we cannot breathe.', duration: 8000, showData: true, dataTable: { headers: ['Parameter', 'Value', 'Status'], rows: [['Crew Members', '4', '—'], ['O₂ Need per Person/Day', '0.84 kg', '—'], ['Backup O₂ Supply', '72 hours', '⚠️ Critical'], ['Water Available', '200 kg', 'Potential O₂'], ['Distance to Earth', '60 million km', 'No rescue']] } },
            { visual: 'Chemical equation display', narration: 'Water available: 200 kilograms, which could become oxygen through chemistry. Distance to Earth: 60 million kilometers, no rescue possible. The electrolysis reaction is our lifeline: 2 H2O yields 2 H2 plus O2. Two water molecules split into hydrogen and oxygen gas.', duration: 10000, showData: true, dataTable: { headers: ['Parameter', 'Value', 'Status'], rows: [['Crew Members', '4', '—'], ['O₂ Need per Person/Day', '0.84 kg', '—'], ['Backup O₂ Supply', '72 hours', '⚠️ Critical'], ['Water Available', '200 kg', 'Potential O₂'], ['Distance to Earth', '60 million km', 'No rescue']] } },
            { visual: 'Crew reviewing emergency options', narration: 'We have water. We have chemicals from our scientific experiments. The UAE legacy in space exploration depends on what we do next. Your knowledge of chemistry could save four lives. What emergency oxygen generation method do you recommend?', duration: 8000, showData: false }
        ]
    }
};

// Voice selection based on character gender
const getGenderMatchedVoice = (character, voices) => {
    const isFemale = character?.gender === 'female';
    const arabicVoices = voices.filter(v => v.lang.includes('ar'));
    const englishVoices = voices.filter(v => v.lang.includes('en'));

    const femalePatterns = ['female', 'woman', 'zira', 'samantha', 'karen', 'moira', 'fiona', 'victoria', 'susan', 'heather'];
    const malePatterns = ['male', 'man', 'david', 'daniel', 'james', 'alex', 'tom', 'mark', 'lee', 'george'];
    const patterns = isFemale ? femalePatterns : malePatterns;

    let voice = arabicVoices.find(v => patterns.some(p => v.name.toLowerCase().includes(p)));
    if (!voice && arabicVoices.length > 0) voice = arabicVoices[0];
    if (!voice) voice = englishVoices.find(v => patterns.some(p => v.name.toLowerCase().includes(p)));
    return voice || englishVoices[0] || voices[0];
};

export default function CinematicVideoIntro({ scenarioId, onComplete, isTeacher = false }) {
    const content = VIDEO_CONTENT[scenarioId];
    const character = CHARACTERS[scenarioId];

    // Core state
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [playbackState, setPlaybackState] = useState('idle'); // idle, playing, paused, complete
    const [isMuted, setIsMuted] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [progress, setProgress] = useState(0);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voiceReady, setVoiceReady] = useState(false);
    const [error, setError] = useState(null);

    // Sentence-based subtitle segmentation
    const [subtitleSegments, setSubtitleSegments] = useState([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const segmentTimerRef = useRef(null);

    // Refs for cleanup
    const isMountedRef = useRef(true);
    const progressTimerRef = useRef(null);
    const autoAdvanceTimerRef = useRef(null);
    const sceneCompleteRef = useRef({ visual: false, narration: false });

    const scenes = content?.scenes || [];
    const currentScene = scenes[currentSceneIndex];
    const totalScenes = scenes.length;

    // ============ CLEANUP FUNCTION ============
    const stopAllPlayback = useCallback(() => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
        if (segmentTimerRef.current) { clearInterval(segmentTimerRef.current); segmentTimerRef.current = null; }
        if (autoAdvanceTimerRef.current) { clearTimeout(autoAdvanceTimerRef.current); autoAdvanceTimerRef.current = null; }
    }, []);

    // ============ MOUNT/UNMOUNT CLEANUP ============
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            stopAllPlayback();
        };
    }, [stopAllPlayback]);

    // ============ VOICE INITIALIZATION ============
    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setVoiceReady(true);
            return;
        }

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0 && isMountedRef.current) {
                const voice = getGenderMatchedVoice(character, voices);
                setSelectedVoice(voice);
                setVoiceReady(true);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Fallback if voices don't load
        const timeout = setTimeout(() => {
            if (isMountedRef.current && !voiceReady) {
                setVoiceReady(true);
            }
        }, 2000);

        return () => clearTimeout(timeout);
    }, [character, voiceReady]);

    // ============ SCENE COMPLETION HANDLER ============
    const handleSceneComplete = useCallback(() => {
        if (!isMountedRef.current) return;

        stopAllPlayback();
        setPlaybackState('complete');

        // Auto-advance after delay (students only, not on last scene)
        if (!isTeacher && currentSceneIndex < totalScenes - 1) {
            autoAdvanceTimerRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    goToNextScene();
                }
            }, 1500);
        }
    }, [currentSceneIndex, totalScenes, isTeacher, stopAllPlayback]);

    // ============ CHECK SCENE COMPLETION ============
    const checkCompletion = useCallback(() => {
        if (sceneCompleteRef.current.visual && sceneCompleteRef.current.narration) {
            handleSceneComplete();
        }
    }, [handleSceneComplete]);

    // ============ SEGMENT NARRATION INTO SHORT PHRASES ============
    const segmentNarration = (text) => {
        if (!text) return [];
        // Split on sentence endings, commas, or every ~10 words max
        const raw = text.split(/(?<=[.!?,])\s+|(?<=\w{3,})\s+(?=\w)/g);
        const segments = [];
        let current = '';
        for (const chunk of raw) {
            const candidate = current ? `${current} ${chunk}` : chunk;
            const wordCount = candidate.trim().split(/\s+/).length;
            if (wordCount > 12 && current) {
                segments.push(current.trim());
                current = chunk;
            } else {
                current = candidate;
            }
        }
        if (current.trim()) segments.push(current.trim());
        // Fallback: split every 10 words if above produced nothing useful
        if (segments.length <= 1 && text.split(/\s+/).length > 12) {
            const words = text.split(/\s+/);
            for (let i = 0; i < words.length; i += 10) {
                segments.push(words.slice(i, i + 10).join(' '));
            }
            return segments;
        }
        return segments.length ? segments : [text];
    };

    // ============ PLAY SCENE ============
    const playCurrentScene = useCallback(() => {
        if (!currentScene || !isMountedRef.current) return;

        stopAllPlayback();
        sceneCompleteRef.current = { visual: false, narration: false };
        setProgress(0);
        setCurrentSegmentIndex(0);
        setPlaybackState('playing');
        setError(null);

        const duration = currentScene.duration || 6000;
        const text = currentScene.narration || '';
        const segments = segmentNarration(text);
        setSubtitleSegments(segments);

        // Progress timer
        let elapsed = 0;
        progressTimerRef.current = setInterval(() => {
            if (!isMountedRef.current) { clearInterval(progressTimerRef.current); return; }
            elapsed += 50;
            setProgress(Math.min((elapsed / duration) * 100, 100));
            if (elapsed >= duration) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
                sceneCompleteRef.current.visual = true;
                checkCompletion();
            }
        }, 50);

        // Segment cycling — evenly spaced, synchronized to total duration
        if (segments.length > 1) {
            const segDuration = duration / segments.length;
            let segIdx = 0;
            segmentTimerRef.current = setInterval(() => {
                if (!isMountedRef.current) { clearInterval(segmentTimerRef.current); return; }
                segIdx++;
                if (segIdx >= segments.length) {
                    clearInterval(segmentTimerRef.current);
                    segmentTimerRef.current = null;
                    setCurrentSegmentIndex(segments.length - 1);
                } else {
                    setCurrentSegmentIndex(segIdx);
                }
            }, segDuration);
        }

        // Speech synthesis
        if (!isMuted && 'speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85;
            utterance.pitch = 1;
            utterance.volume = 1;
            if (selectedVoice) utterance.voice = selectedVoice;

            // Use boundary events to sync subtitles when available
            let segmentBoundaries = null;
            if (segments.length > 1) {
                let charIdx = 0;
                segmentBoundaries = segments.map(seg => {
                    const start = charIdx;
                    charIdx += seg.length + 1;
                    return start;
                });
            }

            utterance.onboundary = (e) => {
                if (!isMountedRef.current || !segmentBoundaries || e.name !== 'word') return;
                const charPos = e.charIndex;
                // Find which segment this word belongs to
                let seg = 0;
                for (let i = segmentBoundaries.length - 1; i >= 0; i--) {
                    if (charPos >= segmentBoundaries[i]) { seg = i; break; }
                }
                setCurrentSegmentIndex(seg);
            };

            utterance.onend = () => {
                if (isMountedRef.current) {
                    sceneCompleteRef.current.narration = true;
                    checkCompletion();
                }
            };
            utterance.onerror = (e) => {
                console.warn('Speech error:', e.error);
                if (isMountedRef.current) {
                    sceneCompleteRef.current.narration = true;
                    checkCompletion();
                }
            };
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => {
                if (isMountedRef.current) {
                    sceneCompleteRef.current.narration = true;
                    checkCompletion();
                }
            }, duration);
        }
    }, [currentScene, isMuted, selectedVoice, stopAllPlayback, checkCompletion]);

    // ============ NAVIGATION ============
    const handleScenarioComplete = async (sid) => {
        if (isTeacher) return;

        const pointsMap = {
            water_contamination: 40,
            reaction_gone_wrong: 50,
            acid_rain: 35,
            mutation_dilemma: 45,
            reaction_time: 30,
            unstable_slope: 40,
            invasive_species: 35,
            power_grid: 50,
            heat_loss: 35,
            aspirin_production: 45,
            haber_process: 50,
            oxygen_failure: 60,
        };

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.rpc('update_student_points', {
                p_student_id: user.id,
                p_points: pointsMap[sid] ?? 30,
            });
        } catch (e) {
            console.warn('Points update failed:', e);
        }
    };
    const goToNextScene = useCallback(() => {
        if (!isMountedRef.current) return;
        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);
        if (currentSceneIndex < totalScenes - 1) {
            setCurrentSceneIndex(prev => prev + 1);
            setPlaybackState('idle');
        } else {
            onComplete?.();
        }
    }, [currentSceneIndex, totalScenes, stopAllPlayback, onComplete]);

    const goToPrevScene = useCallback(() => {
        if (!isMountedRef.current) return;
        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(prev => prev - 1);
            setPlaybackState('idle');
        }
    }, [currentSceneIndex, stopAllPlayback]);

    const replayScene = useCallback(() => {
        if (!isMountedRef.current) return;
        stopAllPlayback();
        setSubtitleSegments([]);
        setCurrentSegmentIndex(0);
        setPlaybackState('idle');
        setTimeout(() => {
            if (isMountedRef.current) playCurrentScene();
        }, 100);
    }, [stopAllPlayback, playCurrentScene]);

    // ============ PLAY/PAUSE ============
    const togglePlayPause = useCallback(() => {
        if (playbackState === 'playing') {
            if ('speechSynthesis' in window) window.speechSynthesis.pause();
            clearInterval(progressTimerRef.current);
            clearInterval(segmentTimerRef.current);
            setPlaybackState('paused');
        } else if (playbackState === 'paused') {
            if ('speechSynthesis' in window) window.speechSynthesis.resume();
            setPlaybackState('playing');
            // Resume timers would need more complex state tracking
        } else {
            playCurrentScene();
        }
    }, [playbackState, playCurrentScene]);

    // ============ MUTE TOGGLE ============
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return !prev;
        });
    }, []);

    // ============ TEACHER SKIP ============
    const teacherSkip = useCallback(() => {
        if (!isTeacher) return;
        goToNextScene();
    }, [isTeacher, goToNextScene]);

    // ============ AUTO-START ON SCENE CHANGE ============
    useEffect(() => {
        if (voiceReady && playbackState === 'idle' && currentScene) {
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    playCurrentScene();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [voiceReady, playbackState, currentSceneIndex, playCurrentScene, currentScene]);

    // ============ RENDER ============
    if (!content || scenes.length === 0) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Scenario Not Found</p>
                <p className="text-slate-400 mb-4">Could not load scenario: {scenarioId}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                </Button>
            </div>
        );
    }

    const totalProgress = ((currentSceneIndex + progress / 100) / totalScenes) * 100;
    const canAdvance = playbackState === 'complete' || isTeacher;

    return (
        <div className="max-w-5xl mx-auto">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={
                            playbackState === 'playing' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                                playbackState === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                    playbackState === 'paused' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        'bg-slate-600 text-slate-300'
                        }>
                            {playbackState === 'playing' && <><div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse mr-1" />Playing</>}
                            {playbackState === 'complete' && <><CheckCircle2 className="w-3 h-3 mr-1" />Complete</>}
                            {playbackState === 'paused' && <><Pause className="w-3 h-3 mr-1" />Paused</>}
                            {playbackState === 'idle' && 'Ready'}
                        </Badge>

                        {isTeacher && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                Teacher Preview
                            </Badge>
                        )}
                    </div>

                    <div className="text-slate-500 text-sm">
                        Scene {currentSceneIndex + 1} / {totalScenes}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 text-sm">{error}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={replayScene} className="text-amber-400">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry
                        </Button>
                    </div>
                )}

                {/* Video Area */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSceneIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            {/* Scene location label */}
                            {currentScene?.visual && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-2 bg-slate-900/70 border-b border-slate-700/40 flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    <p className="text-xs text-slate-400 font-medium tracking-wide truncate">{currentScene.visual}</p>
                                </motion.div>
                            )}

                            {/* Central Visual Display */}
                            <div className="flex items-center justify-center p-5 sm:p-8 min-h-[260px] sm:min-h-[340px]">
                                {/* Scenario-specific illustrated visual */}
                                {!currentScene?.showData && (
                                    <ScenarioVisual
                                        scenarioId={scenarioId}
                                        sceneIndex={currentSceneIndex}
                                        showData={false}
                                        avatar={character?.avatar}
                                    />
                                )}

                                {/* Structured Data Table */}
                                {currentScene?.showData && currentScene?.dataTable && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="w-full max-w-4xl"
                                    >
                                        <div className="bg-slate-800/95 rounded-2xl p-4 sm:p-6 border-2 border-teal-500/30 shadow-2xl shadow-teal-500/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                                    <BarChart3 className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <h3 className="text-sm sm:text-base font-bold text-white">Scientific Data Analysis</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b-2 border-teal-500/30">
                                                            {currentScene.dataTable.headers?.map((h, i) => (
                                                                <th key={i} className="text-left py-2 px-3 text-teal-400 font-bold uppercase tracking-wide text-xs">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentScene.dataTable.rows?.map((row, i) => (
                                                            <motion.tr key={i}
                                                                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.12 }}
                                                            >
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className={`py-2.5 px-3 text-sm ${j === 0 ? 'text-white font-semibold' : 'text-slate-300'}`}>{cell}</td>
                                                                ))}
                                                            </motion.tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Audio waveform indicator */}
                    {!isMuted && playbackState === 'playing' && (
                        <motion.div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800/80 backdrop-blur px-2.5 py-1.5 rounded-full">
                            <Volume2 className="w-3.5 h-3.5 text-teal-400 mr-1" />
                            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                                <motion.div key={i} className="w-0.5 bg-teal-400 rounded-full"
                                    animate={{ height: [h, h + 5, h] }}
                                    transition={{ duration: 0.35, repeat: Infinity, delay: i * 0.06 }}
                                    style={{ height: h }}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Subtitle Panel — sentence-segmented, synchronized */}
                <div className="bg-slate-950/90 border-t border-slate-700/50 px-4 py-3 min-h-[80px]">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-lg flex-shrink-0 shadow-lg shadow-teal-500/20">
                            {character?.avatar || '🧑‍🔬'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-teal-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">{character?.name || 'Narrator'}</p>
                            {showSubtitles && (
                                <div className="space-y-1">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={currentSegmentIndex}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm sm:text-base text-white font-medium leading-relaxed"
                                        >
                                            {subtitleSegments[currentSegmentIndex] || currentScene?.narration?.split(/[.!?]/)[0] || ''}
                                        </motion.p>
                                    </AnimatePresence>
                                    {/* Upcoming phrase preview */}
                                    {subtitleSegments[currentSegmentIndex + 1] && (
                                        <p className="text-xs text-slate-500 truncate">
                                            {subtitleSegments[currentSegmentIndex + 1]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    {/* Progress Bars */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Scene</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Total</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${totalProgress}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-slate-400 hover:text-white">
                                {playbackState === 'playing' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>

                            <Button variant="ghost" size="icon" onClick={goToPrevScene} disabled={currentSceneIndex === 0} className="text-slate-400 hover:text-white disabled:opacity-30">
                                <SkipBack className="w-5 h-5" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={replayScene} className="text-slate-400 hover:text-white" title="Replay">
                                <RotateCcw className="w-5 h-5" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-slate-400 hover:text-white">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={`${showSubtitles ? 'text-teal-400' : 'text-slate-400'} hover:text-white`}
                            >
                                <Subtitles className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isTeacher && (
                                <Button
                                    onClick={goToNextScene}
                                    disabled={!canAdvance}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                >
                                    {currentSceneIndex === totalScenes - 1 ? 'Start Scenario' : 'Continue'}
                                    <SkipForward className="w-4 h-4 ml-2" />
                                </Button>
                            )}

                            {isTeacher && (
                                <>
                                    <Button
                                        onClick={goToNextScene}
                                        disabled={!canAdvance}
                                        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50"
                                    >
                                        Continue
                                    </Button>
                                    <Button onClick={teacherSkip} variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                                        Skip
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Lock Message */}
                    {!isTeacher && playbackState === 'playing' && (
                        <p className="text-center text-slate-500 text-sm mt-3">
                            🔒 Complete the narration to continue
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}