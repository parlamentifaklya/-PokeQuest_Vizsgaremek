import { Feyling } from "./Feyling"
import { Item } from "./Item"

export type User = {
    userName: string,
    userLevel: number,
    userInventory: UserInventory,
    coinAmount: number
}

export type UserInventory = {
    ownedFeylings: Feyling[],
    ownedItems: Item[]
}