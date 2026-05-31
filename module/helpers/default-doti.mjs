export const DEFAULT_DOTI = [
  {
    name: "Colpo mirato",
    description: "Ti basta un colpo d'occhio per riconoscere le debolezze dei nemici",
    dotType: "cacciatore",
    levels: [
      { level: "1", description: "Il tuo istinto ti guida in un colpo che ignora le resistenze della creatura", modifier: "" },
      { level: "2", description: "Riesci a capire la debolezza della creatura e i tuoi colpi ignorano sempre le sue resistenze", modifier: "" },
      { level: "3", description: "Aggiungi un danno extra al colpo", modifier: "+1 danno" }
    ]
  },
  {
    name: "Predatore urbano",
    description: "Ottieni vantaggio nelle prove di inseguimento o per seguire tracce.",
    dotType: "cacciatore",
    levels: [
      { level: "1", description: "Aggiungi 1d6", modifier: "+1d6" },
      { level: "2", description: "Aggiungi 1d8", modifier: "+1d8" },
      { level: "3", description: "Riesci a trovare le tracce anche in condizioni avverse e riesci a seguire il tuo bersaglio ignorando eventuali problemi circostanti (folla, pioggia ecc)", modifier: "" }
    ]
  },
  {
    name: "Perfetto cacciatore",
    description: "I ricordi della creatura che ti ha fatto del male riecheggiano nella tua mente, scegli una creatura e ogni volta che la affronti aggiungi dei bonus alle prove su di essa",
    dotType: "cacciatore",
    levels: [
      { level: "1", description: "Aggiungi 1d6 a tutte le prove non fisiche che riguardano la creatura", modifier: "+1d6" },
      { level: "2", description: "Aggiungi 1d6 anche alle prove di combattimento", modifier: "+1d6" },
      { level: "3", description: "I d6 dei livelli 1 e 2 si trasformano in d8 e 1 volta per sessione sei in grado di ignorare un attacco speciale della creatura", modifier: "d6 -> d8" }
    ]
  },
  {
    name: "Sensi oltre il velo",
    description: "Hai sviluppato una sensibilità verso le presenze soprannaturali.",
    dotType: "occultista",
    levels: [
      { level: "1", description: "Percepisci se una creatura o entità soprannaturale è nelle vicinanze.", modifier: "" },
      { level: "2", description: "Ottieni 1d6 extra nelle prove per individuare magie attive, illusioni o luoghi infestati.", modifier: "+1d6" },
      { level: "3", description: "Una volta a sessione puoi vedere chiaramente la vera forma di una creatura nascosta o sotto incantesimo.", modifier: "" }
    ]
  },
  {
    name: "Rituali improvvisati",
    description: "Sei capace di improvvisare rituali magici con pochi strumenti.",
    dotType: "occultista",
    levels: [
      { level: "1", description: "Sei capace di eseguire rituali semplici nella metà del tempo.", modifier: "" },
      { level: "2", description: "Una volta per avventura puoi lanciare un rituale potente senza avere tutti i materiali richiesti (ma subisci un contraccolpo extra deciso dal Master).", modifier: "" },
      { level: "3", description: "La tua padronanza del mondo occulto ti permette di creare nuovi rituali (da concordare con il master)", modifier: "" }
    ]
  },
  {
    name: "Contatto con l'ignoto",
    description: "Ti spingi oltre i limiti per comunicare con ciò che sta dall'altra parte.",
    dotType: "occultista",
    levels: [
      { level: "1", description: "Puoi ricevere frammenti criptici di informazioni da spiriti o entità.", modifier: "" },
      { level: "2", description: "Una volta a sessione puoi porre una domanda a un'entità ultraterrena e ricevere una risposta chiara (sebbene incompleta).", modifier: "" },
      { level: "3", description: "Puoi evocare uno spirito o entità minore con cui trattare: ottieni un'informazione preziosa o un favore, ma il Master può imporre un prezzo.", modifier: "" }
    ]
  },
  {
    name: "Faccia da angelo",
    description: "La tua capacità principale è quella di usare la tua espressione onesta e integerrima per convincere il prossimo",
    dotType: "truffatore",
    levels: [
      { level: "1", description: "1d6 extra alle prove di Empatia quando si tenta di raggirare qualcuno", modifier: "+1d6" },
      { level: "2", description: "I tuoi documenti falsi sono automaticamente migliori di un punto", modifier: "" },
      { level: "3", description: "Sei capace di creare documenti falsi", modifier: "" }
    ]
  },
  {
    name: "Mani leggere",
    description: "Riesci a rubare e manipolare serrature anche in situazioni sfavorevoli",
    dotType: "truffatore",
    levels: [
      { level: "1", description: "1d6 extra quando provi a rubare o a forzare una serratura", modifier: "+1d6" },
      { level: "2", description: "Il d6 extra diventa d8", modifier: "+1d8" },
      { level: "3", description: "Una volta per sessione, quando stai per essere beccato con le mani nel sacco, puoi dichiarare di non venir scoperto", modifier: "" }
    ]
  },
  {
    name: "Figlio della città",
    description: "La tua esperienza della vita cittadina e mondana ti aiuta a muoverti al meglio nella società",
    dotType: "truffatore",
    levels: [
      { level: "1", description: "Salvo indagini approfondite, puoi farti passare per \"uno del posto\"", modifier: "" },
      { level: "2", description: "Una volta per sessione puoi dichiarare di avere una conoscenza in città o di sapere dell'esistenza di una organizzazione (il master può ridimensionare la conoscenza)", modifier: "" },
      { level: "3", description: "Quando sei in città non puoi venir colto di sorpresa", modifier: "" }
    ]
  },
  {
    name: "Biblioteca vivente",
    description: "Una volta a sessione puoi \"ricordare\" un dettaglio dell'occulto senza tiro.",
    dotType: "letterato",
    levels: [
      { level: "1", description: "Ti ricordi dettagli generici che possono essere utili a identificare il tipo di creatura", modifier: "" },
      { level: "2", description: "Ti ricordi una leggenda o una storia legata alla creatura che stai cercando", modifier: "" },
      { level: "3", description: "Sai esattamente come affrontare il pericolo", modifier: "" }
    ]
  },
  {
    name: "Traduttore arcano",
    description: "La tua vita spesa a leggere libri su libri ha dato i suoi frutti",
    dotType: "letterato",
    levels: [
      { level: "1", description: "1d8 extra quando cerchi informazioni all'interno di un libro o quando cerchi un volume specifico", modifier: "+1d8" },
      { level: "2", description: "Riconosci subito in che lingua è scritto un tomo anche se non la conosci", modifier: "" },
      { level: "3", description: "Impari una lingua extra a tuo piacimento", modifier: "" }
    ]
  },
  {
    name: "Autorità accademica",
    description: "Le tue conoscenze e il modo in cui le esprimi ti danno un'aura di credibilità.",
    dotType: "letterato",
    levels: [
      { level: "1", description: "Ottieni vantaggio quando convinci qualcuno mostrando che \"lo dice un libro\" o che la tua fonte è affidabile.", modifier: "" },
      { level: "2", description: "Riesci a distinguere le fonti affidabili da quelle che non lo sono", modifier: "" },
      { level: "3", description: "La tua fama di accademico è arrivata al culmine, ogni volta che entri dentro un'università o un centro di ricerca vieni riconosciuto", modifier: "" }
    ]
  },
  {
    name: "Mente acuta",
    description: "La tua mente è affilata come un rasoio e ti permette di vedere cose che gli altri non vedono",
    dotType: "generico",
    levels: [
      { level: "1", description: "Aggiungi un punto extra ad una abilità su ingegno a tua scelta", modifier: "+1 abilità" },
      { level: "2", description: "Ottieni 1d6 extra nelle prove di intuizione", modifier: "+1d6" },
      { level: "3", description: "Una volta per sessione, puoi prevedere l'azione di un NPC e agire di conseguenza.", modifier: "" }
    ]
  },
  {
    name: "Esperto armaiolo",
    description: "Hai passato anni a pulire il vecchio fucile da caccia di tuo padre",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni 1d6 extra alle prove di Ingegneria per riparare o fare manutenzione alle armi", modifier: "+1d6" },
      { level: "2", description: "Puoi riparare armi in stato \"Pessimo\" o \"Scarso\" riportandole a \"Buono\" senza bisogno di pezzi di ricambio rari.", modifier: "" },
      { level: "3", description: "Quando esamini un'arma, riconosci immediatamente se è stata manomessa, quanti colpi ha sparato e il suo stato di salute esatto.", modifier: "" }
    ]
  },
  {
    name: "Esperto in armi bianche",
    description: "Nella tua vita ti sei spesso trovato con le spalle al muro con un coltello come tua unica arma",
    dotType: "generico",
    levels: [
      { level: "1", description: "Quando fai una prova di Rissa puoi usare, a tuo piacimento, l'agilità o la forza", modifier: "" },
      { level: "2", description: "Una volta per round puoi forzare un tiro di Rissa quando provi a colpire con un'arma bianca", modifier: "" },
      { level: "3", description: "Puoi usare tutte le armi bianche senza alcun malus", modifier: "" }
    ]
  },
  {
    name: "Esperto in armi da fuoco",
    description: "L'odore della polvere da sparo è il tuo profumo preferito e il rinculo è come una carezza.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un +1d6 nelle prove di Armi da fuoco.", modifier: "+1d6" },
      { level: "2", description: "Una volta per combattimento puoi ricaricare l'arma come azione gratuita.", modifier: "" },
      { level: "3", description: "Mirare diventa un'azione gratuita", modifier: "" }
    ]
  },
  {
    name: "Abile diplomatico",
    description: "La tua calma e la tua esperienza nel mondo sociale ti rendono perfetto per relazionarti con il prossimo.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un +1d6 nelle prove di Empatia durante negoziazioni o trattative.", modifier: "+1d6" },
      { level: "2", description: "Una volta per sessione puoi influenzare un NPC per ottenere un piccolo favore o informazione", modifier: "" },
      { level: "3", description: "Una volta per sessione, puoi trasformare un nemico minore in un alleato temporaneo.", modifier: "" }
    ]
  },
  {
    name: "Tecnico esperto",
    description: "Sistemi informatici, quadri elettrici, centraline e antifurto. Ormai le hai viste tutte",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado aggiuntivo nelle prove di Informatica quando provi a riparare un sistema", modifier: "+1d6" },
      { level: "2", description: "Ottieni un dado aggiuntivo nelle prove di Informatica quando provi a manomettere un sistema", modifier: "+1d6" },
      { level: "3", description: "I dadi aggiuntivi diventano 1D8", modifier: "+1d8" }
    ]
  },
  {
    name: "Esperto di sopravvivenza",
    description: "Hai sviluppato un forte senso di autoconservazione e il tuo vissuto sa farti arrivare a fine giornata. Scegli un ambiente che può essere urbano o naturale",
    dotType: "generico",
    levels: [
      { level: "1", description: "Quando ti trovi nel tuo ambiente prescelto non subisci svantaggi", modifier: "" },
      { level: "2", description: "Ottieni 1D6 extra alle prove che riguardano quell'ambiente", modifier: "+1d6" },
      { level: "3", description: "Se sei nel tuo ambiente tutti quelli che provano a seguirti o a tenderti imboscate hanno un dado in meno alla prova", modifier: "-1d6 ai nemici" }
    ]
  },
  {
    name: "Artista della fuga",
    description: "Prendere le situazioni di petto è un'ottima idea... se vuoi farti ammazzare",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un +1d6 nelle prove di Furtività o Movimento quando cerchi di sfuggire a un inseguimento.", modifier: "+1d6" },
      { level: "2", description: "Ottieni un bonus di +1d6 alle prove di Gioco di mano quando provi a liberarti da manette, corde o stanze chiuse.", modifier: "+1d6" },
      { level: "3", description: "In combattimento, puoi compiere l'azione \"Fuggire\" come azione rapida invece che lenta.", modifier: "" }
    ]
  },
  {
    name: "Sesto senso",
    description: "Hai imparato a riconoscere e usare il brivido che ti corre lungo la schiena",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un +1d6 nelle prove di Percezione quando cerchi di individuare pericoli nascosti.", modifier: "+1d6" },
      { level: "2", description: "Se fallisci il tiro puoi forzare il tiro senza prendere un nuovo Dado Maledetto", modifier: "" },
      { level: "3", description: "Il tuo istinto è supersviluppato e il tuo corpo percepisce i pericoli prima che tu li veda", modifier: "" }
    ]
  },
  {
    name: "Nervi d'acciaio",
    description: "Hai visto cose che avrebbero fatto impazzire chiunque.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Perdi un dado \"panico\" quando superi una prova di spirito", modifier: "-1 dado panico" },
      { level: "2", description: "Sei immune al panico dei compagni", modifier: "" },
      { level: "3", description: "Una volta a sessione puoi annullare l'effetto del tiro sulla tabella \"panico\". Devi farlo prima di tirare il dado", modifier: "" }
    ]
  },
  {
    name: "Duemila cicatrici",
    description: "Hai imparato a sopravvivere anche quando tutto sembra perso.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado extra nei test per stabilizzare ferite o resistere al dolore.", modifier: "+1d6" },
      { level: "2", description: "Quando recuperi, guadagni 1 punto extra (salute, stress o equivalente).", modifier: "+1 punto recupero" },
      { level: "3", description: "Quando vai \"A pezzi\" la prima volta in un combattimento puoi continuare a combattere fino a che non ricevi altri danni alla stessa caratteristica", modifier: "" }
    ]
  },
  {
    name: "Re del volante",
    description: "La strada è casa tua, che sia autostrada o vicolo fangoso.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado extra nelle prove di guida e inseguimento.", modifier: "+1d6" },
      { level: "2", description: "Ottieni un dado extra quando devi orientarti in macchina", modifier: "+1d6" },
      { level: "3", description: "Puoi spingere il veicolo al massimo: in una scena ottieni un vantaggio decisivo (sorpasso impossibile, fuga spettacolare).", modifier: "" }
    ]
  },
  {
    name: "Investigatore nato",
    description: "Il tuo occhio vede indizi che gli altri ignorano.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado extra quando cerchi indizi o dettagli nascosti.", modifier: "+1d6" },
      { level: "2", description: "Una volta a sessione puoi dichiarare di \"notare un dettaglio\" che aiuta nell'indagine.", modifier: "" },
      { level: "3", description: "Ottieni automaticamente un indizio chiave in una scena investigativa.", modifier: "" }
    ]
  },
  {
    name: "Colpo di fortuna",
    description: "La sorte sembra proteggerti nei momenti peggiori.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Una volta a sessione puoi ritirare un dado fallito.", modifier: "" },
      { level: "2", description: "Una volta a sessione puoi trasformare un fallimento in un successo minore.", modifier: "" },
      { level: "3", description: "Una volta a sessione puoi trasformare un fallimento in un successo completo.", modifier: "" }
    ]
  },
  {
    name: "Fiuto per la menzogna",
    description: "Capisci al volo quando qualcuno sta mentendo o nascondendo qualcosa.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado extra quando cerchi di valutare se qualcuno dice la verità.", modifier: "+1d6" },
      { level: "2", description: "Una volta a sessione puoi chiedere al Master: \"Sta mentendo?\" e ricevi una risposta onesta.", modifier: "" },
      { level: "3", description: "Una volta a sessione puoi ribaltare la situazione: quando scopri una bugia, ottieni vantaggio in un test sociale immediato.", modifier: "" }
    ]
  },
  {
    name: "Mani esperte",
    description: "Sai arrangiarti con ciò che hai sotto mano.",
    dotType: "generico",
    levels: [
      { level: "1", description: "Ottieni un dado extra quando ripari o costruisci oggetti improvvisati.", modifier: "+1d6" },
      { level: "2", description: "Puoi aggiustare in modo grezzo un oggetto rotto per usarlo almeno una volta.", modifier: "" },
      { level: "3", description: "Una volta a sessione puoi creare \"qualcosa di utile\" con pochi materiali, anche se non era previsto (il Master decide i limiti).", modifier: "" }
    ]
  },
  {
    name: "Resiliente",
    description: "La tua resistenza trascende l'umano, ormai niente e nessuno può sperare di sopraffarti come se tu fossi un novellino",
    dotType: "generico",
    levels: [
      { level: "1", description: "Durante il combattimento, una volta per turno, puoi decidere di ritirare sulla tabella panico. Sei costretto a tenere il nuovo risultato", modifier: "" },
      { level: "2", description: "La prima volta che scendi a 0 punti ferita resti in piedi fino a che il combattimento non termina o fino a che non subisci altri danni fisici", modifier: "" },
      { level: "3", description: "Ottieni 1 punto ferita extra", modifier: "+1 PF" }
    ]
  }
];
