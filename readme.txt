
---

### Autorství jednotlivých částí

| **Jméno**             | **Úkol**                                                                                                         |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|
| **Maksim Samusevich** | - Profilová obrazovka (`profile/`)
                       - Obrazovka chatu (`chats/`)
                       - Nastavení (`settings/` kromě `myTasks.tsx`)
                       - Statistiky příjmů a výdajů (`stats/`)
                       - Chats a profil v sekci záložek: `(tabs)/inbox.tsx`, `(tabs)/profile.tsx` |
| **Vojtěch Tichý**     | - Domovská obrazovka (`(tabs)/index.tsx`)
                       - Rychlé hledání (`(tabs)/explore.tsx`)
                       - Filtrování služeb (`filters/`)
                       - Kategorie (`(modals)/categories.tsx`)
                       - Obrazovka služby (`(modals)/job_post.tsx`)
                       - Oblíbené příspěvky
                       - Hodnocení služeb ('comments/', '(modals)/editComment.tsx')
                       - Zahájení chatu (profile/[taskerId].tsx) |
| **Jakub Zelenay**     | - Obrazovky pre vytváranie nových ponúkaných a hľadaných úloh `(tabs)/wishlist.tsx` a folder (`createNew/`)
                       - Moje tasky (`settings/myTasks.tsx`)|

---

### Důležité poznámky

1. **Frontend klíčové části**:
   - Profilová obrazovka: `profile/`
   - Chat: `chats/`
   - Nastavení : `settings/`
   - Statistiky: `stats/`
   - Nový příspěvek: `createNew/`
   - Inbox a profil: `(tabs)/inbox.tsx`, `(tabs)/profile.tsx`
   - Domovská obrazovka: `(tabs)/index.tsx`
    - Rychlé hledání: `(tabs)/explore.tsx`
    - Filtrování služeb: `filters/`
    - Kategorie: `(modals)/categories.tsx`
    - Vytvoření příspěvku: `(tabs)/wishlist.tsx`

2. **Technologie použité v projektu**:
   - React Native
   - Firebase (Firestore, Storage, Functions)
   - Expo

---

Tento soubor slouží jako průvodce adresářovou strukturou a popisem autorství projektu TaskLink.
