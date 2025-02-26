export type Feyling = {
    id: number,
    name: string,
    description: string,
    img: string,
    typeId: number,
    abilityId: number,
    isUnlocked: boolean,
    hp: number,
    atk: number,
    itemId: number | null,
    weakAgainstId: number,
    strongAgainstId: number,
    sellPrice: number
}
