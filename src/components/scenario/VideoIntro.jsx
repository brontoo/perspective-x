import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Video data with voiceover scripts for each scenario
const VIDEO_CONTENT = {
    water_contamination: {
        title: 'The Invisible Threat',
        character: 'Dr. Sarah Chen, Environmental Chemist',
        avatar: '👩‍🔬',
        scenes: [
            {
                visual: 'A peaceful small town surrounded by green hills',
                narration: 'Welcome to Riverside County. For generations, this community has relied on groundwater from the aquifer beneath us.',
                duration: 5000
            },
            {
                visual: 'Factory with smoke stacks in the distance',
                narration: 'But six months ago, the Morrison Chemical plant expanded its operations just three miles upstream.',
                duration: 5000
            },
            {
                visual: 'Data table appearing on screen',
                narration: 'Today, our water quality readings show concerning results. Look at this data - nitrate levels are at 55 parts per million.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Graph comparing safe vs measured levels',
                narration: 'The EPA safe limit is 50 ppm. We are above that threshold. High nitrates can cause serious health issues, especially for infants.',
                duration: 6000,
                showGraph: true
            },
            {
                visual: 'Map showing groundwater flow',
                narration: 'Groundwater flows from the factory toward the town. The science is clear - we need to act, and your decisions will matter.',
                duration: 5000
            }
        ]
    },
    reaction_gone_wrong: {
        title: 'The Reaction Gone Wrong',
        character: 'Marcus Webb, Process Safety Engineer',
        avatar: '👨‍🔬',
        scenes: [
            {
                visual: 'Industrial chemical plant exterior',
                narration: 'This is the Apex Chemical facility. We produce industrial solvents used in manufacturing worldwide.',
                duration: 5000
            },
            {
                visual: 'Control room with monitors',
                narration: 'I have been monitoring reactor vessel 7 all morning. Something is not right.',
                duration: 4000
            },
            {
                visual: 'Temperature readings spiking',
                narration: 'Look at these readings. Temperature was steady at 80 degrees Celsius, but it is now climbing rapidly.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Alarm lights flashing',
                narration: 'This is a runaway exothermic reaction. The cooling system appears to have failed.',
                duration: 5000
            },
            {
                visual: 'Pressure gauge in red zone',
                narration: 'We have minutes before this becomes critical. Your understanding of reaction chemistry could save lives today.',
                duration: 5000
            }
        ]
    },
    acid_rain: {
        title: 'Acid Rain Alert',
        character: 'Dr. James Okafor, Atmospheric Scientist',
        avatar: '🧑‍🔬',
        scenes: [
            {
                visual: 'Dying forest with yellowed trees',
                narration: 'These forests have stood for centuries. But look at them now - the trees are dying.',
                duration: 5000
            },
            {
                visual: 'Corroded statues in a park',
                narration: 'Even the stone statues in our parks are dissolving. Something in the rain is eating away at everything.',
                duration: 5000
            },
            {
                visual: 'pH data appearing',
                narration: 'Our monitoring stations have collected rainfall samples. Normal rain has a pH of about 5.6. Look at Forest Zone A - pH 4.2.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Industrial smokestacks',
                narration: 'Sulfur dioxide from these industrial plants rises into the atmosphere and falls as sulfuric acid.',
                duration: 5000
            },
            {
                visual: 'Fish floating in lake',
                narration: 'The fish in our lakes are dying. We need scientific solutions now.',
                duration: 5000
            }
        ]
    },
    mutation_dilemma: {
        title: 'The Mutation Dilemma',
        character: 'Dr. Priya Sharma, Genetic Counselor',
        avatar: '👩‍⚕️',
        scenes: [
            {
                visual: 'Genetics clinic waiting room',
                narration: 'Welcome to the Genetics Counseling Center. Today we have a difficult case.',
                duration: 5000
            },
            {
                visual: 'Young couple sitting nervously',
                narration: 'Meet the Johnsons. They have just learned that both of them carry a gene variant for a rare genetic condition.',
                duration: 5000
            },
            {
                visual: 'Punnett square appearing',
                narration: 'When both parents are carriers, their children face specific probabilities.',
                duration: 5000,
                showData: true
            },
            {
                visual: 'Genetic outcomes breakdown',
                narration: '25% chance of being unaffected, 50% chance of being a carrier, and 25% chance of being affected.',
                duration: 6000
            },
            {
                visual: 'Counseling room',
                narration: 'They are looking to me for guidance. How do I balance scientific facts with their emotional needs?',
                duration: 5000
            }
        ]
    },
    reaction_time: {
        title: 'The Reaction Time Test',
        character: 'Coach Alex Rivera, Sports Scientist',
        avatar: '🏃',
        scenes: [
            {
                visual: 'Olympic training facility',
                narration: 'This is the National Athletics Training Center. We work with elite sprinters.',
                duration: 5000
            },
            {
                visual: 'Sprinter at starting blocks',
                narration: 'Meet Jordan, one of our top 100-meter sprinters. Their starts have always been explosive - until recently.',
                duration: 5000
            },
            {
                visual: 'Reaction time equipment',
                narration: 'Their baseline reaction time was 0.14 seconds - excellent for a sprinter. But something has changed.',
                duration: 5000
            },
            {
                visual: 'Test results appearing',
                narration: 'After only 5 hours of sleep, reaction time jumped to 0.21 seconds - that is a 50% increase.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Nervous system diagram',
                narration: 'The nervous system controls everything. Let us figure this out together.',
                duration: 5000
            }
        ]
    },
    unstable_slope: {
        title: 'The Unstable Slope',
        character: 'Dr. Maria Santos, Geologist',
        avatar: '👩‍🔬',
        scenes: [
            {
                visual: 'Hillside community after rain',
                narration: 'I have been called to Hillview Heights. After weeks of heavy rain, residents are reporting something alarming.',
                duration: 5000
            },
            {
                visual: 'Cracks in the ground',
                narration: 'Look at these cracks in the ground - some are 10 centimeters wide. This is not normal settling.',
                duration: 5000
            },
            {
                visual: 'Geological survey data',
                narration: 'The soil here is clay-rich. When clay absorbs water, it becomes slippery.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Cleared vegetation on hillside',
                narration: 'The vegetation was recently cleared for construction. Those roots were holding the soil together.',
                duration: 5000
            },
            {
                visual: 'Houses near the slope',
                narration: '15 families live in the danger zone. We need to make decisions based on science.',
                duration: 5000
            }
        ]
    },
    invasive_species: {
        title: 'Invasive Species Crisis',
        character: 'Dr. David Chen, Conservation Biologist',
        avatar: '🧑‍🔬',
        scenes: [
            {
                visual: 'Beautiful lake ecosystem',
                narration: 'Crystal Lake has been a biodiversity hotspot for decades.',
                duration: 5000
            },
            {
                visual: 'Water hyacinth covering surface',
                narration: 'But look at it now. In just three months, water hyacinth has covered 20% of the lake surface.',
                duration: 5000
            },
            {
                visual: 'Coverage data appearing',
                narration: 'Month one: 5%. Month two: 12%. Month three: 20%. It is spreading exponentially.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Struggling fish and salamander',
                narration: 'Native carp populations are down 40%. The endangered lake salamander is struggling.',
                duration: 5000
            },
            {
                visual: 'Blocked sunlight underwater',
                narration: 'The hyacinth blocks sunlight. The whole food web is collapsing.',
                duration: 5000
            }
        ]
    },
    power_grid: {
        title: 'Power Grid Failure',
        character: 'Engineer Yuki Tanaka, Grid Operations',
        avatar: '👩‍💻',
        scenes: [
            {
                visual: 'City skyline during heatwave',
                narration: 'It is the hottest day of the year. Temperatures are hitting 40 degrees Celsius.',
                duration: 5000
            },
            {
                visual: 'Control room with red alerts',
                narration: 'And our power grid is screaming. Demand has spiked to 45,000 megawatts.',
                duration: 5000
            },
            {
                visual: 'Supply vs demand chart',
                narration: 'But we can only generate 42,000 megawatts. We are 3,000 megawatts short.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Power plant status board',
                narration: 'Natural gas plants are maxed out. Coal is at capacity. Solar is declining.',
                duration: 6000
            },
            {
                visual: 'Frequency meter dropping',
                narration: 'We have 30 minutes to prevent a total blackout.',
                duration: 5000
            }
        ]
    },
    heat_loss: {
        title: 'Heat Loss in Buildings',
        character: 'Emma Wright, Energy Consultant',
        avatar: '👩‍💼',
        scenes: [
            {
                visual: 'Historic school building exterior',
                narration: 'Jefferson Elementary School - a beautiful 120-year-old building with a hidden problem.',
                duration: 5000
            },
            {
                visual: 'Heating bill showing $45,000',
                narration: 'Their annual heating bill is $45,000 - and climbing every year.',
                duration: 5000
            },
            {
                visual: 'Thermal imaging camera footage',
                narration: 'I brought my thermal imaging camera. You can see heat escaping everywhere.',
                duration: 5000
            },
            {
                visual: 'Heat loss breakdown data',
                narration: '35% through windows, 25% through the roof, 20% through walls. The building is hemorrhaging heat.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Students in cold classroom',
                narration: 'Students are cold. We need solutions that apply the physics of heat transfer.',
                duration: 5000
            }
        ]
    },
    oxygen_failure: {
        title: 'Mission Oxygen Failure',
        character: 'Flight Engineer Kenji Nakamura',
        avatar: '👨‍🚀',
        scenes: [
            {
                visual: 'Spacecraft in deep space',
                narration: 'This is the Artemis 7, six months into our journey to Mars. We are 50 million kilometers from Earth.',
                duration: 5000
            },
            {
                visual: 'Warning lights in cabin',
                narration: 'At 0300 hours, the alarm woke us. Our primary oxygen generation system has failed.',
                duration: 6000
            },
            {
                visual: 'Life support display',
                narration: 'There are four of us aboard. Each person needs 0.84 kilograms of oxygen per day. We have 72 hours.',
                duration: 6000,
                showData: true
            },
            {
                visual: 'Failed electrolysis equipment',
                narration: 'The electrolysis reaction that splits water into oxygen - it is down.',
                duration: 5000
            },
            {
                visual: 'Crew looking at supplies',
                narration: 'Your knowledge of chemistry might just save four lives. Let us think through this together.',
                duration: 5000
            }
        ]
    }
};

