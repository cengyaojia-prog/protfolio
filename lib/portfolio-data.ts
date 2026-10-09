export type Project = {
 id:string;title:string;originalTitle:string;category:string;year:string;role:string;duration:string;status:string;summary:string;approach:string;selection:string;videoKey:string;posterKey:string;externalUrl:string;conceptPoster:string;isConcept:boolean;
};
export type Profile = {bio:string;style:string;interests:string;email:string};
const blank={selection:"",videoKey:"",posterKey:"",externalUrl:"",conceptPoster:"",isConcept:false};
export const defaultProjects:Project[]=[
 {...blank,id:"ai-film-study",title:"AI Film Study",originalTitle:"AI影像毕业项目",category:"AI film",year:"In development",role:"Film concept & creative research",duration:"",status:"In development",conceptPoster:"/images/ai-film.webp",isConcept:true,
 summary:"Two generated characters awaken inside an AI workspace. Believing themselves to be actors, they navigate cultural difference, shifting roles and the uncertain intentions of a creator.",
 approach:"A short AI film developed alongside a critical research report. The project asks how authorial control, character agency and cross-cultural representation become visible through the process of making an AI image."},
 {...blank,id:"aphasia",title:"Aphasia",originalTitle:"失语症",category:"Short film",year:"2026",role:"Screenwriter · Director · Producer · Editor",duration:"Approx. 20 min",status:"In post-production",
 summary:"A fiction short exploring the difficulties faced by international students, and the distance between what can be felt and what can be expressed.",
 approach:"Written and directed during my master's studies in Korea. The project brings questions of language, belonging and cultural encounter into a lived, everyday setting.",selection:"Top 20 project selection · 湾浪潮青年电影节创投 · 2026"},
 {...blank,id:"dream-master",title:"Dream Master",originalTitle:"梦境大师",category:"Narrative game",year:"2026",role:"Narrative & game development · Team project",duration:"Playable prototype",status:"Prototype",conceptPoster:"/images/dream-master.webp",isConcept:true,
 summary:"A dream becomes an explorable story. Players inhabit the perspective of an object, question furniture characters and gradually uncover the memories held by a room.",
 approach:"The project connects personal dream input, structured story creation, character dialogue and visual keepsakes. I am interested in the tension between a stable narrative structure and the possibilities of generative interaction. The prototype and planned platform remain distinct stages of the project."},
 {...blank,id:"kun-shou",title:"Kun Shou",originalTitle:"困兽",category:"Screenplay",year:"2026",role:"Screenwriter",duration:"Feature screenplay",status:"Selected screenplay",selection:"Screenplay selection · 亚洲国际艺术电影节 · 2026",
 summary:"A feature screenplay selected by 亚洲国际艺术电影节.",approach:"Part of my ongoing screenwriting practice, with attention to character perspective, fictional worlds and the relationship between individual choices and the narratives that contain them."},
 {...blank,id:"lost-in-the-drama",title:"Lost in the Drama",originalTitle:"剧中人",category:"Screenplay",year:"In development",role:"Screenwriter",duration:"",status:"In development",
 summary:"An author writes a filmmaker. That filmmaker makes a film. The boundaries between their stories begin to shift.",approach:"A nested narrative centred on Wu Ke, a fictional director in Beijing. The structure places the author, the filmmaker and the characters of her film in three related narrative layers, examining creative uncertainty and the question of who controls a story."},
 {...blank,id:"women-construction-workers",title:"Women Construction Workers",originalTitle:"女工",category:"Documentary",year:"2021",role:"Producer · Director · Cinematographer · Editor",duration:"",status:"Completed",
 summary:"A documentary about women working on a construction site at Zhejiang University.",approach:"An early documentary practice grounded in observing work and everyday life, attending to people whose presence can be overlooked in familiar spaces."},
 {...blank,id:"glimmer",title:"Glimmer",originalTitle:"微光",category:"Documentary",year:"2022",role:"Director · Cinematographer · Editor",duration:"Short-film series",status:"Completed",
 summary:"Films documenting a volunteer teaching programme in Yizhou, Guangxi.",approach:"A series of documentary and short-film works made around a volunteer teaching project, following the everyday exchanges that form a temporary community."}
];
export const defaultProfile:Profile={
 bio:"I'm Yaojia Zeng, a screenwriter and filmmaker working across fiction, AI-assisted moving images and interactive narrative. I studied Broadcasting and Television at Zhejiang University and am pursuing a master's in Film and Moving Image Media at Chung-Ang University's Graduate School of Arts in Korea.",
 style:"My practice moves between everyday experience and imagined worlds. I return to nested stories, unstable perspectives and moments when a character starts to question the story they inhabit. Cultural encounters, the limits of language and the imagined inner lives of objects give these questions a form. I use AI as a material to examine through creative practice, while keeping the choices of the writer and filmmaker visible.",
 interests:"AI-assisted moving-image practice and authorship\nMetafiction, screenwriting and narrative structure\nEast Asian screen cultures and cross-cultural storytelling\nInteractive narrative, object perspectives and character agency",
 email:""
};
export function posterUrl(p:Project){return p.posterKey?"/api/media/"+encodeURIComponent(p.posterKey):p.conceptPoster;}
export function videoUrl(p:Project){return p.videoKey?"/api/media/"+encodeURIComponent(p.videoKey):"";}
