import { Group } from "../types";

type StorageListener = () => void;

class GroupStorageService {
  private groups: Group[] = [];
  private listeners: StorageListener[] = [];

  // Método para suscribirse a cambios
  subscribe(listener: StorageListener): () => void {
    this.listeners.push(listener);
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notificar a todos los listeners cuando hay cambios
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  addGroup(group: Group): void {
    this.groups.push(group);
    this.notifyListeners();
  }

  getAllGroups(): Group[] {
    return [...this.groups];
  }

  getGroupById(id: string): Group | undefined {
    return this.groups.find((group) => group.id === id);
  }

  updateGroup(id: string, updates: Partial<Group>): boolean {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups[index] = { ...this.groups[index], ...updates };
      this.notifyListeners();
      return true;
    }
    return false;
  }

  deleteGroup(id: string): boolean {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  getActiveGroups(): Group[] {
    return this.groups.filter(
      (group) => group.status === "active" || group.status === "pending_payment"
    );
  }

  getCompletedGroups(): Group[] {
    return this.groups.filter((group) => group.status === "completed");
  }

  clear(): void {
    this.groups = [];
    this.notifyListeners();
  }
}

export const groupStorage = new GroupStorageService();
