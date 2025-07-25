import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface Todo {
  id?: number;
  task: string;
  completed: boolean;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  // Use a BehaviorSubject to hold and stream the list of todos
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.listenToTodoChanges();
  }

  // Fetch initial todos and update the BehaviorSubject
  async fetchTodos() {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      this.todosSubject.error(error); // Propagate error
    } else {
      this.todosSubject.next(data || []);
    }
  }

  // Listen for real-time changes and update the list
  private listenToTodoChanges() {
    this.channel = this.supabase
      .channel('todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch all todos to ensure consistency.
          // For more complex apps, you could merge the payload (new, old)
          // into the existing list.
          this.fetchTodos();
        }
      )
      .subscribe();
  }

  createTodo(task: string) {
    return this.supabase
      .from('todos')
      .insert([{ task, completed: false }])
      .select();
  }

  toggleComplete(id: number, completed: boolean) {
    return this.supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select();
  }

  updateTodo(id: number, updates: Partial<Todo>) {
    return this.supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select();
  }

  deleteTodo(id: number) {
    return this.supabase
      .from('todos')
      .delete()
      .eq('id', id);
  }

  // New Feature: Clear all completed todos
  clearCompletedTodos() {
    return this.supabase
      .from('todos')
      .delete()
      .eq('completed', true);
  }

  // Clean up the subscription when the service is destroyed
  ngOnDestroy() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }
  }
}
