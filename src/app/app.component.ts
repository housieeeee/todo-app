import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SupabaseService, Todo } from './services/supabase.service';
import { NotificationService } from './notification/notification.service';
import { NotificationComponent } from './notification/notification.component'; // Import NotificationComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationComponent // Add NotificationComponent to imports
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  todos: Todo[] = [];
  newTask: string = '';
  loading: boolean = true; // Start with loading true
  editingId: number | null = null;
  editingTask: string = '';

  private todosSubscription: Subscription | undefined;

  @ViewChild('editInput') editInput: ElementRef | undefined;

  constructor(
    private supabaseService: SupabaseService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to the real-time stream of todos
    this.todosSubscription = this.supabaseService.todos$.subscribe({
      next: (todos) => {
        this.todos = todos;
        this.loading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.show('Error loading todos. Please check the console.', 'error');
        console.error(err);
      }
    });

    // Initial fetch
    this.supabaseService.fetchTodos();
  }

  ngOnDestroy() {
    this.todosSubscription?.unsubscribe();
  }

  async addTodo() {
    if (!this.newTask.trim()) return;
    
    const { error } = await this.supabaseService.createTodo(this.newTask.trim());
    
    if (error) {
      this.notificationService.show('Failed to add todo.', 'error');
    } else {
      this.notificationService.show('Todo added successfully!');
      this.newTask = '';
    }
  }

  async toggleComplete(todo: Todo) {
    if (!todo.id) return;
    
    const { error } = await this.supabaseService.toggleComplete(todo.id, !todo.completed);
    
    if (error) {
      this.notificationService.show('Failed to update todo.', 'error');
    }
  }

  async deleteTodo(todoId: number) {
    const { error } = await this.supabaseService.deleteTodo(todoId);
    
    if (error) {
      this.notificationService.show('Failed to delete todo.', 'error');
    } else {
      this.notificationService.show('Todo deleted.');
    }
  }

  startEditing(todo: Todo) {
    this.editingId = todo.id || null;
    this.editingTask = todo.task;
    // Auto-focus the input field
    setTimeout(() => this.editInput?.nativeElement.focus(), 0);
  }

  cancelEditing() {
    this.editingId = null;
    this.editingTask = '';
  }

  async saveEdit(todoId: number) {
    if (!this.editingTask.trim() || !this.editingId) return;
    
    const { error } = await this.supabaseService.updateTodo(todoId, { task: this.editingTask.trim() });
    
    if (error) {
      this.notificationService.show('Failed to save edit.', 'error');
    } else {
      this.notificationService.show('Todo updated.');
      this.cancelEditing();
    }
  }

  async clearCompleted() {
    const { error } = await this.supabaseService.clearCompletedTodos();
    if (error) {
      this.notificationService.show('Failed to clear completed todos.', 'error');
    } else {
      this.notificationService.show('Completed todos cleared.');
    }
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id || index;
  }

  get completedTodosCount() {
    return this.todos.filter(todo => todo.completed).length;
  }
}
