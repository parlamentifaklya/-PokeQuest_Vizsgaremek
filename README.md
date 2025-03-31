# Pokequest
A vizsgaremekünk célja egy olyan játék létrehozása, amely szórakoztató és könnyen hozzáférhető minden korosztály számára.
A célközönség nagyon széles: a gyerekektől kezdve a felnőttekig bárki élvezheti a játékot, függetlenül attól, hogy mennyi tapasztalata van a videójátékok terén.

## Dokumentáció indítása

- A dokumentációban található az összes információ a project részleteiről és indításáról.

1. Nyiss meg egy parancssort (cmd-t) esetleg Git Bash-t

2. Klónozd le a repot a következő parancs használatával
```
git clone https://github.com/parlamentifaklya/-PokeQuest_Vizsgaremek.git
```
3. Nyisd meg a klónozott mappát, manuálisan fájlkezelőből.

4. Amikor bent vagy a -PokeQuest_Vizsgaremek mappában akkor a `PokeQuestDocs` mappát nyisd meg Visual Studio Code-ban.

5. Nyisd meg a terminált, és futtasd a következő parancsokat:

```
npm i
```

```
npm run dev
```

# Játék Indítása

## Backend (Adatbázis)

>[!WARNING]
>
> Az adatbázisnak futnia kell mielőtt elindítjuk a játékot, és ne is zárjuk be amíg használjuk.

A dokumentáció letöltésénél már leklónoztad a repositoryt.

1. Nyisd meg a klónozott mappát, manuálisan fájlkezelőből.

2. Amikor bent vagy a -PokeQuest_Vizsgaremek mappában akkor a `backend` mappában, azon belül a `PokeQuestApi_New` mappában nyisd meg a `PokeQuestApi_New.sln` fájlt és futtasd http-n.

>[!NOTE]
>
> Várd meg míg az összes NugetPackage-t felismeri a Visual Studio, .Net 9-nél régebbi verzióval nem fog működni.

## Frontend (Játék)

1. Amikor bent vagy a -PokeQuest_Vizsgaremek mappában akkor a `frontend` mappában, azon belül a `PokeQuest_Game` mappát nyisd meg Visual Studio Code-ban.


2. Amikor megnyílt a Visual Studo Code, egy új terminálban töltsd le a függőségeket a következő paranccsal:
```
npm install
```
2. Futtasd le a programot a következő paranccsal:
```
npm start
``` 
3. Ez után nyisd meg a terminálban megjelenő localhost linket (CTRL + bal klikk)

```
http://localhost:3000
``` 

