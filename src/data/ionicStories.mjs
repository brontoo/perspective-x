/**
 * Production script for the two Ionic Materials Specialist visual novels.
 * The React UI owns bubbles, captions and labels; artwork must contain none.
 * Illustrations / optional consequence clips can be added without modifying scripts.
 */
const beat=(id,art,speaker,line,extra={})=>({id,art,speaker,line,...extra});
const dessert=[
 beat("arrival","park","Narrator","At Umm Al Emarat Park, two young Emirati finalists have twelve minutes to finish their dessert.",{title:"The Final Dessert",mood:"Golden-hour excitement"}),
 beat("finalists","counter","Mariam","Saeed, bring the sugar and baking soda. We're nearly there!",{subtitle:"Mariam Al Mansoori · Dessert finalist"}),
 beat("rushed","counter","Saeed","On it! The judges will arrive any minute.",{subtitle:"Saeed Al Nuaimi · Dessert finalist"}),
 beat("incident","incident","Narrator","In the rush, identification labels detach from three sealed jars of identical-looking white powders.",{title:"The labels are gone"}),
 beat("shocked","incident","Saeed","The labels fell off! I can't tell which container is which."),
 beat("stop","incident","Fatima","Stop preparation. We cannot use unidentified ingredients.",{subtitle:"Fatima Al Kaabi · Competition coordinator"}),
 beat("hamad","hamad","Narrator","Hamad Al Zaabi, the chemistry investigator, arrives. He knows that appearances cannot settle this mystery.",{title:"An investigator arrives"}),
 beat("brief","hamad","Hamad","Three white powders may look the same, but the chemistry is different. I need your help as a Junior Food Chemistry Investigator.",{subtitle:"Hamad Al Zaabi · Applied Chemistry Field Investigator"}),
];
const aquarium=[
 beat("arrival","aquarium","Narrator","At The National Aquarium Abu Dhabi, Al Qana, a fictional educational water demonstration is almost ready for visiting students.",{title:"A mysterious marine morning",mood:"Ocean-blue discovery"}),
 beat("ready","loop","Noora","The learning session is nearly here. Khalid, how does our isolated demonstration loop look?",{subtitle:"Noora Al Mansoori · Marine educator"}),
 beat("check","loop","Khalid","The circulation is running. I'm making the final checks.",{subtitle:"Khalid Al Suwaidi · Technical supervisor"}),
 beat("incident","cloudy","Narrator","Without warning, the water becomes milky white, and a chalky mineral deposit forms on the demonstration panel.",{title:"The water is turning white"}),
 beat("alarm","cloudy","Khalid","Noora! Look at the panel. That wasn't there a minute ago."),
 beat("hold","cloudy","Noora","Pause the demonstration and keep the loop isolated. The animal exhibits are unaffected."),
 beat("hamad","hamad","Narrator","Hamad Al Zaabi arrives to investigate the white deposit. A cloudy sample is a clue—not a diagnosis.",{title:"The mineral mystery"}),
 beat("brief","hamad","Hamad","We're investigating a separate educational loop, not an animal tank. Help me collect mineral evidence before anyone changes this system.",{subtitle:"Hamad Al Zaabi · Marine Water Chemistry Specialist"}),
];
const story={
 ionic_dessert_mystery:{
  location:"Umm Al Emarat Park, Abu Dhabi",
  accent:"#ffc77d",
  intro:dessert,
  backgrounds:{
   park:"/images/ionic/dessert-park.webp",
   counter:"/images/ionic/dessert-park.webp",
   incident:"/images/ionic/dessert-park.webp",
   hamad:"/images/ionic/dessert-park.webp"
  },
  production:{
   folder:"/images/scenarios/ionic_dessert_mystery/story/",
   scenes:["01_park.webp","02_finalists.webp","03_labels.webp","04_fatima.webp","05_hamad.webp","06_laboratory.webp","07_ions.webp","08_second_test.webp","09_decision.webp","10_outcome.webp"],
  },
  investigation:[
   beat("question","laboratory","Hamad","How should we investigate? Guessing by sight or tasting an unknown is not safe scientific evidence.",{title:"Find the clues"}),
   beat("conductivity","laboratory","Hamad","Calibrate with the water-only control, then test each prepared solution at equal concentration. Record your own results."),
   beat("ions","ions","Hamad","Conductivity indicates mobile charges, but does not uniquely identify a substance. Explore how sodium and chlorine form ions."),
   beat("second","second_test","Mariam","Both conducting samples look alike. We need another clue!"),
   beat("second-explain","second_test","Hamad","Use pH and a controlled virtual acid reaction on separate aliquots. Interpret the evidence together."),
   beat("identify","laboratory","Hamad","Now identify A, B and C, but remember: evidence of identity is not certification for use in food.")
  ],
  firstChoices:[
   {id:"measure",label:"Calibrate and compare conductivity in separate solutions",feedback:"Hamad: Good choice. Use the water-only control and measure each sample.",correct:true},
   {id:"appearance",label:"Choose the whitest powder",feedback:"Mariam: They still look identical. Hamad: Colour cannot identify a substance; collect an independent measurement."},
   {id:"taste",label:"Taste an unknown powder to save time",feedback:"Hamad stops the plan before any jar is opened: Never taste an unknown substance."},
   {id:"mix",label:"Mix all three powders first",feedback:"Hamad: Stop before mixing. Keep samples separate so we can interpret their individual evidence."}
  ],
  decision:[
   beat("wait","decision","Fatima","We need a professional recommendation. Can the finalists safely continue?"),
   beat("question","decision","Hamad","Our tests support the sample identities, but they cannot establish the original powders' food-grade origin. What should we do?",{title:"Make the call"})
  ],
  outcomes:{
   "verify-replace":[beat("success","outcome","Narrator","The team quarantines the unknown jars. Fresh sealed and traceable food-grade ingredients let preparation safely resume."),beat("hamad","outcome","Hamad","Strong reasoning. Identification and ingredient traceability are different questions.")],
   "conductivity-only":[beat("fail","outcome","Narrator","Preparation is paused, and a batch associated with an unverified ingredient is discarded."),beat("hamad","outcome","Hamad","Low conductivity is a clue, not proof of safety or source.")],
   taste:[beat("fail","outcome","Narrator","Hamad stops the suggested tasting before anybody opens or samples an unknown powder."),beat("hamad","outcome","Hamad","We never taste unknown chemicals. Return to safe evidence.")],
   appearance:[beat("fail","outcome","Narrator","The team cannot verify the jars by their shared white appearance, so preparation is delayed."),beat("hamad","outcome","Hamad","Looking the same is not the same as behaving chemically alike.")]
  },
  ending:[beat("reflect","outcome","Hamad","You studied the invisible chemistry behind everyday materials. Good investigators follow evidence, respect uncertainty, and protect people.")],
  artMap:{laboratory:"06_laboratory.webp",ions:"07_ions.webp",second_test:"08_second_test.webp",decision:"09_decision.webp",outcome:"10_outcome.webp"},
  outcomeVideos:{"verify-replace":"ending-verify-replace.mp4","conductivity-only":"ending-conductivity-only.mp4",taste:"ending-taste.mp4",appearance:"ending-appearance.mp4"}
 },
 ionic_aquarium_mystery:{
  location:"The National Aquarium Abu Dhabi, Al Qana",
  accent:"#74e0e2",
  intro:aquarium,
  backgrounds:{
   aquarium:"/images/ionic/aquarium-lab.webp",
   loop:"/images/ionic/aquarium-lab.webp",
   cloudy:"/images/ionic/aquarium-lab.webp",
   hamad:"/images/ionic/aquarium-lab.webp"
  },
  production:{
   folder:"/images/scenarios/ionic_aquarium_mystery/story/",
   scenes:["01_aquarium.webp","02_preparations.webp","03_clouding.webp","04_staff.webp","05_hamad.webp","06_evidence.webp","07_carbonate.webp","08_formula.webp","09_crystal.webp","10_water.webp","11_decision.webp","12_outcome.webp"]
  },
  investigation:[
   beat("question","evidence","Hamad","What should we do first? A white appearance alone cannot identify this mineral.",{title:"Find the clues"}),
   beat("tests","evidence","Hamad","Screen for calcium, check water solubility, examine carbonate behaviour in an isolated virtual test, and compare the reference fingerprint."),
   beat("formula","formula","Noora","The evidence seems to point toward calcium and carbonate. How do those ions combine?"),
   beat("balance","formula","Hamad","Balance Ca²⁺ and CO₃²⁻ in their simplest whole-number ratio. A stable formula unit has zero overall charge."),
   beat("lattice","crystal","Hamad","Rotate the rock-salt and calcite structures. The orderly crystal arrangement explains more than appearance alone."),
   beat("conditions","water","Khalid","What conditions could favour this deposit?"),
   beat("simulation","water","Hamad","Explore the qualitative trend as pH, calcium concentration and alkalinity change. This simulator is not an animal-system dosing tool."),
   beat("identify","evidence","Hamad","Combine the independent tests and commit your mineral hypothesis. What does the evidence support?")
  ],
  firstChoices:[
   {id:"measure",label:"Collect independent evidence from the isolated mineral",feedback:"Hamad: Exactly. Identify the solid before recommending a response.",correct:true},
   {id:"appearance",label:"Assume any white deposit is table salt",feedback:"Noora: Different minerals can look alike. Hamad: Compare independent evidence."},
   {id:"salt",label:"Add more salt to the demonstration loop",feedback:"Virtual consequence: Ion load rises; the deposit remains. Hamad: More salt does not answer the mineral question."},
   {id:"acid",label:"Add acid to the animal exhibit",feedback:"Hamad prevents the unsafe action before it happens. The animal exhibits remain unaffected."}
  ],
  decision:[
   beat("wait","decision","Khalid","The demonstration loop is still isolated. How do we respond?"),
   beat("question","decision","Hamad","Our evidence points toward a mineral, but laboratory clues aren't treatment instructions. What should qualified staff do next?",{title:"Make the call"})
  ],
  outcomes:{
   "isolate-review":[beat("success","outcome","Narrator","The loop stays isolated while qualified staff verify the likely calcium carbonate mineral and review pH, calcium, alkalinity, and monitoring records."),beat("hamad","outcome","Hamad","Well reasoned. We addressed the conditions and uncertainty, not just the visible deposit. Animal exhibits were never affected.")],
   "add-salt":[beat("fail","outcome","Narrator","The fictional demonstration loop's dissolved-ion load increases, but the deposit remains."),beat("hamad","outcome","Hamad","Conductivity and a white appearance do not make this sodium chloride.")],
   "acid-tank":[beat("fail","outcome","Narrator","Hamad blocks the proposed acid addition before any animal exhibit can be affected."),beat("hamad","outcome","Hamad","An isolated acid-identification test does not authorize changing animal-tank chemistry.")],
   "appearance-only":[beat("fail","outcome","Narrator","The deposit is cleared superficially, but cloudiness later recurs while the original chemistry remains unexamined."),beat("hamad","outcome","Hamad","Removing the symptom without identifying its cause is not a complete response.")]
  },
  ending:[beat("reflect","outcome","Hamad","A cloudy sample was the clue, not the answer. You followed the ions, the crystal, and the evidence before making a professional decision.")],
  artMap:{evidence:"06_evidence.webp",formula:"08_formula.webp",crystal:"09_crystal.webp",water:"10_water.webp",decision:"11_decision.webp",outcome:"12_outcome.webp"},
  outcomeVideos:{"isolate-review":"ending-isolate-review.mp4","add-salt":"ending-add-salt.mp4","acid-tank":"ending-acid-tank.mp4","appearance-only":"ending-appearance-only.mp4"}
 }
};
export const IONIC_STORIES=story;
export function storyImage(scenarioId,art){
 const s=story[scenarioId]; if(!s) return "";
 return s.artMap?.[art]?s.production.folder+s.artMap[art]:(s.backgrounds[art]||s.backgrounds.hamad);
}
export function outcomeFilm(scenarioId,key){
 const s=story[scenarioId];const name=s?.outcomeVideos?.[key];
 return name?"/videos/scenarios/"+scenarioId+"/"+name:"";
}
