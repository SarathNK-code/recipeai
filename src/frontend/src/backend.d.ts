import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HistoryEntry {
    timestamp: Time;
    aiResponse: string;
    ingredients: Array<string>;
}
export type Time = bigint;
export interface Recipe {
    id: bigint;
    name: string;
    steps: Array<string>;
    ingredients: Array<string>;
}
export interface Utensil {
    id: bigint;
    name: string;
    size: string;
    type: string;
}
export interface backendInterface {
    addHistoryEntry(ingredients: Array<string>, aiResponse: string): Promise<void>;
    addRecipe(name: string, ingredients: Array<string>, steps: Array<string>): Promise<bigint>;
    addUtensil(name: string, type: string, size: string): Promise<bigint>;
    deleteRecipe(id: bigint): Promise<void>;
    deleteUtensil(id: bigint): Promise<void>;
    getHistory(): Promise<Array<HistoryEntry>>;
    getRecipe(id: bigint): Promise<Recipe>;
    getUserRecipes(): Promise<Array<Recipe>>;
    getUserUtensils(): Promise<Array<Utensil>>;
    getUtensil(id: bigint): Promise<Utensil>;
    updateUtensil(id: bigint, name: string, type: string, size: string): Promise<void>;
}