export default function VideoIntro({ scenarioId, onComplete }) {
    const content = VIDEO_CONTENT[scenarioId];
    const [currentScene, setCurrentScene] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const speechRef = useRef(null);
    const timerRef = useRef(null);

    // Text-to-speech function
    const speak = (text) => {
        if ('speechSynthesis' in window && !isMuted) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Try to get a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
            ) || voices.find(v => v.lang.includes('en'));

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Load voices
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // Handle scene changes and speech
    useEffect(() => {
        if (!isPlaying || !content) return;

        const scene = content.scenes[currentScene];

        // Speak the narration
        speak(scene.narration);

        const duration = scene.duration;
        const interval = 50;
        let elapsed = 0;

        timerRef.current = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);

            if (elapsed >= duration) {
                clearInterval(timerRef.current);
                if (currentScene < content.scenes.length - 1) {
                    setCurrentScene(currentScene + 1);
                    setProgress(0);
                } else {
                    setIsPlaying(false);
                }
            }
        }, interval);

        return () => {
            clearInterval(timerRef.current);
        };
    }, [currentScene, isPlaying, content, isMuted]);

    // Handle mute toggle
    useEffect(() => {
        if (isMuted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        } else if (!isMuted && isPlaying && content) {
            speak(content.scenes[currentScene].narration);
        }
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            clearInterval(timerRef.current);
        };
    }, []);

    // Handle play/pause
    const togglePlay = () => {
        if (isPlaying) {
            clearInterval(timerRef.current);
            if ('speechSynthesis' in window) {
                window.speechSynthesis.pause();
            }
        } else {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.resume();
            }
        }
        setIsPlaying(!isPlaying);
    };

    // Handle skip
    const handleSkip = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        clearInterval(timerRef.current);
        onComplete();
    };

    if (!content) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Video content loading...</p>
                <Button onClick={onComplete} className="mt-4">Continue</Button>
            </div>
        );
    }

    const scene = content.scenes[currentScene];
    const totalProgress = ((currentScene + progress / 100) / content.scenes.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                {/* Video display area */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentScene}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {/* Visual representation */}
                            <div className="text-center p-8">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-8xl mb-4"
                                >
                                    {content.avatar}
                                </motion.div>
                                <p className="text-slate-500 text-sm italic">{scene.visual}</p>
                            </div>

                            {/* Data overlay */}
                            {scene.showData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-20 left-8 right-8 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
                                >
                                    <p className="text-teal-400 text-sm font-semibold">📊 Data Displayed</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Character speaking */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl flex-shrink-0">
                                {content.avatar}
                            </div>
                            <div>
                                <p className="text-teal-400 text-sm font-medium mb-1">{content.character}</p>
                                <motion.p
                                    key={currentScene}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white text-lg leading-relaxed"
                                >
                                    "{scene.narration}"
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* Audio indicator */}
                    {!isMuted && isPlaying && (
                        <motion.div
                            className="absolute top-4 right-4 flex items-center gap-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <div className="w-1 h-3 bg-teal-400 rounded-full" />
                            <div className="w-1 h-5 bg-teal-400 rounded-full" />
                            <div className="w-1 h-4 bg-teal-400 rounded-full" />
                            <div className="w-1 h-6 bg-teal-400 rounded-full" />
                            <div className="w-1 h-3 bg-teal-400 rounded-full" />
                        </motion.div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                            style={{ width: `${totalProgress}%` }}
                        />
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                                className="text-slate-400 hover:text-white"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-slate-400 hover:text-white"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            <span className="text-slate-500 text-sm ml-2">
                                Scene {currentScene + 1} of {content.scenes.length}
                            </span>
                        </div>

                        <Button
                            onClick={handleSkip}
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                        >
                            <SkipForward className="w-4 h-4 mr-2" />
                            {currentScene === content.scenes.length - 1 && !isPlaying ? 'Start Scenario' : 'Skip Intro'}
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}