import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Todo {
  id?: number;
  task: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getTodos(): Promise<{ data: Todo[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  async createTodo(task: string): Promise<{ data: Todo[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('todos')
      .insert([{ task, completed: false }])
      .select();
    
    return { data, error };
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<{ data: Todo[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    return { data, error };
  }

  async deleteTodo(id: number): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  async toggleComplete(id: number, completed: boolean): Promise<{ data: Todo[] | null; error: any }> {
    return this.updateTodo(id, { completed });
  }
}
