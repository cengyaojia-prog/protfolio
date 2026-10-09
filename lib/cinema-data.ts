import {cinemaSources} from "./cinema-sources";

export type CinemaFilm = {
  id: string;
  title: string;
  originalTitle: string;
  year: string;
  director: string;
  synopsis: string;
  extendedSynopsis: string;
  themes: string[];
  image: string;
  source: string;
  credit: string;
  alt: string;
};

const films: Omit<CinemaFilm, "image" | "source" | "credit" | "alt">[] = [
  {id:"love-letter",title:"Love Letter",originalTitle:"情书",year:"1995",director:"Shunji Iwai",synopsis:"A letter sent to a deceased fiancé's former address receives an unexpected reply, opening a conversation about love, memory and a shared name.",extendedSynopsis:"An unexpected reply to a letter addressed to a deceased lover brings memories of two people with the same name and an unspoken love back into view.",themes:["Memory","Absence","Letters"]},
  {id:"lovers-on-the-bridge",title:"The Lovers on the Bridge",originalTitle:"新桥恋人",year:"1991",director:"Leos Carax",synopsis:"A street performer and a painter losing her sight fall in love on the Pont-Neuf while the Paris bridge is closed for restoration.",extendedSynopsis:"During the restoration of the Pont-Neuf in Paris, a street performer and a painter whose sight is fading meet and begin an intense, uneasy romance on the margins of the city.",themes:["Love at the margins","Bodies","The city"]},
  {id:"before-sunrise",title:"Before Sunrise",originalTitle:"爱在黎明破晓前",year:"1995",director:"Richard Linklater",synopsis:"Two strangers meet on a train and spend one night walking and talking through Vienna before they must part.",extendedSynopsis:"Two strangers who meet on a train step into Vienna, sharing their ideas about love and life over a single night of walking and conversation.",themes:["Conversation","Encounter","A single night"]},
  {id:"before-sunset",title:"Before Sunset",originalTitle:"爱在日落黄昏时",year:"2004",director:"Richard Linklater",synopsis:"Nine years after their night in Vienna, Jesse and Céline reunite in Paris, with only the hours before his flight to revisit what might have been.",extendedSynopsis:"Nine years after their encounter in Vienna, Jesse and Céline reunite in Paris. In the brief time before his flight, they return to the regrets and choices that have shaped their lives.",themes:["Real time","Missed possibilities","Reunion"]},
  {id:"before-midnight",title:"Before Midnight",originalTitle:"爱在午夜降临前",year:"2013",director:"Richard Linklater",synopsis:"On a summer holiday in Greece, Jesse and Céline confront the compromises and tensions of their life together.",extendedSynopsis:"On holiday in Greece, Jesse and Céline confront the responsibilities, compromises and arguments of their life together, as romance takes on a different form within everyday experience.",themes:["Everyday intimacy","Time","Compromise"]},
  {id:"la-la-land",title:"La La Land",originalTitle:"爱乐之城",year:"2016",director:"Damien Chazelle",synopsis:"An aspiring actor and a jazz musician fall in love in Los Angeles as their artistic ambitions pull them towards different futures.",extendedSynopsis:"An aspiring actor and a jazz musician fall in love in Los Angeles, while artistic ambitions and life choices gradually reshape their relationship.",themes:["Colour and music","Creative ambition","Imagined futures"]},
  {id:"a-streetcar-named-desire",title:"A Streetcar Named Desire",originalTitle:"欲望号街车",year:"1951",director:"Elia Kazan",synopsis:"Blanche DuBois arrives at her sister's New Orleans home, where her fragile self-image collides with the hostility of her brother-in-law Stanley.",extendedSynopsis:"Blanche arrives at her sister's home in New Orleans, where the identity she sustains through illusion comes into conflict with Stanley's harsh reality.",themes:["Performance","Desire","Illusion"]},
  {id:"secret-sunshine",title:"Secret Sunshine",originalTitle:"密阳",year:"2007",director:"Lee Chang-dong",synopsis:"A widow moves to her late husband's hometown with her young son; a devastating event unsettles her search for a new life and spiritual consolation.",extendedSynopsis:"A widow moves with her son to her late husband's hometown of Miryang. An unexpected tragedy unsettles her search for a new life, faith and forgiveness.",themes:["Grief","Faith","Forgiveness"]},
  {id:"burning",title:"Burning",originalTitle:"燃烧",year:"2018",director:"Lee Chang-dong",synopsis:"An aspiring writer reconnects with a childhood acquaintance and encounters her wealthy friend, becoming drawn into an increasingly uncertain mystery.",extendedSynopsis:"A young man reconnects with an old acquaintance and meets her wealthy, mysterious friend. Their relationship gradually becomes a series of questions that resist verification.",themes:["Ambiguity","Class","What remains unseen"]},
  {id:"kaili-blues",title:"Kaili Blues",originalTitle:"路边野餐",year:"2015",director:"Bi Gan",synopsis:"A doctor leaves Kaili to look for his nephew, travelling through a dreamlike landscape where past, present and future seem to meet.",extendedSynopsis:"A doctor from Kaili sets out to find his nephew. His journey unfolds through poetry, memory and dreams, as the boundaries between past, present and future begin to dissolve.",themes:["Dream time","Poetry","Landscape"]}
];

export const cinemaFilms: CinemaFilm[] = films.map(film => ({
  ...film, image:`/images/cinema/${film.id}.webp`, source:cinemaSources[film.id].source, credit:cinemaSources[film.id].credit, alt:cinemaSources[film.id].alt
}));

export type GalleryEntry = {id:string;kind:"work"|"cinema";title:string;originalTitle:string;year:string;image:string;concept:boolean;format:string;summary:string;video:string};
