import { users, uploadedFiles, type User, type InsertUser, type UploadedFile, type InsertFile } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createFile(file: InsertFile): Promise<UploadedFile>;
  getFile(id: number): Promise<UploadedFile | undefined>;
  updateFile(id: number, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getAllFiles(): Promise<UploadedFile[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, UploadedFile>;
  private currentUserId: number;
  private currentFileId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createFile(insertFile: InsertFile): Promise<UploadedFile> {
    const id = this.currentFileId++;
    const file: UploadedFile = {
      ...insertFile,
      id,
      uploadedAt: new Date(),
      processedAt: null,
      data: null,
      status: insertFile.status || "pending",
      errorMessage: insertFile.errorMessage || null,
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<UploadedFile | undefined> {
    return this.files.get(id);
  }

  async updateFile(id: number, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getAllFiles(): Promise<UploadedFile[]> {
    return Array.from(this.files.values());
  }
}

export const storage = new MemStorage();
