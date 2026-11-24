# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ===============================================================

ការពិពណ៌នាអំពីលំហូរការងារនៃប្រព័ន្ធ Electronic EDC
ប្រព័ន្ធនេះជាប្រព័ន្ធគណនាវិស្វកម្មអគ្គិសនី ដែលមានអ្នកប្រើបីប្រភេទ គឺ Admin, Teacher និង Student។

១. ភាពរួមនៃលំហូរ
Admin ──► បង្កើត License Key ──► ផ្តល់ឱ្យ Teacher / Student
  │
  ├──► បង្កើតប្រភេទ (Category) ──► បង្កើតរូបមន្ត (Formula) ──► កំណត់អថេរ (Variables)
  │
  └──► គ្រប់គ្រង Users / Roles / Permissions

Student ──► ចុះឈ្មោះ (Sign up) ──► ចូលប្រើ (Login) ──► Dashboard ──► គណនារូបមន្ត
២. លំហូររបស់ Admin
ចូលប្រព័ន្ធ (Login): Admin បញ្ចូល username និង password។ ប្រព័ន្ធពិនិត្យថាគណនីមានស្ថានភាព active ហើយអានតួនាទី (role) និងសិទ្ធិ (permission)។
ចូលទៅ Admin Portal: ប្រព័ន្ធបញ្ជូនទៅ /admin/dashboard។ ម៉ឺនុយខាងឆ្វេងបែងចែកជាក្រុម៖
Overview: Dashboard
Access control: Users, Roles, Permissions, License keys
Calculation: Formulas

ម៉ឺនុយនីមួយៗបង្ហាញតែនៅពេល Admin មានសិទ្ធិអានវា (ឧទាហរណ៍ user.read)។

បង្កើត License Key (ទំព័រ License keys):
ចុច New key ហើយកំណត់ចំនួនអ្នកអាចប្រើ (Max uses) ថ្ងៃផុតកំណត់ (Expires) និងការពិពណ៌នា
អាចវាយ key ខ្លួនឯង ឬទុកទទេឱ្យប្រព័ន្ធបង្កើតដោយស្វ័យប្រវត្តិ
key បង្ហាញម្តង ត្រូវចុច Copy ហើយផ្តល់ទៅសិស្ស
ពេលក្រោយអាច Edit, Revoke (បញ្ឈប់ការប្រើ key) ឬ Delete
គ្រប់គ្រងអ្នកប្រើ (ទំព័រ Users): បន្ថែមអ្នកប្រើ កែឈ្មោះ អ៊ីមែល ស្ថានភាពគណនី ប្តូរតួនាទី ឬលុប។ Admin មិនអាចលុបគណនីខ្លួនឯងបានទេ។
រៀបចំរូបមន្ត (ទំព័រ Formulas) មើលចំណុចទី ៤។
៣. លំហូរបង្កើតរូបមន្ត (Formula)
បង្កើតប្រភេទ: ចុច Manage categories ហើយបន្ថែមប្រភេទ ដូចជា DC Circuits ឬ AC Circuits។
បង្កើតរូបមន្ត: ចុច Create formula។
បញ្ចូល Title និង Category
សរសេរ Expression ដោយប្រើវិធីមួយក្នុងចំណោមទាំងនេះ៖
វាយដោយក្តារចុច ឧទាហរណ៍ V**2 / R
ចុចប៊ូតុង Operators / Functions / Symbols / Constants
ជ្រើសពី EDC templates (មាន ៤៤ គំរូ)
ប្រព័ន្ធពិនិត្យភ្លាមៗ: បើ Expression ត្រឹមត្រូវ បង្ហាញសញ្ញាបៀបបៀបបៀប "Expression is valid" និងអថេរដែលរកឃើញ។ បើខុស វាពន្យល់មូលហេតុ ដូចជាបាត់ operator ឬមុខងារមិនស្គាល់។
អថេរ (Variables): ប្រព័ន្ធរកឃើញអថេរដោយស្វ័យប្រវត្តិ ហើយស្នើឈ្មោះ និងឯកតា (V = Voltage, ឯកតា V)។ អ្នកអាចកែបាន។
សាកល្បង (Try it with numbers): បញ្ចូលលេខសាកល្បងដើម្បីមើលលទ្ធផលមុនរក្សាទុក។
ចុច Create formula: រូបមន្ត និងអថេររបស់វាត្រូវបានរក្សាទុក។
កែអថេរពេលក្រោយ: ចុចរូបតំណាងបញ្ជីនៅលើកាតរូបមន្ត (Variables) ដើម្បីបន្ថែម កែ លុប ឬកែទាំងអស់ក្នុងពេលតែមួយ។
៤. លំហូររបស់ Student
ទទួល ID និង License Key ពីគ្រូ ឬ Admin។ សិស្សមិនអាចចុះឈ្មោះដោយគ្មាន key បានទេ។
ចុះឈ្មោះ (/signup): បំពេញព័ត៌មានជា ៣ ផ្នែក៖
ព័ត៌មានចូលប្រព័ន្ធ (username, email, password)
ពីគ្រូ (Student ID, License key)
អំពីខ្លួន (ឈ្មោះពេញ ជាចាំបាច់ ផ្សេងទៀតស្រេចចិត្ត)
ប្រព័ន្ធពិនិត្យ key: backend ពិនិត្យថា key ត្រឹមត្រូវ មិនផុតកំណត់ មិនត្រូវបានបញ្ឈប់ (revoke) និងមិនប្រើលើសកំណត់។ បើជោគជ័យ ទំព័រ "Account created" បង្ហាញ ហើយបន្ទាប់ពី ៣ វិនាទីបញ្ជូនទៅទំព័រចូលប្រើ។
ចូលប្រើ (/login): ទំព័រនេះបង្ហាញសារពណ៌បៃតងថា "Account created"។ បន្ទាប់ពី Login ប្រព័ន្ធបញ្ជូនទៅ /student/dashboard។
ប្រើប្រាស់: សិស្សជ្រើសរូបមន្ត បញ្ចូលតម្លៃអថេរ ហើយប្រព័ន្ធបង្ហាញលទ្ធផលជាមួយជំហានជំនួសតម្លៃ (substitution steps)។

