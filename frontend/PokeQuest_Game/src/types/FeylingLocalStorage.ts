export type FeylingsFromLocalStorage = {    
    feylingId: number,
    feylingName: string,
    feylingDescription: string,
    feylingImg: string,
    feylingType: number,
    feylingAbility: number,
    feylingIsUnlocked: boolean,
    feylingHp: number,
    feylingAtk: number,
    feylingItem: number | null,
    feylingWeakAgainst: number,
    feylingStrongAgainst: number,
    feylingSellPrice: number
}