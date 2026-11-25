/**
 * Texts of the public pages in three languages.
 *
 * To add a text: add the same key to km, en and fr.
 * To add a language: add it to LANGUAGES and add a full dictionary below.
 * A text that is missing in a language falls back to English.
 */

export const LANGUAGES = [
  { code: "km", label: "ខ្មែរ", english: "Khmer", short: "KH" },
  { code: "en", label: "English", english: "English", short: "EN" },
  { code: "fr", label: "Français", english: "French", short: "FR" },
];

export const DEFAULT_LANGUAGE = "en";

export const translations = {
  /* ------------------------------ English ------------------------------ */
  en: {
    brand: { name: "Electronic EDC" },
    nav: {
      home: "Home",
      about: "About",
      features: "Features",
      how: "How it works",
      login: "Log in",
      signup: "Sign up",
      dashboard: "Go to dashboard",
      menu: "Menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    login: {
      sideTitle: "Enter your values. See the circuit and its graph.",
      sideSubtitle:
        "Type numbers, upload an Excel file, or draw the wires. Sign in to open the calculator.",
      title: "Sign in",
      subtitle: "Use the username or email you registered with.",
      registeredSuccess: "Account created. Sign in to continue.",
      usernameLabel: "Email or username",
      passwordLabel: "Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      submit: "Sign in",
      submitting: "Signing in…",
      noAccount: "Student account?",
      createOne: "Create one",
    },
    signup: {
      title: "Create student account",
      stepOf: "Step {current} of {total}",
      optional: "Optional",
      select: "Select",
      male: "Male",
      female: "Female",
      other: "Other",
      back: "Back",
      next: "Next: {title}",
      submit: "Create account",
      submitting: "Creating account…",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
      successTitle: "Account created",
      successWelcome: "Welcome, {name}. ",
      successBody: "You can now sign in with your username and password.",
      redirecting: "Taking you to sign in…",
      signInNow: "Sign in now",
      steps: {
        about: {
          short: "About you",
          title: "About you",
          hint: "Only your full name is required.",
        },
        signin: {
          short: "Sign-in details",
          title: "Sign-in details",
          hint: "You will use these to log in.",
        },
        teacher: {
          short: "Activation",
          title: "From your teacher",
          hint: "Your teacher gives you a student ID and a license key.",
        },
      },
      fields: {
        full_name: "Full name",
        gender: "Gender",
        date_of_birth: "Date of birth",
        department: "Department",
        major: "Major",
        academic_year: "Academic year",
        class_name: "Class",
        phone: "Phone",
        address: "Address",
        username: "Username",
        email: "Email",
        password: "Password",
        passwordHelp: "At least 6 characters.",
        student_id: "Student ID",
        raw_key: "License key",
      },
    },
    about: {
      badge: "About Electronic-EDC",
      title: "Built for Electrical Engineering Education & Practice",
      subtitle:
        "Simplifying complex circuit formulas, step-by-step solutions, and batch calculations for students, instructors, and engineers.",
      slides: [
        {
          title: "Interactive Formula Solver",
          caption:
            "Instant calculation with clear step-by-step mathematical breakdowns.",
        },
        {
          title: "Bulk Excel Data Processing",
          caption:
            "Upload hundreds of circuit parameters at once and export verified results.",
        },
        {
          title: "Multi-Role Classroom System",
          caption:
            "Dedicated workspaces for Admins, Teachers, and Engineering Students.",
        },
      ],
    },
    partners: {
      badge: "Energy & Tech Ecosystem",
      title: "Cambodian Energy & Engineering Institutions",
      subtitle:
        "Aligned with national electrical standards and technical education frameworks.",
    },
    hero: {
      badge: "Electrical engineering calculator",
      title: "Solve circuit calculations, step by step.",
      subtitle:
        "Electronic EDC helps students and teachers calculate electrical formulas and see exactly how every answer is found.",
      primary: "Create student account",
      secondary: "Log in",
      note: "You need a license key and a student ID from your teacher.",
      imageAlt: "Electronic EDC calculator",
      chipSteps: "Step by step",
    },
    features: {
      title: "Everything for electrical calculations",
      subtitle:
        "Built for the classroom: simple for students, in control for teachers.",
      items: [
        {
          title: "Ready-made EDC formulas",
          text: "Start from more than 40 templates: Ohm's law, power, reactance, resonance, gain and more.",
        },
        {
          title: "Step-by-step solutions",
          text: "See the formula, the values and every calculation until the final result.",
        },
        {
          title: "Roles and access",
          text: "Admins, teachers and students each see only what they need.",
        },
        {
          title: "License keys",
          text: "Teachers give students a key, so only your class can sign up.",
        },
        {
          title: "Import from Excel",
          text: "Add a whole class at once from an Excel file.",
        },
        {
          title: "On every device",
          text: "Clean pages for phone, tablet and computer.",
        },
      ],
    },
    how: {
      title: "How it works",
      steps: [
        {
          title: "Get your key",
          text: "Your teacher gives you a student ID and a license key.",
        },
        {
          title: "Create your account",
          text: "Sign up with the key, then log in.",
        },
        {
          title: "Solve and learn",
          text: "Choose a formula, enter your values and follow the steps.",
        },
      ],
    },
    cta: {
      title: "Ready to start?",
      text: "Create your account in a minute.",
      primary: "Create student account",
      secondary: "I already have an account",
    },
    footer: {
      tagline: "Electrical engineering calculation system.",
      explore: "Explore",
      account: "Account",
      rights: "© {year} Electronic EDC. All rights reserved.",
    },
  },

  /* ------------------------------- Khmer ------------------------------- */
  km: {
    brand: { name: "Electronic EDC" },
    nav: {
      home: "ទំព័រដើម",
      about: "អំពីប្រព័ន្ធ",
      features: "មុខងារ",
      how: "របៀបប្រើប្រាស់",
      login: "ចូលគណនី",
      signup: "ចុះឈ្មោះ",
      dashboard: "ទៅផ្ទាំងគ្រប់គ្រង",
      menu: "ម៉ឺនុយ",
      closeMenu: "បិទម៉ឺនុយ",
      language: "ភាសា",
    },
    login: {
      sideTitle: "បញ្ចូលតម្លៃរបស់អ្នក ដើម្បីមើលសៀគ្វី និងក្រាហ្វ។",
      sideSubtitle:
        "វាយបញ្ចូលលេខ អាប់ឡូតឯកសារ Excel ឬគូសខ្សែភ្លើង។ ចូលគណនីដើម្បីបើកកម្មវិធីគណនា។",
      title: "ចូលប្រើប្រាស់",
      subtitle: "ប្រើប្រាស់ឈ្មោះគណនី ឬអ៊ីមែលដែលអ្នកបានចុះឈ្មោះ។",
      registeredSuccess: "បានបង្កើតគណនីជោគជ័យ។ សូមចូលប្រើប្រាស់ដើម្បីបន្ត។",
      usernameLabel: "អ៊ីមែល ឬឈ្មោះគណនី",
      passwordLabel: "ពាក្យសម្ងាត់",
      showPassword: "បង្ហាញពាក្យសម្ងាត់",
      hidePassword: "លាក់ពាក្យសម្ងាត់",
      submit: "ចូលប្រើប្រាស់",
      submitting: "កំពុងចូល…",
      noAccount: "គណនីនិស្សិត?",
      createOne: "បង្កើតគណនីថ្មី",
    },
    signup: {
      title: "បង្កើតគណនីនិស្សិត",
      stepOf: "ជំហានទី {current} នៃ {total}",
      optional: "មិនបង្ខំ",
      select: "ជ្រើសរើស",
      male: "ប្រុស",
      female: "ស្រី",
      other: "ផ្សេងៗ",
      back: "ត្រឡប់ក្រោយ",
      next: "បន្ទាប់៖ {title}",
      submit: "បង្កើតគណនី",
      submitting: "កំពុងបង្កើតគណនី…",
      hasAccount: "មានគណនីរួចហើយមែនទេ?",
      signIn: "ចូលប្រើប្រាស់",
      successTitle: "បង្កើតគណនីជោគជ័យ",
      successWelcome: "សូមស្វាគមន៍, {name}។ ",
      successBody:
        "ឥឡូវនេះអ្នកអាចចូលប្រើប្រាស់ជាមួយឈ្មោះគណនី និងពាក្យសម្ងាត់របស់អ្នកបានហើយ។",
      redirecting: "កំពុងនាំអ្នកទៅកាន់ទំព័រចូលប្រើប្រាស់…",
      signInNow: "ចូលប្រើប្រាស់ឥឡូវនេះ",
      steps: {
        about: {
          short: "អំពីអ្នក",
          title: "ព័ត៌មានផ្ទាល់ខ្លួន",
          hint: "តម្រូវឱ្យបំពេញតែឈ្មោះពេញរបស់អ្នកប៉ុណ្ណោះ។",
        },
        signin: {
          short: "ព័ត៌មានចូលគណនី",
          title: "ព័ត៌មានសម្រាប់ចូលគណនី",
          hint: "អ្នកនឹងប្រើព័ត៌មានទាំងនេះដើម្បីចូលប្រើប្រាស់។",
        },
        teacher: {
          short: "ការបើកដំណើរការ",
          title: "ព័ត៌មានពីគ្រូបង្រៀន",
          hint: "គ្រូរបស់អ្នកនឹងផ្តល់អត្តលេខនិស្សិត និងលេខកូដអាជ្ញាប័ណ្ណ (License Key)។",
        },
      },
      fields: {
        full_name: "ឈ្មោះពេញ",
        gender: "ភេទ",
        date_of_birth: "ថ្ងៃខែឆ្នាំកំណើត",
        department: "ដេប៉ាតឺម៉ង់",
        major: "ជំនាញ",
        academic_year: "ឆ្នាំសិក្សា",
        class_name: "ថ្នាក់",
        phone: "លេខទូរស័ព្ទ",
        address: "អាសយដ្ឋាន",
        username: "ឈ្មោះគណនី (Username)",
        email: "អ៊ីមែល",
        password: "ពាក្យសម្ងាត់",
        passwordHelp: "យ៉ាងតិច ៦ តួអក្សរ។",
        student_id: "អត្តលេខនិស្សិត",
        raw_key: "លេខកូដអាជ្ញាប័ណ្ណ (License Key)",
      },
    },
    about: {
      badge: "អំពី Electronic-EDC",
      title: "បង្កើតឡើងសម្រាប់ការសិក្សា និងអនុវត្តវិស្វកម្មអគ្គិសនី",
      subtitle:
        "សម្រួលដល់ការគណនារូបមន្តសៀគ្វីស្មុគស្មាញ ការបង្ហាញជំហានដោះស្រាយលម្អិត និងការគណនាទិន្នន័យ Excel ជាក្រុម។",
      slides: [
        {
          title: "ប្រព័ន្ធដោះស្រាយរូបមន្តឆ្លាតវៃ",
          caption: "គណនាលឿនរហ័ស ព្រមទាំងបង្ហាញជំហានគណិតវិទ្យាលម្អិតងាយយល់។",
        },
        {
          title: "ការគណនាទិន្នន័យ Excel ជាក្រុម",
          caption:
            "បញ្ចូលទិន្នន័យសៀគ្វីរាប់រយជួរក្នុងពេលតែមួយ និងទាញយកលទ្ធផលភ្លាមៗ។",
        },
        {
          title: "ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនតាមតួនាទី",
          caption: "បែងចែកមុខងារច្បាស់លាស់សម្រាប់ Admin គ្រូបង្រៀន និងនិស្សិត។",
        },
      ],
    },
    partners: {
      badge: "វិស័យថាមពល និងបច្ចេកវិទ្យា",
      title: "ស្ថាប័នអគ្គិសនី និងអប់រំបច្ចេកទេសនៅកម្ពុជា",
      subtitle:
        "អនុលោមតាមស្តង់ដារបច្ចេកទេសអគ្គិសនី និងកម្មវិធីសិក្សាវិស្វកម្មជាតិ។",
    },
    hero: {
      badge: "ម៉ាស៊ីនគណនាវិស្វកម្មអគ្គិសនី",
      title: "ដោះស្រាយការគណនាសៀគ្វី ជាជំហានៗ។",
      subtitle:
        "Electronic EDC ជួយសិស្ស និងគ្រូបង្រៀនគណនារូបមន្តអគ្គិសនី ហើយមើលឃើញច្បាស់ពីរបៀបរកចម្លើយនីមួយៗ។",
      primary: "បង្កើតគណនីសិស្ស",
      secondary: "ចូលគណនី",
      note: "អ្នកត្រូវការ license key និងលេខសម្គាល់សិស្ស (Student ID) ពីគ្រូរបស់អ្នក។",
      imageAlt: "ម៉ាស៊ីនគណនា Electronic EDC",
      chipSteps: "ជាជំហានៗ",
    },
    features: {
      title: "អ្វីៗទាំងអស់សម្រាប់ការគណនាអគ្គិសនី",
      subtitle:
        "បង្កើតឡើងសម្រាប់ថ្នាក់រៀន៖ ងាយស្រួលសម្រាប់សិស្ស និងមានការគ្រប់គ្រងសម្រាប់គ្រូ។",
      items: [
        {
          title: "រូបមន្ត EDC ដែលមានស្រាប់",
          text: "ចាប់ផ្តើមពីគំរូជាង ៤០៖ ច្បាប់អូម ថាមពល រេអាក់តង់ រ៉េសូណង់ ហ្គែន និងច្រើនទៀត។",
        },
        {
          title: "ដំណោះស្រាយជាជំហានៗ",
          text: "មើលរូបមន្ត តម្លៃ និងរាល់ការគណនា រហូតដល់លទ្ធផលចុងក្រោយ។",
        },
        {
          title: "តួនាទី និងសិទ្ធិចូលប្រើ",
          text: "អ្នកគ្រប់គ្រង គ្រូ និងសិស្សម្នាក់ៗ ឃើញតែអ្វីដែលខ្លួនត្រូវការ។",
        },
        {
          title: "License key",
          text: "គ្រូផ្តល់ key ឱ្យសិស្ស ដូច្នេះមានតែថ្នាក់របស់អ្នកទេដែលអាចចុះឈ្មោះបាន។",
        },
        {
          title: "នាំចូលពី Excel",
          text: "បន្ថែមសិស្សទាំងថ្នាក់ក្នុងពេលតែមួយ ពីឯកសារ Excel។",
        },
        {
          title: "ប្រើបានគ្រប់ឧបករណ៍",
          text: "ទំព័រស្អាតសម្រាប់ទូរស័ព្ទ ថេប្លេត និងកុំព្យូទ័រ។",
        },
      ],
    },
    how: {
      title: "របៀបប្រើប្រាស់",
      steps: [
        {
          title: "ទទួល key របស់អ្នក",
          text: "គ្រូផ្តល់លេខសម្គាល់សិស្ស និង license key ឱ្យអ្នក។",
        },
        { title: "បង្កើតគណនី", text: "ចុះឈ្មោះដោយប្រើ key រួចចូលគណនី។" },
        {
          title: "ដោះស្រាយ និងរៀន",
          text: "ជ្រើសរូបមន្ត បញ្ចូលតម្លៃ ហើយតាមដានជំហាននីមួយៗ។",
        },
      ],
    },
    cta: {
      title: "ត្រៀមខ្លួនចាប់ផ្តើមហើយឬនៅ?",
      text: "បង្កើតគណនីរបស់អ្នកក្នុងរយៈពេលមួយនាទី។",
      primary: "បង្កើតគណនីសិស្ស",
      secondary: "ខ្ញុំមានគណនីរួចហើយ",
    },
    footer: {
      tagline: "ប្រព័ន្ធគណនាវិស្វកម្មអគ្គិសនី។",
      explore: "ស្វែងរក",
      account: "គណនី",
      rights: "© {year} Electronic EDC។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    },
  },

  /* ------------------------------- French ------------------------------- */
  fr: {
    brand: { name: "Electronic EDC" },
    nav: {
      home: "Accueil",
      about: "À propos",
      features: "Fonctionnalités",
      how: "Comment ça marche",
      login: "Se connecter",
      signup: "S'inscrire",
      dashboard: "Aller au tableau de bord",
      menu: "Menu",
      closeMenu: "Fermer le menu",
      language: "Langue",
    },
    login: {
      sideTitle: "Entrez vos valeurs. Visualisez le circuit et son graphique.",
      sideSubtitle:
        "Saisissez des chiffres, importez un fichier Excel ou dessinez les fils. Connectez-vous pour ouvrir la calculatrice.",
      title: "Connexion",
      subtitle: "Utilisez le nom d’utilisateur ou l’e-mail enregistré.",
      registeredSuccess: "Compte créé. Connectez-vous pour continuer.",
      usernameLabel: "E-mail ou nom d’utilisateur",
      passwordLabel: "Mot de passe",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      submit: "Se connecter",
      submitting: "Connexion…",
      noAccount: "Compte étudiant ?",
      createOne: "Créer un compte",
    },
    signup: {
      title: "Créer un compte étudiant",
      stepOf: "Étape {current} sur {total}",
      optional: "Facultatif",
      select: "Sélectionner",
      male: "Homme",
      female: "Femme",
      other: "Autre",
      back: "Retour",
      next: "Suivant : {title}",
      submit: "Créer le compte",
      submitting: "Création du compte…",
      hasAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      successTitle: "Compte créé",
      successWelcome: "Bienvenue, {name}. ",
      successBody:
        "Vous pouvez maintenant vous connecter avec vos identifiants.",
      redirecting: "Redirection vers la connexion…",
      signInNow: "Se connecter maintenant",
      steps: {
        about: {
          short: "À propos",
          title: "À propos de vous",
          hint: "Seul votre nom complet est obligatoire.",
        },
        signin: {
          short: "Identifiants",
          title: "Informations de connexion",
          hint: "Vous les utiliserez pour vous connecter.",
        },
        teacher: {
          short: "Activation",
          title: "De votre enseignant",
          hint: "Votre enseignant vous fournit un ID étudiant et une clé de licence.",
        },
      },
      fields: {
        full_name: "Nom complet",
        gender: "Genre",
        date_of_birth: "Date de naissance",
        department: "Département",
        major: "Spécialité",
        academic_year: "Année académique",
        class_name: "Classe",
        phone: "Téléphone",
        address: "Adresse",
        username: "Nom d’utilisateur",
        email: "E-mail",
        password: "Mot de passe",
        passwordHelp: "Au moins 6 caractères.",
        student_id: "ID étudiant",
        raw_key: "Clé de licence",
      },
    },
    about: {
      badge: "À propos d’Electronic-EDC",
      title: "Conçu pour l’enseignement et la pratique du génie électrique",
      subtitle:
        "Simplifiez les formules de circuits complexes, les résolutions étape par étape et les calculs par lots.",
      slides: [
        {
          title: "Solveur de formules interactif",
          caption:
            "Calcul instantané avec décomposition mathématique étape par étape.",
        },
        {
          title: "Traitement Excel par lots",
          caption:
            "Importez des centaines de paramètres de circuits en une seule fois.",
        },
        {
          title: "Système de classe multi-rôles",
          caption:
            "Espaces dédiés aux administrateurs, enseignants et étudiants.",
        },
      ],
    },
    partners: {
      badge: "Écosystème Énergie & Tech",
      title: "Institutions cambodgiennes de l’énergie et de l’ingénierie",
      subtitle:
        "Aligné sur les normes électriques nationales et l’enseignement technique.",
    },
    hero: {
      badge: "Calculateur de génie électrique",
      title: "Résolvez vos calculs de circuits, étape par étape.",
      subtitle:
        "Electronic EDC aide les étudiants et les enseignants à calculer des formules électriques et à voir comment chaque résultat est obtenu.",
      primary: "Créer un compte étudiant",
      secondary: "Se connecter",
      note: "Vous avez besoin d'une clé de licence et d'un numéro d'étudiant fournis par votre enseignant.",
      imageAlt: "Calculateur Electronic EDC",
      chipSteps: "Étape par étape",
    },
    features: {
      title: "Tout pour les calculs électriques",
      subtitle:
        "Conçu pour la classe : simple pour les étudiants, avec le contrôle pour les enseignants.",
      items: [
        {
          title: "Formules EDC prêtes à l'emploi",
          text: "Partez de plus de 40 modèles : loi d'Ohm, puissance, réactance, résonance, gain et plus encore.",
        },
        {
          title: "Solutions étape par étape",
          text: "Voyez la formule, les valeurs et chaque calcul jusqu'au résultat final.",
        },
        {
          title: "Rôles et accès",
          text: "Administrateurs, enseignants et étudiants ne voient que ce dont ils ont besoin.",
        },
        {
          title: "Clés de licence",
          text: "L'enseignant remet une clé aux étudiants : seule votre classe peut s'inscrire.",
        },
        {
          title: "Import depuis Excel",
          text: "Ajoutez toute une classe d'un seul coup à partir d'un fichier Excel.",
        },
        {
          title: "Sur tous les appareils",
          text: "Des pages claires pour téléphone, tablette et ordinateur.",
        },
      ],
    },
    how: {
      title: "Comment ça marche",
      steps: [
        {
          title: "Obtenez votre clé",
          text: "Votre enseignant vous remet un numéro d'étudiant et une clé de licence.",
        },
        {
          title: "Créez votre compte",
          text: "Inscrivez-vous avec la clé, puis connectez-vous.",
        },
        {
          title: "Résolvez et apprenez",
          text: "Choisissez une formule, saisissez vos valeurs et suivez les étapes.",
        },
      ],
    },
    cta: {
      title: "Prêt à commencer ?",
      text: "Créez votre compte en une minute.",
      primary: "Créer un compte étudiant",
      secondary: "J'ai déjà un compte",
    },
    footer: {
      tagline: "Système de calcul de génie électrique.",
      explore: "Explorer",
      account: "Compte",
      rights: "© {year} Electronic EDC. Tous droits réservés.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */
const resolve = (dictionary, path) =>
  String(path)
    .split(".")
    .reduce(
      (node, key) =>
        node !== null && typeof node === "object" ? node[key] : undefined,
      dictionary,
    );

export const isSupportedLanguage = (code) =>
  LANGUAGES.some((language) => language.code === code);

/**
 * - translate('fr', 'hero.title')                       → text
 * - translate('en', 'footer.rights', { year: 2026 })    → text with {year} filled in
 * - translate('en', 'features.items')                   → the whole list
 */
export function translate(language, path, values) {
  let value = resolve(translations[language], path);
  if (value === undefined)
    value = resolve(translations[DEFAULT_LANGUAGE], path); // missing → English
  if (value === undefined) return String(path); // missing everywhere → show the key, so it is easy to spot
  if (typeof value === "string" && values) {
    return value.replace(/\{(\w+)\}/g, (match, name) =>
      name in values ? String(values[name]) : match,
    );
  }
  return value;
}
