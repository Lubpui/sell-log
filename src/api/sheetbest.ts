import axios from "axios";
import type { Item } from "../types";

const API_URL = "https://api.sheetbest.com/sheets/786dddc5-a8bb-4c94-bfef-e7886afadd4a";

const api = axios.create({
  baseURL: API_URL,
});

export const getItems = async (): Promise<Item[]> => {
  try {
    const response = await api.get("");
    return response.data.map((item: any) => ({
      ...item,
      price: Number(item.price) || 0,
    }));
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

export const addItem = async (item: Omit<Item, "id">): Promise<Item | null> => {
  try {
    const response = await api.post("", item);
    return response.data;
  } catch (error) {
    console.error("Error adding item:", error);
    return null;
  }
};

export const updateItem = async (id: string, item: Partial<Item>): Promise<Item | null> => {
  try {
    const response = await api.patch(`id/${id}`, item);
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    return null;
  }
};

export const deleteItem = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`id/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
};