ចំណាំ: ទំព័រ EDC Calculator របស់សិស្ស (/student/calculator) មិនទាន់បានសរសេរនៅឡើយទេ។ ការបញ្ចូលតាមឯកសារ Excel, ការបញ្ចូលសៀគ្វី និងក្រាហ្វលទ្ធផល ក៏ជាផែនការបន្តដែរ។ បច្ចុប្បន្នការគណនាមាននៅលើទំព័រ Formulas (ប៊ូតុង Calculate) ប៉ុណ្ណោះ។

៥. លំហូរសុវត្ថិភាព (ពិនិត្យសិទ្ធិ)

រាល់ពេលបើកទំព័រ ប្រព័ន្ធពិនិត្យតាមលំដាប់៖

បើកទំព័រ
   │
   ├─ 1) ចូលប្រព័ន្ធហើយឬនៅ?  ── មិនទាន់ ──► ទៅទំព័រ /login
   │
   ├─ 2) តួនាទីត្រឹមត្រូវទេ?  ── ខុស ────► ទៅ Dashboard របស់តួនាទីខ្លួន
   │      (Admin / Teacher / Student)
   │
   └─ 3) មានសិទ្ធិ (permission) ទេ? ── គ្មាន ──► បង្ហាញ "You don't have access"
          │
          └─ មាន ──► បង្ហាញទំព័រ
ផ្នែក Frontend (React): ការពារទំព័រ (ProtectedRoute) និងលាក់ម៉ឺនុយ ឬប៊ូតុងដែលអ្នកប្រើគ្មានសិទ្ធិ
ផ្នែក Backend (FastAPI): ពិនិត្យតួនាទី និងសិទ្ធិម្តងទៀតរាល់សំណើ ព្រមទាំងបដិសេធគណនីដែលមិន active។ នេះជាការពារពិតប្រាកដ។ ការលាក់ប៊ូតុងគ្រាន់តែជួយឱ្យប្រើស្រួល។
ចាកចេញ (Logout): ប្រព័ន្ធបង្ហាញប្រអប់សួរបញ្ជាក់ "Log out?" មុននឹងចាកចេញ។
៦. តារាងសង្ខេបតួនាទី
តួនាទី	អ្វីដែលអាចធ្វើ
Admin	គ្រប់គ្រង Users, Roles, Permissions, License keys និងរូបមន្ត
Teacher	គ្រប់គ្រងរូបមន្ត និងអថេរ (តាមសិទ្ធិដែលទទួល) និងមើលសិស្ស
Student	ចុះឈ្មោះដោយប្រើ key, ចូលប្រើ, ហើយគណនារូបមន្ត